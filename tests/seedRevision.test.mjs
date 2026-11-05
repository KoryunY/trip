import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';
import { newer } from '../shared/merge.js';

// Exercise the actual pure TypeScript helper on all supported Node versions.
const source = await readFile(new URL('../src/lib/seedRevision.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
});
const { rebaseLegacySeedRecord: rebase } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const oldData = { id: 'castle', title: 'Castle', start: '2026-11-14T12:15:00+01:00', people: ['koryun', 'alexey'], status: 'planned', notes: 'Old advice' };
const legacy = { col: 'events', id: 'castle', u: 1000, by: 'arto', data: oldData };
const winner = { ...legacy, rev: 5 };
const currentSeed = { col: 'events', id: 'castle', u: 0, by: 'seed', data: { ...oldData, start: '2026-11-16T12:15:00+01:00', people: ['koryun', 'alexey', 'arto'], mustDo: true } };
const manifest = [legacy];

test('rebases an exact saved correction and retains all winner metadata', () => {
  const result = rebase(winner, currentSeed, manifest);
  assert.deepEqual(result, { ...winner, data: currentSeed.data });
  assert.notStrictEqual(result, winner);
  assert.strictEqual(winner.data, oldData);
  assert.equal(winner.data.start, '2026-11-14T12:15:00+01:00');
});

test('an empty manifest and an absent winner do nothing', () => {
  assert.strictEqual(rebase(winner, currentSeed, []), winner);
  assert.equal(rebase(undefined, currentSeed, manifest), undefined);
});

test('preserves any newer timestamp, different author or changed payload', () => {
  const { notes: _notes, ...withoutNotes } = oldData;
  const edits = [
    { ...winner, u: winner.u + 1 },
    { ...winner, by: 'koryun' },
    { ...winner, data: { ...oldData, title: 'My castle plan' } },
    { ...winner, data: { ...oldData, people: ['alexey', 'koryun'] } },
    { ...winner, data: { ...oldData, status: 'confirmed' } },
    { ...winner, data: { ...oldData, mustDo: false } },
    { ...winner, data: withoutNotes },
  ];
  for (const edit of edits) assert.strictEqual(rebase(edit, currentSeed, manifest), edit);
});

test('preserves tombstones even if a manifest accidentally includes a deletion', () => {
  const deleted = { ...winner, data: null };
  assert.strictEqual(rebase(deleted, currentSeed, manifest), deleted);
  assert.strictEqual(rebase(deleted, currentSeed, [{ ...legacy, data: null }]), deleted);
});

test('removes an exact allowlisted record when its current seed no longer exists', () => {
  assert.deepEqual(rebase(winner, undefined, manifest), { ...winner, data: null });
});

test('preserves unknown IDs and refuses a seed from another record or collection', () => {
  const unknown = { ...winner, id: 'my-new-event' };
  assert.strictEqual(rebase(unknown, undefined, manifest), unknown);
  assert.strictEqual(rebase(winner, { ...currentSeed, id: 'another-event' }, manifest), winner);
  assert.strictEqual(rebase(winner, { ...currentSeed, col: 'tasks' }, manifest), winner);
  assert.strictEqual(rebase({ ...winner, col: 'tasks' }, undefined, manifest).data, oldData);
});

test('a newer pending edit or pending deletion wins before rebasing', () => {
  for (const pendingData of [{ ...oldData, notes: 'My newer note' }, null]) {
    const pending = { ...winner, u: 1001, data: pendingData };
    let selected;
    for (const item of [currentSeed, winner, pending]) {
      if (newer(item, selected)) selected = item;
    }
    assert.strictEqual(selected, pending);
    assert.strictEqual(rebase(selected, currentSeed, manifest), pending);
  }
});

test('payload key ordering is immaterial, but nested field edits are preserved', () => {
  const stored = { ...winner, data: { notes: oldData.notes, status: oldData.status, people: [...oldData.people], start: oldData.start, title: oldData.title, id: oldData.id } };
  assert.deepEqual(rebase(stored, currentSeed, manifest).data, currentSeed.data);
  const nestedLegacy = { ...legacy, data: { ...oldData, links: [{ label: 'Map', url: 'https://example.com' }] } };
  const edited = { ...nestedLegacy, data: { ...nestedLegacy.data, links: [{ label: 'My map', url: 'https://example.com' }] } };
  assert.strictEqual(rebase(edited, currentSeed, [nestedLegacy]), edited);
});
