// ===== Economy: currencies, inventory, reward granting, icons for any reward key =====
(function () {
  const D = RK.Data;
  const Eco = RK.Eco = {
    // Currency amount (eventDonut is per event)
    get(cur, ev) { const c = RK.Save.data.cur; if (cur === 'eventDonut') return c.eventDonut[ev || Eco.activeEventId()] || 0; return c[cur] || 0; },
    can(cur, n, ev) { return Eco.get(cur, ev) >= n; },
    spend(cur, n, ev) {
      if (!Eco.can(cur, n, ev)) return false;
      const c = RK.Save.data.cur;
      if (cur === 'eventDonut') { const e = ev || Eco.activeEventId(); c.eventDonut[e] -= n; } else c[cur] -= n;
      return true;
    },
    add(cur, n, ev) { const c = RK.Save.data.cur; if (cur === 'eventDonut') { const e = ev || Eco.activeEventId(); c.eventDonut[e] = (c.eventDonut[e] || 0) + n; } else c[cur] = (c[cur] || 0) + n; },
    activeEventId() { return RK.EventsSys ? RK.EventsSys.active().id : 'halloween'; },

    // Describe a reward key for display: {icon, name, tint}
    info(key) {
      if (D.currencies[key]) return { icon: D.currencies[key].icon, name: D.currencies[key].name, tint: D.currencies[key].tint };
      if (D.materials[key]) return { icon: D.materials[key].icon, name: D.materials[key].name };
      if (D.boosters[key]) return { icon: D.boosters[key].icon, name: D.boosters[key].name };
      if (D.traps[key]) return { icon: D.traps[key].asset, name: D.traps[key].nameTH };
      if (D.equipment[key]) return { icon: D.equipment[key].icon, name: D.equipment[key].name };
      if (D.costumes[key]) return { icon: 'ATK_DONUT_KUMA', name: 'ชุด ' + D.costumes[key].name, costume: key };
      if (D.characters[key]) return { icon: D.characters[key].asset, name: D.characters[key].nameTH };
      if (key.startsWith('FRAG_')) { const c = D.characters[key.slice(5)]; return { icon: c.asset, name: 'เศษ ' + c.nameTH, frag: true }; }
      if (key.startsWith('ZCARD_')) { const z = D.enemies[key.slice(6)]; return { icon: z.asset, name: 'การ์ด ' + z.nameTH }; }
      if (key === 'randomBox') return { icon: 'UI_ICON_MYSTERY_BOX', name: 'กล่องสุ่ม' };
      if (key === 'exp') return { icon: 'UI_ICON_EXP', name: 'EXP' };
      if (key === 'fragments') return { icon: 'UI_ICON_FRAGMENT', name: 'เศษตัวละคร' };
      return { icon: 'UI_ICON_QUESTION', name: key };
    },
    // Grant a reward object. Returns display list [{key, qty, icon, name}]. opts.event = event id for eventDonut
    grant(reward, opts) {
      opts = opts || {}; const sd = RK.Save.data, out = [];
      const push = (key, qty, extra) => out.push(Object.assign({ key, qty }, Eco.info(key), extra || {}));
      for (const key in reward) {
        let q = reward[key]; if (!q) continue;
        if (key === 'unlock' || key === 'materials') continue;
        if (key === 'exp') { Eco.addExp(q); push('exp', q); }
        else if (key === 'eventDonut') { Eco.add('eventDonut', q, opts.event); push('eventDonut', q); }
        else if (D.currencies[key]) { Eco.add(key, q); push(key, q); }
        else if (D.materials[key]) { sd.mats[key] = (sd.mats[key] || 0) + q; push(key, q); }
        else if (D.boosters[key]) { sd.boosters[key] = (sd.boosters[key] || 0) + q; push(key, q); }
        else if (D.traps[key]) { sd.traps[key] = (sd.traps[key] || 0) + q; push(key, q); }
        else if (D.equipment[key]) { sd.equipInv[key] = (sd.equipInv[key] || 0) + q; push(key, q); }
        else if (D.costumes[key]) { if (sd.costumes[key]) { Eco.add('gems', 30); push('gems', 30, { note: 'ชุดซ้ำ → เพชร' }); } else { sd.costumes[key] = true; push(key, 1); } }
        else if (D.characters[key]) out.push(...Eco.giveCharacter(key));
        else if (key.startsWith('FRAG_')) { const id = key.slice(5); sd.characters.fragments[id] = (sd.characters.fragments[id] || 0) + q; push(key, q); }
        else if (key.startsWith('ZCARD_')) { const id = key.slice(6); if (sd.zombies.owned[id]) { Eco.add('gold', 300); push('gold', 300, { note: 'การ์ดซ้ำ' }); } else { sd.zombies.owned[id] = true; push(key, 1, { isNew: true }); } }
        else if (key === 'fragments') {          // random fragments of characters the player can still grow
          const pool = Object.keys(D.characters).filter(id => id !== 'FACTORY');
          const id = pool[Math.floor(Math.random() * pool.length)];
          sd.characters.fragments[id] = (sd.characters.fragments[id] || 0) + q; push('FRAG_' + id, q);
        }
        else if (key === 'randomBox') { for (let i = 0; i < q; i++) out.push(...Eco.grant(Eco.rollBox())); }
      }
      if (reward.materials) out.push(...Eco.grant(reward.materials));
      if (reward.unlock) reward.unlock.forEach(id => { if (RK.Save.unlockCharacter(id)) push(id, 1, { isNew: true }); });
      return out;
    },
    giveCharacter(id) {
      const sd = RK.Save.data, c = D.characters[id];
      if (RK.Save.unlockCharacter(id)) { RK.Ev.emit('charUnlock', 1); return [Object.assign({ key: id, qty: 1, isNew: true }, Eco.info(id))]; }
      const n = D.dupeFragments[c.rarity] || 10;
      sd.characters.fragments[id] = (sd.characters.fragments[id] || 0) + n;
      return [Object.assign({ key: 'FRAG_' + id, qty: n, note: 'ตัวซ้ำ → เศษ' }, Eco.info('FRAG_' + id))];
    },
    rollBox() {
      const r = Math.random();
      if (r < 0.35) return { gold: 1500 }; if (r < 0.6) return { cookie: 15 }; if (r < 0.75) return { honey: 6 };
      if (r < 0.85) return { iron: 4 }; if (r < 0.93) return { crystal: 3 }; if (r < 0.98) return { tickets: 1 }; return { rainbow: 1 };
    },
    addExp(n) {
      const p = RK.Save.data.profile; p.exp += n;
      while (p.exp >= p.level * 100) { p.exp -= p.level * 100; p.level++; RK.UI && RK.UI.toast('Player Level Up! Lv.' + p.level); Eco.grant({ gems: 30 }); }
    },
    fmt(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K' : String(Math.floor(n)); }
  };
})();
