// ===== Event bus + Missions / Achievements / Daily Login / Pass / Events calendar (doc 15.11–15.14) =====
// RK.Ev.emit(stat, n) is called from real gameplay (kills, donut pickups, clears...). Progress never increases otherwise.
(function () {
  const D = RK.Data;
  const pad = n => String(n).padStart(2, '0');
  const dayKey = (d) => { d = d || new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const weekKey = (d) => { d = d ? new Date(d) : new Date(); const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() + '-W' + pad(Math.ceil(((t - y0) / 86400000 + 1) / 7)); };
  RK.Time = { dayKey, weekKey, now: () => new Date() };

  const Ev = RK.Ev = {
    ctx: {},           // battle context: { event: id } while in an event stage
    emit(stat, n) {
      n = n || 1; const sd = RK.Save.data; if (!sd) return;
      Missions.roll();
      sd.counters[stat] = (sd.counters[stat] || 0) + n;
      const bump = (bucket) => { bucket.p[stat] = (bucket.p[stat] || 0) + n; };
      bump(sd.missions.daily); bump(sd.missions.weekly);
      if (Ev.ctx.event) {
        const e = EventsSys.state(Ev.ctx.event); const map = { play: 'eventPlay', kill: 'eventKill', eventDonutPick: 'eventDonutPick' };
        if (map[stat]) e.p[map[stat]] = (e.p[map[stat]] || 0) + n;
      }
      if (stat === 'kill') sd.stats.zombiesKilled += n;
      if (stat === 'donut') sd.stats.donutsCollected += n;
    }
  };

  // Derived counters for story / challenge missions and achievements
  function statValue(stat) {
    const sd = RK.Save.data, c = sd.counters;
    switch (stat) {
      case 'stagesCompleted': return sd.stats.stagesCompleted;
      case 'charsOwned': return Object.keys(sd.characters.owned).length;
      case 'townsCleared': return D.towns.filter(t => sd.stages[`T${t.id}-S15`] && sd.stages[`T${t.id}-S15`].cleared).length;
      case 'totalStars': return RK.Save.totalStars();
      case 'playHours': return Math.floor(sd.stats.playTime / 3600);
      case 'endlessBest': return sd.endless.best;
      case 'threeStar': return Object.values(sd.stages).filter(s => s.stars && s.stars.every(Boolean)).length;
      case 'awakened': return Object.values(sd.characters.owned).filter(r => r.awakened).length;
      case 'kill': return sd.stats.zombiesKilled;
      case 'donut': return sd.stats.donutsCollected;
      default:
        if (stat.startsWith('townClear')) return RK.Save.clearedCount(+stat.slice(9));
        return c[stat] || 0;
    }
  }

  const Missions = RK.Missions = {
    statValue,
    roll() {     // reset daily / weekly buckets when the date changes (doc: check dates)
      const m = RK.Save.data.missions, dk = dayKey(), wk = weekKey();
      if (m.dayKey !== dk) { m.dayKey = dk; m.daily = { p: {}, c: {} }; }
      if (m.weekKey !== wk) { m.weekKey = wk; m.weekly = { p: {}, c: {} }; }
    },
    list(kind) {
      Missions.roll(); const sd = RK.Save.data, m = sd.missions;
      return D.missions[kind].map(x => {
        let prog, claimed;
        if (kind === 'daily' || kind === 'weekly') {
          const b = m[kind];
          prog = x.stat === 'dailyDone' ? Object.keys(m.daily.c).filter(k => k !== 'd_all').length : (b.p[x.stat] || 0);
          claimed = !!b.c[x.id];
        } else { prog = statValue(x.stat); claimed = !!m.claimed[x.id]; }
        return Object.assign({}, x, { prog: Math.min(prog, x.goal), done: prog >= x.goal, claimed });
      });
    },
    claim(kind, id) {
      const x = Missions.list(kind).find(q => q.id === id); if (!x || !x.done || x.claimed) return null;
      const m = RK.Save.data.missions;
      if (kind === 'daily' || kind === 'weekly') m[kind].c[id] = true; else m.claimed[id] = true;
      const got = RK.Eco.grant(x.reward); RK.Save.save('mission'); return got;
    },
    claimable() { return ['daily', 'weekly', 'story', 'challenge'].reduce((s, k) => s + Missions.list(k).filter(x => x.done && !x.claimed).length, 0) + Ach.claimable(); }
  };

  const Ach = RK.Ach = {
    list() {
      const sd = RK.Save.data;
      return D.achievements.map(a => {
        const v = statValue(a.stat), claimedTiers = sd.achievements[a.id] || 0, tier = Math.min(claimedTiers, a.tiers.length - 1);
        const goal = a.tiers[Math.min(claimedTiers, a.tiers.length - 1)];
        return Object.assign({}, a, { value: v, tier: claimedTiers, goal, maxed: claimedTiers >= a.tiers.length, done: claimedTiers < a.tiers.length && v >= goal, nextReward: a.reward(tier) });
      });
    },
    claim(id) {
      const a = Ach.list().find(x => x.id === id); if (!a || !a.done) return null;
      RK.Save.data.achievements[id] = a.tier + 1; const got = RK.Eco.grant(a.reward(a.tier)); RK.Save.save('achievement'); return got;
    },
    claimable() { return Ach.list().filter(a => a.done).length; }
  };

  const Login = RK.Login = {
    // Can claim once per calendar day; 7-day cycle (doc 15.11 — no claiming the same day twice)
    state() { const l = RK.Save.data.login, today = dayKey(); return { day: l.day % 7, canClaim: l.lastDate !== today, total: l.total, lastDate: l.lastDate }; },
    claim() {
      const l = RK.Save.data.login, today = dayKey();
      if (l.lastDate === today) return null;
      const idx = l.day % 7, got = RK.Eco.grant(D.dailyLogin[idx].reward);
      l.lastDate = today; l.day = (l.day + 1) % 7; l.total++; RK.Ev.emit('login', 1); RK.Save.save('login'); return { idx, got };
    }
  };

  const Pass = RK.Pass = {
    tier() { return Math.min(30, Math.floor((RK.Save.data.cur.passPts || 0) / D.pass.pointsPerTier)); },
    can(track, i) { const p = RK.Save.data.pass; if (i >= Pass.tier()) return false; if (track === 'prem' && !p.premium) return false; return !p[track].includes(i); },
    claim(track, i) { if (!Pass.can(track, i)) return null; RK.Save.data.pass[track].push(i); const got = RK.Eco.grant(D.pass[track === 'free' ? 'free' : 'premium'][i]); RK.Save.save('pass'); return got; },
    buyPremium() { const p = RK.Save.data.pass; if (p.premium) return false; if (!RK.Eco.spend('gems', D.pass.premiumPrice)) return false; p.premium = true; RK.Save.save('pass-premium'); return true; },
    claimable() { let n = 0; for (let i = 0; i < Pass.tier(); i++) { if (Pass.can('free', i)) n++; if (Pass.can('prem', i)) n++; } return n; }
  };

  // Events rotate weekly: each ISO week one of the 6 events is live (limited time); others are "upcoming".
  // Non-live events can be played as practice (no event rewards).
  const EventsSys = RK.EventsSys = {
    weekIndex(d) { d = d || new Date(); return Math.floor((d.getTime() / 86400000 + 3) / 7); },   // weeks since epoch (Thu-based)
    active(d) { return D.events[EventsSys.weekIndex(d) % D.events.length]; },
    endsAt(d) { d = d || new Date(); const w = EventsSys.weekIndex(d); return new Date(((w + 1) * 7 - 3) * 86400000); },
    startsAt(evId, d) { d = d || new Date(); const w = EventsSys.weekIndex(d), i = D.events.findIndex(e => e.id === evId), cur = w % D.events.length; let k = (i - cur + D.events.length) % D.events.length; return new Date(((w + k) * 7 - 3) * 86400000); },
    isActive(evId) { return EventsSys.active().id === evId; },
    state(evId) { const s = RK.Save.data.events; if (!s[evId]) s[evId] = { stages: {}, p: {}, c: {}, shop: {}, week: -1 };
      const st = s[evId], w = EventsSys.weekIndex(); if (EventsSys.isActive(evId) && st.week !== w) { st.week = w; st.p = {}; st.c = {}; st.shop = {}; } return st; },
    missions(evId) {
      const st = EventsSys.state(evId);
      return D.eventMissions.map(m => { const v = m.stat === 'eventHard' ? (st.stages[`EV-${evId}-5`] ? 1 : 0) : (st.p[m.stat] || 0); return Object.assign({}, m, { prog: Math.min(v, m.goal), done: v >= m.goal, claimed: !!st.c[m.id] }); });
    },
    claimMission(evId, id) { const m = EventsSys.missions(evId).find(x => x.id === id); if (!m || !m.done || m.claimed || !EventsSys.isActive(evId)) return null; EventsSys.state(evId).c[id] = true; const got = RK.Eco.grant(m.reward, { event: evId }); RK.Save.save('ev-mission'); return got; },
    shopItems(evId) {
      const ev = D.events.find(e => e.id === evId);
      return [{ type: 'costume', id: ev.costume, qty: 1, price: 600, cur: 'eventDonut', limit: 1 }, { type: 'character', id: 'FRAG_ANI_DEER', qty: 10, price: 400, cur: 'eventDonut', limit: 3 },
        { type: 'currency', id: 'gems', qty: 100, price: 250, cur: 'eventDonut', limit: 5 }, { type: 'currency', id: 'tickets', qty: 1, price: 200, cur: 'eventDonut', limit: 5 },
        { type: 'material', id: 'crystal', qty: 3, price: 150, cur: 'eventDonut', limit: 10 }, { type: 'zcard', id: 'ZCARD_' + ev.enemies[0], qty: 1, price: 300, cur: 'eventDonut', limit: 1 },
        { type: 'material', id: 'rainbow', qty: 1, price: 350, cur: 'eventDonut', limit: 3 }, { type: 'currency', id: 'gold', qty: 5000, price: 120, cur: 'eventDonut', limit: 10 }];
    }
  };
})();
