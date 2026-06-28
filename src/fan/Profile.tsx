// ═══════════════════════════════════════════════════════════
// Profile — the fan "passport". The persistent identity the prototype was
// missing: tier + XP that carry across matches and panels, the fan graph
// (panels joined), the captured interest, and the consent state. This is
// the screen that makes "retention + first-party data" tangible.
// ═══════════════════════════════════════════════════════════

import { tierFor, nextTier, useFan, signOut } from './identity';

export function Profile({ onClose }: { onClose: () => void }) {
  const fan = useFan();
  if (!fan) return null;
  const tier = tierFor(fan.xp);
  const next = nextTier(fan.xp);
  const pct = next ? Math.min(100, Math.round(((fan.xp - tier.min) / (next.min - tier.min)) * 100)) : 100;
  const initials = fan.name.replace(/[^a-zA-Z ]/g, '').slice(0, 2).toUpperCase() || 'YOU';

  return (
    <div className="profile" onClick={onClose}>
      <div className="profile__sheet" onClick={(e) => e.stopPropagation()}>
        <div className="profile__head">
          <div className="profile__avatar">{initials}</div>
          <div>
            <div className="profile__name">{fan.name}</div>
            <div className="profile__tier">
              <span className="profile__tierbadge">{tier.name}</span>
              {fan.guest && <span className="profile__guest">Guest</span>}
            </div>
          </div>
          <button className="profile__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="profile__xp">
          <div className="profile__xprow">
            <strong>{fan.xp.toLocaleString()} XP</strong>
            {next ? <span>{next.min - fan.xp} XP to {next.name}</span> : <span>Max tier</span>}
          </div>
          <div className="profile__bar">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="profile__stats">
          <div>
            <strong>{fan.panels.length}</strong>
            <span>FanZones joined</span>
          </div>
          <div>
            <strong>{Math.max(1, Math.round((Date.now() - fan.createdAt) / 86_400_000) + 1)}</strong>
            <span>days a member</span>
          </div>
          <div>
            <strong>{fan.optIn ? 'On' : 'Off'}</strong>
            <span>matchday updates</span>
          </div>
        </div>

        {fan.favorite && (
          <div className="profile__row">
            <span>Here for</span>
            <strong>{fan.favorite}</strong>
          </div>
        )}
        {fan.email && (
          <div className="profile__row">
            <span>Updates to</span>
            <strong>{fan.email}</strong>
          </div>
        )}

        <div className="profile__note">
          Your FanZone passport — it follows you to every match and every panel.
        </div>
        <button className="profile__signout" onClick={signOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}
