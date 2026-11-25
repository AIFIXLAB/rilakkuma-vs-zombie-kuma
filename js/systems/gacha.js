// ===== Gacha (doc 15.10): Single / Ten pull, drop rates shown, pity, duplicate conversion, history =====
(function () {
  const D = RK.Data;
  const rollRarity = (rates) => { let r = Math.random(), acc = 0; for (const k of ['Legend', 'Epic', 'Rare', 'Common']) { acc += rates[k]; if (r < acc) return k; } return 'Common'; };
  const Gacha = RK.Gacha = {
    banner(id) { return D.gachaBanners.find(b => b.id === id); },
    pool(b, rarity) {
      if (b.pool === 'characters') return Object.keys(D.characters).filter(id => id !== 'FACTORY' && D.characters[id].rarity === rarity);
      if (b.pool === 'zombies') return Object.keys(D.vsZombies).filter(id => D.zombieRarity(id) === rarity);
      if (b.pool === 'costumes') { const all = Object.keys(D.costumes).filter(k => k !== 'CS_DEFAULT'); return rarity === 'Legend' ? ['CS_GOLD', 'CS_SHADOW'] : rarity === 'Epic' ? ['CS_MIDNIGHT', 'CS_SAKURA', 'CS_OCEAN'] : all.filter(k => !['CS_GOLD', 'CS_SHADOW'].includes(k)); }
      return null;
    },
    // Rate table to show the player (doc: rates must be shown clearly)
    rateTable(b) {
      if (b.pool === 'materials') return [['ทอง 1,500', '30%'], ['คุกกี้ ×15', '25%'], ['น้ำผึ้ง ×6', '15%'], ['เหล็ก ×4', '10%'], ['คริสตัล ×3', '8%'], ['อุปกรณ์สุ่ม', '6%'], ['เศษตัวละคร ×5', '5%'], ['น้ำตาลรุ้ง', '1%']];
      const out = [];
      for (const r of ['Legend', 'Epic', 'Rare', 'Common']) {
        const p = Gacha.pool(b, r) || []; if (!p.length) continue;
        out.push([`${r} (${p.length} แบบ)`, (D.gachaRates[r] * 100).toFixed(1) + '%']);
      }
      if (b.rateUp) out.push(['Rate-Up: ' + b.rateUp.map(id => D.characters[id].name).join(', '), `${b.rateUpShare * 100}% ของระดับ`]);
      if (b.pity) out.push([`Pity: ครั้งที่ ${b.pity} การันตี Legend`, '']);
      out.push(['10 ครั้ง: การันตี Rare ขึ้นไป 1 ใบ', '']);
      return out;
    },
    cost(b, n) { return n === 10 ? b.cost10 : b.cost1; },
    canPay(b, n) {
      if (b.ticket && RK.Eco.get(b.ticket) >= n) return { cur: b.ticket, amt: n };
      const c = Gacha.cost(b, n); if (RK.Eco.get(b.currency) >= c) return { cur: b.currency, amt: c };
      return null;
    },
    pull(bannerId, n) {
      const b = Gacha.banner(bannerId), pay = Gacha.canPay(b, n); if (!pay) return null;
      RK.Eco.spend(pay.cur, pay.amt);
      const sd = RK.Save.data, results = [];
      sd.gacha.pity[b.id] = sd.gacha.pity[b.id] || 0;
      for (let i = 0; i < n; i++) {
        let rarity, item;
        if (b.pool === 'materials') {
          const r = Math.random(); const t = [[0.30, { gold: 1500 }], [0.55, { cookie: 15 }], [0.70, { honey: 6 }], [0.80, { iron: 4 }], [0.88, { crystal: 3 }], [0.94, 'eq'], [0.99, { fragments: 5 }], [1, { rainbow: 1 }]];
          let rw = t.find(x => r < x[0])[1];
          if (rw === 'eq') { const eqs = Object.keys(D.equipment).filter(k => D.equipment[k].price); rw = { [eqs[Math.floor(Math.random() * eqs.length)]]: 1 }; }
          rarity = rw.rainbow ? 'Legend' : rw.crystal || rw.fragments ? 'Epic' : 'Common';
          results.push({ rarity, got: RK.Eco.grant(rw) }); continue;
        }
        sd.gacha.pity[b.id]++;
        rarity = rollRarity(D.gachaRates);
        if (b.pity && sd.gacha.pity[b.id] >= b.pity) rarity = 'Legend';
        if (n === 10 && i === 9 && !results.some(r => r.rarity !== 'Common') && rarity === 'Common') rarity = 'Rare';
        if (rarity === 'Legend') sd.gacha.pity[b.id] = 0;
        let pool = Gacha.pool(b, rarity);
        if (!pool || !pool.length) { rarity = 'Rare'; pool = Gacha.pool(b, 'Rare'); }
        if (b.rateUp) { const up = b.rateUp.filter(id => D.characters[id].rarity === rarity); if (up.length && Math.random() < b.rateUpShare) pool = up; }
        item = pool[Math.floor(Math.random() * pool.length)];
        const key = b.pool === 'zombies' ? 'ZCARD_' + item : item;
        results.push({ rarity, id: item, got: RK.Eco.grant({ [key]: 1 }) });
      }
      results.forEach(r => sd.gacha.history.unshift({ t: Date.now(), banner: b.id, rarity: r.rarity, name: r.got.map(g => g.name + (g.qty > 1 ? ' ×' + g.qty : '')).join(', ') }));
      sd.gacha.history = sd.gacha.history.slice(0, 100);
      RK.Ev.emit('gacha', n); RK.Audio.play('gacha'); RK.Save.save('gacha');
      return results;
    }
  };
})();
