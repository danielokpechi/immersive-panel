// ═══════════════════════════════════════════════════════════
// FanGate — the value-first "join" moment. Captures a display name, an
// optional interest (first-party signal) and an email + marketing consent
// (the CRM hook). Skippable as a guest so the panel still works, but the
// fan is tracked either way. Shown once; after that the identity persists.
// ═══════════════════════════════════════════════════════════

import { useState } from 'react';
import type { SportPack } from '../types/panel';
import { createFan } from './identity';

export function FanGate({ pack, teamName }: { pack: SportPack; teamName: string }) {
  const [name, setName] = useState('');
  const [favorite, setFavorite] = useState('');
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(true);

  const join = () => createFan({ name, favorite, email, optIn });
  const guest = () => createFan({ guest: true });

  return (
    <div className="fangate">
      <div className="fangate__card">
        <div className="fangate__logo">{pack.emoji}</div>
        <div className="fangate__title">Join the {teamName} FanZone</div>
        <div className="fangate__sub">Earn XP, climb the ranks and unlock matchday rewards.</div>

        <label className="fangate__field">
          <span>Display name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" />
        </label>
        <label className="fangate__field">
          <span>Who are you here for? <em>(optional)</em></span>
          <input value={favorite} onChange={(e) => setFavorite(e.target.value)} placeholder="Favourite player or team" />
        </label>
        <label className="fangate__field">
          <span>Email for matchday updates <em>(optional)</em></span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" />
        </label>
        <label className="fangate__opt">
          <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
          <span>Send me drops, rewards and matchday news.</span>
        </label>

        <button className="fangate__join" onClick={join}>
          Join the FanZone →
        </button>
        <button className="fangate__skip" onClick={guest}>
          Continue as guest
        </button>
      </div>
    </div>
  );
}
