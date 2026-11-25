// ===== Shop (doc 15.9) & Gacha (doc 15.10) =====
(function () {
  const UI = RK.UI, A = RK.Assets, E = RK.Engine, D = RK.Data;
  const Scenes = RK.Scenes, R = Scenes.R;
  const TABS = ['donut', 'character', 'material', 'trap', 'costume', 'special'];
  const CHAR_PRICE = { Common: 300, Rare: 600, Epic: 1500, Legend: 3000 };

  // build the item list of a shop tab
  function items(tab) {
    const sd = RK.Save.data, shop = D.shop[tab];
    if (!shop.dynamic) return shop.items.map((it, i) => Object.assign({ key: tab + i }, it));
    if (shop.dynamic === 'characters') {
      const out = [];
      Object.keys(D.characters).filter(id => id !== 'FACTORY').forEach(id => {
        const c = D.characters[id];
        if (!RK.Save.isOwned(id)) out.push({ key: 'ch_' + id, type: 'character', id, qty: 1, price: CHAR_PRICE[c.rarity], cur: 'gems', limit: 1 });
        else out.push({ key: 'fr_' + id, type: 'fragment', id: 'FRAG_' + id, qty: 10, price: 800 + { Common: 0, Rare: 400, Epic: 1200, Legend: 2400 }[c.rarity], cur: 'gold', limit: 5, daily: true });
      });
      return out;
    }
    if (shop.dynamic === 'traps') return Object.keys(D.traps).map(id => ({ key: 'tr_' + id, type: 'trap', id, qty: D.traps[id].pack, price: D.traps[id].price, cur: 'gold', unlockTown: D.traps[id].unlock }));
    if (shop.dynamic === 'costumes') return Object.keys(D.costumes).filter(k => k !== 'CS_DEFAULT').map(k => ({ key: 'cs_' + k, type: 'costume', id: k, qty: 1, price: D.costumes[k].price, cur: 'gems', limit: 1, notForSale: D.costumes[k].price == null }));
    if (shop.dynamic === 'daily') {
      const dk = RK.Time.dayKey();
      if (sd.shop.dayKey !== dk) {   // new deals every day (doc: Special Shop)
        sd.shop.dayKey = dk; for (const k in sd.shop.bought) if (k.startsWith('sp_') || k.startsWith('fr_')) delete sd.shop.bought[k];
        let seed = dk.split('-').reduce((a, b) => a * 31 + +b, 7); const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
        const pool = [{ type: 'material', id: 'crystal', qty: 5, base: 1375, cur: 'gold' }, { type: 'material', id: 'honey', qty: 15, base: 1050, cur: 'gold' }, { type: 'currency', id: 'tickets', qty: 3, base: 450, cur: 'gems' },
          { type: 'material', id: 'rainbow', qty: 2, base: 240, cur: 'gems' }, { type: 'booster', id: 'BST_SKILL', qty: 3, base: 1050, cur: 'gold' }, { type: 'currency', id: 'zticket', qty: 3, base: 300, cur: 'gems' },
          { type: 'equipment', id: 'EQ_SHIELD', qty: 1, base: 1200, cur: 'gold' }, { type: 'material', id: 'recipe', qty: 6, base: 800, cur: 'gold' }, { type: 'trap', id: 'TRAP_BEAR_BITE', qty: 3, base: 720, cur: 'gold' }];
        const deals = []; while (deals.length < 6) { const p = pool[Math.floor(rnd() * pool.length)]; if (!deals.includes(p)) deals.push(p); }
        sd.shop.daily = deals.map((p, i) => ({ key: 'sp_' + i, type: p.type, id: p.id, qty: p.qty, price: Math.round(p.base * (0.5 + rnd() * 0.2)), was: p.base, cur: p.cur, limit: 1 }));
        RK.Save.save('daily-shop');
      }
      return sd.shop.daily;
    }
    return [];
  }
  function bought(it) { return RK.Save.data.shop.bought[it.key] || 0; }
  function buy(it, evId) {
    const sd = RK.Save.data;
    if (it.limit && bought(it) >= it.limit) return UI.toast('ซื้อครบจำนวนแล้ว');
    if (!RK.Eco.spend(it.cur, it.price, evId)) return UI.toast(`${RK.Eco.info(it.cur).name}ไม่พอ`);
    const key = it.type === 'fragment' || it.type === 'zcard' ? it.id : it.type === 'currency' || it.type === 'material' || it.type === 'booster' || it.type === 'trap' || it.type === 'equipment' || it.type === 'costume' || it.type === 'character' ? it.id : it.id;
    const got = it.type === 'character' ? RK.Eco.giveCharacter(it.id) : RK.Eco.grant({ [key]: it.qty }, { event: evId });
    if (evId) { const st = RK.EventsSys.state(evId); st.shop[it.key] = (st.shop[it.key] || 0) + 1; } else sd.shop.bought[it.key] = bought(it) + 1;
    RK.Ev.emit('shopBuy', 1); RK.Save.save('shop'); RK.Audio.play('buttonClick');
    UI.showRewards('ซื้อสำเร็จ!', got);
  }
  Scenes.buyItem = buy;
  Scenes.itemCard = function (ctx, it, r, owned, onTap, extra) {
    const inf = RK.Eco.info(it.type === 'character' ? it.id : it.id);
    UI.box(ctx, r.x, r.y, r.w, r.h, '#FFF9EE', it.type === 'character' ? UI.RAR[D.characters[it.id].rarity] : '#D9B98C', 18);
    const img = it.type === 'costume' ? A.skin('ATK_DONUT_KUMA', it.id) : A.tinted(inf.icon, inf.tint);
    A.fitImg(ctx, img, r.x + 30, r.y + 14, r.w - 60, r.h - 170, true);
    UI.text(ctx, (inf.name || '') + (it.qty > 1 ? ` ×${it.qty}` : ''), r.x + r.w / 2, r.y + r.h - 138, { size: 20, color: '#6B3F1C', outline: false, maxW: r.w - 16 });
    const desc = it.type === 'trap' ? D.traps[it.id].effect : it.type === 'equipment' ? D.equipment[it.id].desc : it.type === 'booster' ? D.boosters[it.id].desc : it.type === 'material' ? D.materials[it.id].desc : it.type === 'character' ? D.characters[it.id].role + ' · ' + D.characters[it.id].rarity : it.label || '';
    UI.text(ctx, desc, r.x + r.w / 2, r.y + r.h - 108, { size: 15, color: '#8B5A2B', outline: false, maxW: r.w - 16 });
    if (extra) UI.text(ctx, extra, r.x + r.w / 2, r.y + r.h - 82, { size: 15, color: '#A54FE0', outline: false, maxW: r.w - 16 });
    const lock = owned;
    const lab = lock || `${RK.Eco.fmt(it.price)}`;
    UI.btn(ctx, { x: r.x + 14, y: r.y + r.h - 68, w: r.w - 28, h: 58, label: lab, icon: lock ? null : RK.Eco.info(it.cur).icon, color: lock ? 'gray' : 'green', forcePill: true, size: 22, disabled: !!lock, why: lock }, onTap);
    if (it.was) { UI.text(ctx, `${it.was}`, r.x + r.w - 40, r.y + 22, { size: 16, color: '#B05050', outline: false }); ctx.strokeStyle = '#B05050'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(r.x + r.w - 64, r.y + 22); ctx.lineTo(r.x + r.w - 16, r.y + 22); ctx.stroke(); }
  };
  Scenes.confirmBuy = function (it, evId) {
    const inf = RK.Eco.info(it.id);
    UI.openModal({ title: 'ยืนยันการซื้อ', w: 820, h: 480, draw(ctx, b) {
      A.fitImg(ctx, it.type === 'costume' ? A.skin('ATK_DONUT_KUMA', it.id) : A.tinted(inf.icon, inf.tint), b.x + 50, b.y + 70, 220, 220, true);
      UI.text(ctx, inf.name + (it.qty > 1 ? ` ×${it.qty}` : ''), b.x + 300, b.y + 100, { size: 30, align: 'left', color: '#6B3F1C', outline: false, maxW: 480 });
      UI.text(ctx, `ราคา ${it.price.toLocaleString()} ${RK.Eco.info(it.cur).name}`, b.x + 300, b.y + 160, { size: 26, align: 'left', color: '#B05050', outline: false });
      UI.text(ctx, `มีอยู่ ${RK.Eco.fmt(RK.Eco.get(it.cur, evId))}`, b.x + 300, b.y + 205, { size: 22, align: 'left', color: '#9A6A3A', outline: false });
      if (it.limit) UI.text(ctx, `ซื้อได้อีก ${it.limit - (evId ? (RK.EventsSys.state(evId).shop[it.key] || 0) : bought(it))} ครั้ง`, b.x + 300, b.y + 250, { size: 22, align: 'left', color: '#9A6A3A', outline: false });
    }, buttons: [{ label: 'ยกเลิก' }, { label: 'ซื้อ', action: () => buy(it, evId) }] });
  };

  Scenes.shop = Scenes.make({
    init(a) { this.tab = a.tab || 0; },
    draw(ctx) {
      Scenes.frame(ctx, { title: 'ร้านค้า', cur: ['gold', 'gems', 'tickets'] });
      UI.tabs(ctx, TABS.map(t => D.shop[t].nameTH), this.tab, 30, 112, 1610, 62, i => { this.tab = i; this.page = 0; });
      const list = items(TABS[this.tab]), per = 8, sd = RK.Save.data;
      if (TABS[this.tab] === 'special') UI.text(ctx, 'ดีลพิเศษเปลี่ยนทุกวัน (ลด 30–50%) · จำกัด 1 ชิ้น', 836, 200, { size: 22, color: '#fff' });
      list.slice(this.page * per, this.page * per + per).forEach((it, i) => {
        const r = R(40 + (i % 4) * 402, 222 + Math.floor(i / 4) * 300, 388, 288);
        let lock = null;
        if (it.limit && bought(it) >= it.limit) lock = 'ซื้อแล้ว';
        if (it.notForSale) lock = 'กาชา/กิจกรรม';
        if (it.type === 'costume' && sd.costumes[it.id]) lock = 'มีแล้ว';
        if (it.unlockTown && !sd.towns.unlocked.includes(it.unlockTown)) lock = `ปลดล็อก Town ${it.unlockTown}`;
        const extra = it.type === 'trap' ? `ในกระเป๋า ${sd.traps[it.id] || 0} · วางใช้ ${D.traps[it.id].cost} โดนัท` : it.type === 'booster' ? `มี ${sd.boosters[it.id] || 0}` : it.type === 'equipment' ? `มี ${sd.equipInv[it.id] || 0}` : it.limit ? `จำกัด ${it.limit - bought(it)}/${it.limit}` : '';
        Scenes.itemCard(ctx, it, r, lock, () => Scenes.confirmBuy(it), extra);
      });
      UI.pager(ctx, this.page, Math.ceil(list.length / per), 836, 830, p => this.page = p);
      UI.text(ctx, 'เกมนี้ไม่มีการซื้อด้วยเงินจริง — เพชรได้จากด่าน ภารกิจ ความสำเร็จ และล็อกอิน', 836, 920, { size: 18, color: '#fff' });
    }
  });

  // ---------------- Gacha ----------------
  Scenes.gacha = Scenes.make({
    init(a) { this.tab = a.tab || 0; },
    pull(n) {
      const b = D.gachaBanners[this.tab], pay = RK.Gacha.canPay(b, n);
      if (!pay) return UI.toast('เพชร/ตั๋วไม่พอ');
      const res = RK.Gacha.pull(b.id, n); if (!res) return;
      const t0 = performance.now();
      UI.openModal({ title: n === 10 ? 'สุ่ม 10 ครั้ง!' : 'สุ่ม 1 ครั้ง!', w: 1500, h: 700, draw(ctx, bx) {
        const el = (performance.now() - t0) / 1000;
        res.forEach((r, i) => {
          const x = bx.x + 60 + (i % 5) * 280, y = bx.y + 70 + Math.floor(i / 5) * 270, k = Math.min(1, Math.max(0, el * 3 - i * 0.35));   // reveal animation
          const g = r.got[0] || {};
          ctx.save(); ctx.translate(x + 125, y + 120); ctx.scale(Math.max(0.01, Math.abs(Math.cos((1 - k) * Math.PI / 2))), 1);
          if (k < 0.5) { UI.box(ctx, -125, -120, 250, 240, '#8B5AA8', '#fff', 20); A.drawFit(ctx, 'UI_ICON_QUESTION', -60, -60, 120, 120); }
          else {
            UI.rarityFrame(ctx, -125, -120, 250, 240, r.rarity);
            if (r.rarity === 'Legend' || r.rarity === 'Epic') { ctx.fillStyle = r.rarity === 'Legend' ? 'rgba(255,200,40,0.35)' : 'rgba(170,90,230,0.3)'; ctx.beginPath(); ctx.arc(0, -20, 100, 0, Math.PI * 2); ctx.fill(); }
            const img = g.costume ? A.skin('ATK_DONUT_KUMA', g.costume) : A.tinted(g.icon, g.tint);
            A.fitImg(ctx, img, -95, -110, 190, 160, true);
            UI.text(ctx, (g.name || '') + (g.qty > 1 ? ' ×' + g.qty : ''), 0, 70, { size: 18, color: '#6B3F1C', outline: false, maxW: 236 });
            if (g.isNew) UI.text(ctx, 'NEW!', 85, -100, { size: 22, color: '#FF5E9A' });
            if (g.note) UI.text(ctx, g.note, 0, 94, { size: 14, color: '#A54FE0', outline: false });
          }
          ctx.restore();
        });
      }, buttons: [{ label: 'ตกลง', color: 'green', forcePill: true }, { label: 'สุ่มอีก', color: 'pink', forcePill: true, action: () => this.pull(n) }] });
    },
    draw(ctx) {
      const b = D.gachaBanners[this.tab], sd = RK.Save.data;
      Scenes.frame(ctx, { title: 'สุ่มกาชา', cur: ['gold', 'gems', 'tickets', 'zticket'] });
      UI.tabs(ctx, D.gachaBanners.map(x => x.nameTH), this.tab, 30, 112, 1610, 62, i => this.tab = i);
      UI.panel(ctx, 40, 200, 1000, 700, {});
      const bg = Scenes.blurBg('BG_SELECT_TOWN'); if (bg) { ctx.save(); UI.roundRect(ctx, 60, 220, 960, 520, 20); ctx.clip(); ctx.drawImage(bg, 60, 220, 960, 540); ctx.restore(); }
      const art = b.pool === 'characters' ? (b.rateUp || ['ANI_DEER', 'HW_ZAPPER_KUMA', 'ATK_CHOCO_KUMA']).map(id => D.characters[id].asset) : b.pool === 'zombies' ? ['BOSS_GIANT_ZOMBIE_KUMA', 'ZOM_SAMURAI', 'ZOM_GHOST'] : b.pool === 'costumes' ? null : ['UI_ICON_MYSTERY_BOX', 'UI_ICON_CRYSTAL', 'UI_ICON_RAINBOW_SUGAR'];
      if (art) art.forEach((a, i) => A.fitImg(ctx, A.get(a), 120 + i * 290, 260 + (i === 1 ? -20 : 20), 260, 400, true));
      else ['CS_GOLD', 'CS_SAKURA', 'CS_SHADOW'].forEach((c, i) => A.fitImg(ctx, A.skin(['ATK_DONUT_KUMA', 'ATK_DONUT_KORI', 'ATK_KITCHEN_07'][i], c), 120 + i * 290, 280, 260, 380, true));
      UI.text(ctx, b.nameTH, 540, 700, { size: 42, color: '#FFE14D' });
      UI.para(ctx, b.desc, 80, 760, 920, { size: 22 });
      if (b.pity) UI.text(ctx, `Pity: ${sd.gacha.pity[b.id] || 0}/${b.pity}`, 900, 250, { size: 24, color: '#FFE14D' });
      // pull panel
      UI.panel(ctx, 1060, 200, 580, 700, {});
      const tk = b.ticket ? RK.Eco.get(b.ticket) : 0;
      [[1, 'สุ่ม 1 ครั้ง', 'blue'], [10, 'สุ่ม 10 ครั้ง', 'pink']].forEach(([n, l, col], i) => {
        const y = 250 + i * 190, useT = b.ticket && tk >= n;
        UI.btn(ctx, { x: 1100, y, w: 500, h: 110, label: l, color: col, forcePill: true, size: 36 }, () => this.pull(n));
        A.drawFit(ctx, useT ? RK.Eco.info(b.ticket).icon : RK.Eco.info(b.currency).icon, 1180, y + 118, 44, 44);
        UI.text(ctx, useT ? `ตั๋ว ×${n}` : `${RK.Data.gachaBanners[this.tab][n === 10 ? 'cost10' : 'cost1'].toLocaleString()} ${RK.Eco.info(b.currency).name}`, 1240, y + 140, { size: 24, align: 'left', color: '#6B3F1C', outline: false });
      });
      UI.btn(ctx, { x: 1100, y: 650, w: 240, h: 76, label: 'อัตราสุ่ม', color: 'yellow', forcePill: true, size: 24 }, () => UI.openModal({ title: 'อัตราสุ่ม · ' + b.nameTH, w: 900, h: 640, draw(ctx, bx) {
        RK.Gacha.rateTable(b).forEach((r, i) => { UI.text(ctx, r[0], bx.x + 60, bx.y + 90 + i * 50, { size: 22, align: 'left', color: '#6B3F1C', outline: false, maxW: 600 }); UI.text(ctx, r[1], bx.x + bx.w - 60, bx.y + 90 + i * 50, { size: 24, align: 'right', color: '#B05050', outline: false }); });
        UI.text(ctx, 'ตัวซ้ำแปลงเป็นเศษ: Common 10 · Rare 20 · Epic 40 · Legend 80', bx.x + bx.w / 2, bx.y + bx.h - 140, { size: 20, color: '#9A6A3A', outline: false });
      }, buttons: [{ label: 'ปิด', color: 'green', forcePill: true }] }));
      UI.btn(ctx, { x: 1360, y: 650, w: 240, h: 76, label: 'ประวัติ', color: 'gray', forcePill: true, size: 24 }, () => UI.openModal({ title: 'ประวัติการสุ่ม', w: 1000, h: 760, draw(ctx, bx) {
        const h = sd.gacha.history.slice(0, 12);
        if (!h.length) UI.text(ctx, 'ยังไม่มีประวัติ', bx.x + bx.w / 2, bx.y + 200, { size: 26, color: '#9A6A3A', outline: false });
        h.forEach((x, i) => { const d = new Date(x.t); UI.text(ctx, `${d.toLocaleDateString('th-TH')} ${d.toLocaleTimeString('th-TH').slice(0, 5)}`, bx.x + 50, bx.y + 80 + i * 44, { size: 18, align: 'left', color: '#9A6A3A', outline: false }); UI.text(ctx, x.rarity, bx.x + 300, bx.y + 80 + i * 44, { size: 20, align: 'left', color: UI.RAR[x.rarity], outline: false }); UI.text(ctx, x.name, bx.x + 420, bx.y + 80 + i * 44, { size: 20, align: 'left', color: '#6B3F1C', outline: false, maxW: 520 }); });
      }, buttons: [{ label: 'ปิด', color: 'green', forcePill: true }] }));
      UI.text(ctx, b.ticket ? `ใช้ตั๋วก่อนอัตโนมัติ (มี ${tk})` : 'ตู้นี้ใช้ทอง', 1350, 790, { size: 20, color: '#9A6A3A', outline: false });
    }
  });
})();
