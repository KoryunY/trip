import { ArrowRight } from 'lucide-react';
import { Avatar } from '../components/ui';
import { Skyline } from '../components/Skyline';
import { setMe, useDB } from '../lib/store';

export function Login() {
  const db = useDB();
  return (
    <div className="login">
      <div className="login-hero">
        <div className="login-badge">13 – 22 NOV 2026</div>
        <h1>
          Prague
          <br />
          Crew
        </h1>
        <p>Map, plan, prep & live crew tracker for the three of us.</p>
        <Skyline className="login-skyline" />
      </div>
      <div className="login-body">
        <h2>Who’s holding this phone?</h2>
        <div className="login-people">
          {db.people.map((p) => (
            <button key={p.id} className="login-person" onClick={() => setMe(p.id)}>
              <Avatar person={p} size="lg" />
              <span className="grow">
                <span className="t">{p.name}</span>
                <span className="s">{p.from}</span>
              </span>
              <ArrowRight aria-hidden />
            </button>
          ))}
        </div>
        <p className="login-note">No passwords. Everyone sees and edits everything, and changes sync to the whole crew.</p>
      </div>
    </div>
  );
}
