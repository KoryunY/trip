import type { Collection, Presence, ServerDoc, StateResponse, SyncItem } from './types';
export declare const COLLECTIONS: Collection[];
export declare function itemKey(col: string, id: string): string;
export declare function emptyDoc(): ServerDoc;
export declare function newer(incoming: Pick<SyncItem, 'u' | 'by'>, existing?: Pick<SyncItem, 'u' | 'by'>): boolean;
export declare function sanitizeOps(raw: unknown): SyncItem[];
export declare function applyOps(doc: ServerDoc, ops: SyncItem[], now?: number): number;
export declare function sanitizePresence(raw: unknown): Presence | null;
export declare function docToResponse(doc: ServerDoc, backend: string): StateResponse;
