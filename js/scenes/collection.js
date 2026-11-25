// ===== Character Collection (15.6), Character Detail + Upgrade (15.7/15.8), Team Setup (15.5) =====
(function () {
  const UI = RK.UI, A = RK.Assets, E = RK.Engine, D = RK.Data, P = RK.Prog;
  const Scenes = RK.Scenes, R = Scenes.R;
  const ROLES = ['All', 'Attacker', 'Defender', 'Support', 'Producer', 'Special', 'Zombie'];
  const ROLE_TH = { All: 'ทั้งหมด', Attacker: 'โจมตี', Defender: 'ป้องกัน', Support: 'สนับสนุน', Producer: 'ผลิต', Special: 'พิเศษ', Zombie: 'ซอมบี้' };
  const RORDER = { Legend: 0, Epic: 1, Rare: 2, Common: 3 };
  const charList = role => Object.keys(D.characters).filter(id => role === 'All' || D.characters[id].role === role)
    .sort((a, b) => (RK.Save.isOwned(b) - RK.Save.isOwned(a)) || RORDER[D.characters[a].rarity] - RORDER[D.characters[b].rarity] || D.characters[a].cost - D.characters[b].cost);
  const unlockHow = id => { for (const k in D.stages) { const r = D.stages[k].reward; if (r && r.unlock && r.unlock.includes(id)) return `ผ่านด่าน ${k}`; } return 'สุ่มกาชา / ร้านตัวละคร / สะสมเศษ'; };
  Scenes.unlockHow = unlockHow;

  Scenes.collection = Scenes.make({
    init(a) { this.role = a.role || 0; },
    draw(ctx) {
      Scenes.frame(ctx, { title: this.args.upgrade ? 'อัปเกรดตัวละคร' : 'สะสมตัวละคร', cur: ['gold', 'gems', 'cookie'] });
      const sd = RK.Save.data, role = ROLES[this.role];
      UI.tabs(ctx, ROLES.map(r => ROLE_TH[r]), this.role, 40, 116, 1300, 60, i => { this.role = i; this.page = 0; });
      UI.btn(ctx, { x: 1360, y: 112, w: 280, h: 68, label: 'จัดทีม', icon: 'UI_ICON_FRIENDS', color: 'blue', forcePill: true, size: 26 }, () => E.setScene(Scenes.team, { back: Scenes.collection }));
      const per = 14;
      if (role === 'Zombie') {
        const ids = Object.keys(D.enemies).filter(id => !id.includes('__'));
        const seen = sd.zombies.seen, owned = sd.zombies.owned;
        UI.text(ctx, `พบแล้ว ${ids.filter(i => seen[i]).length}/${ids.length} · การ์ด VS ${Object.keys(owned).length}`, 836, 205, { size: 22, color: '#fff' });
        ids.slice(this.page * per, this.page * per + per).forEach((id, i) => {
          const e = D.enemies[id], r = R(40 + (i % 7) * 228, 230 + Math.floor(i / 7) * 290, 214, 276), known = seen[id] || owned[id];
          UI.rarityFrame(ctx, r.x, r.y, r.w, r.h, D.zombieRarity(id));
          A.fitImg(ctx, known ? A.get(e.asset) : A.silhouette(e.asset), r.x + 14, r.y + 10, r.w - 28, 180, true);
          UI.text(ctx, known ? e.nameTH : '???', r.x + r.w / 2, r.y + 210, { size: 18, color: '#6B3F1C', outline: false, maxW: r.w - 16 });
          UI.text(ctx, known ? e.role : 'ยังไม่พบ', r.x + r.w / 2, r.y + 234, { size: 15, color: '#9A6A3A', outline: false });
          if (owned[id]) A.drawFit(ctx, 'UI_ICON_TICKET_BEAR', r.x + r.w - 46, r.y + 6, 40, 40);
          UI.area(r, () => known ? Scenes.zombieInfo(id) : UI.toast('ยังไม่เคยพบซอมบี้ตัวนี้'));
        });
        UI.pager(ctx, this.page, Math.ceil(ids.length / per), 836, 830, p => this.page = p);
        return;
      }
      const ids = charList(role);
      UI.text(ctx, `มีแล้ว ${ids.filter(i => RK.Save.isOwned(i)).length}/${ids.length}`, 836, 205, { size: 22, color: '#fff' });
      ids.slice(this.page * per, this.page * per + per).forEach((id, i) => {
        const c = D.characters[id], own = RK.Save.isOwned(id), r = R(40 + (i % 7) * 228, 230 + Math.floor(i / 7) * 290, 214, 276);
        UI.rarityFrame(ctx, r.x, r.y, r.w, r.h, c.rarity);
        const rec = own ? RK.Save.char(id) : null, img = own ? A.skin(c.isFactory ? 'FACTORY_LV1' : c.asset, rec.costume) : A.silhouette(c.isFactory ? 'FACTORY_LV1' : c.asset);
        if (rec && rec.awakened) { ctx.fillStyle = 'rgba(255,215,60,0.35)'; ctx.beginPath(); ctx.ellipse(r.x + r.w / 2, r.y + 110, 90, 100, 0, 0, Math.PI * 2); ctx.fill(); }
        A.fitImg(ctx, img, r.x + 14, r.y + 10, r.w - 28, 170, true);
        UI.text(ctx, own ? c.nameTH : '???', r.x + r.w / 2, r.y + 200, { size: 18, color: '#6B3F1C', outline: false, maxW: r.w - 16 });
        if (own) {
          UI.text(ctx, `Lv.${rec.level}  ` + '★'.repeat(rec.star), r.x + r.w / 2, r.y + 228, { size: 17, color: '#E0A000', outline: false });
          const canUp = P.canLevel(id) === true || P.canStar(id) === true; if (canUp) A.drawFit(ctx, 'UI_ICON_UPGRADE', r.x + r.w - 44, r.y + 6, 38, 38);
        } else UI.text(ctx, unlockHow(id), r.x + r.w / 2, r.y + 228, { size: 13, color: '#9A6A3A', outline: false, maxW: r.w - 16 });
        const fr = sd.characters.fragments[id] || 0; if (fr) UI.text(ctx, `เศษ ${fr}`, r.x + 36, r.y + 20, { size: 14, color: '#A54FE0' });
        UI.area(r, () => { RK.Audio.play('buttonClick'); E.setScene(Scenes.detail, { id, list: ids, back: { scene: Scenes.collection, args: { role: this.role, upgrade: this.args.upgrade } } }); });
      });
      UI.pager(ctx, this.page, Math.ceil(ids.length / per), 836, 830, p => this.page = p);
    }
  });
  Scenes.zombieInfo = function (id) {
    const e = D.enemies[id], flags = [e.fly && 'บินได้', e.jump && 'กระโดดข้าม', e.heal && 'ฟื้นฟูพวก', e.summon && 'เรียกลูกน้อง', e.explode && 'ระเบิดเมื่อตาย', e.burrow && 'มุดดิน', e.split && 'แตกตัว', e.blink && 'หายตัว', e.slowAura && 'ออร่าช้า', e.isRanged || e.projectile ? 'ระยะไกล' : null].filter(Boolean);
    UI.openModal({ title: e.nameTH, w: 980, h: 560, draw(ctx, b) {
      A.fitImg(ctx, A.get(e.asset), b.x + 40, b.y + 60, 300, 340, true);
      const rows = [['ประเภท', e.role + (e.isBoss ? ' (บอส)' : '')], ['HP', e.hp + (e.armorHp ? ` + เกราะ ${e.armorHp}` : '') + (e.shieldHp ? ` + โล่ ${e.shieldHp}` : '')], ['ATK', e.atk], ['DEF', e.def || 0], ['ความเร็ว', e.speed + ' ช่อง/วิ'], ['ระยะ', e.range ? e.range + ' ช่อง' : 'ประชิด'], ['ความสามารถ', flags.join(', ') || '-']];
      rows.forEach((r, i) => { UI.text(ctx, r[0], b.x + 380, b.y + 90 + i * 44, { size: 22, align: 'left', color: '#9A6A3A', outline: false }); UI.text(ctx, String(r[1]), b.x + 540, b.y + 90 + i * 44, { size: 24, align: 'left', color: '#6B3F1C', outline: false, maxW: 400 }); });
      UI.text(ctx, e.desc || '', b.x + b.w / 2, b.y + 420, { size: 22, color: '#8B5A2B', outline: false, maxW: b.w - 60 });
      if (D.vsZombies[id]) UI.text(ctx, RK.Save.data.zombies.owned[id] ? `ใช้ใน VS ได้ · ค่า Brain ${D.vsZombies[id].brain}` : 'ปลดล็อกสำหรับ VS ได้จากตู้ซอมบี้', b.x + b.w / 2, b.y + 460, { size: 20, color: '#A54FE0', outline: false });
    }, buttons: [{ label: 'ปิด', color: 'green', forcePill: true }] });
  };

  // ---------------- Character detail + upgrade menu ----------------
  const UTABS = ['Level Up', 'Star', 'Skill', 'Upgrade Mode', 'Awakening', 'Equipment', 'Costume'];
  Scenes.detail = Scenes.make({
    init(a) { this.id = a.id; this.tab = a.tab || 0; this.cpage = 0; },
    confirm(title, before, after, cost, fn) {
      UI.openModal({ title, w: 900, h: 520, draw(ctx, b) {
        UI.text(ctx, 'ค่าปัจจุบัน → หลังอัปเกรด', b.x + b.w / 2, b.y + 80, { size: 24, color: '#9A6A3A', outline: false });
        before.forEach((r, i) => UI.text(ctx, `${r[0]}: ${r[1]}  →  ${after[i][1]}`, b.x + b.w / 2, b.y + 125 + i * 38, { size: 26, color: '#6B3F1C', outline: false }));
        UI.text(ctx, 'ใช้: ' + Scenes.costText(cost), b.x + b.w / 2, b.y + b.h - 150, { size: 24, color: '#B05050', outline: false });
      }, buttons: [{ label: 'ยกเลิก' }, { label: 'ยืนยัน', color: 'green', forcePill: true, action: () => { if (fn()) UI.toast('อัปเกรดสำเร็จ!'); } }] });
    },
    statRows(st) { return [['HP', st.hp], ['ATK', st.atk], ['DEF', st.def], ['พลัง', st.power]]; },
    draw(ctx) {
      const id = this.id, c = D.characters[id], own = RK.Save.isOwned(id), sd = RK.Save.data;
      const back = this.args.back || { scene: Scenes.collection, args: {} };
      Scenes.frame(ctx, { title: c.nameTH, back: () => E.setScene(back.scene, back.args), cur: ['gold', 'gems', 'cookie', 'crystal'] });
      const list = this.args.list || [id], idx = list.indexOf(id);
      UI.btn(ctx, { x: 20, y: 440, w: 70, h: 90, label: '◀', color: 'blue', forcePill: true, disabled: idx <= 0 }, () => { this.id = list[idx - 1]; });
      UI.btn(ctx, { x: 560, y: 440, w: 70, h: 90, label: '▶', color: 'blue', forcePill: true, disabled: idx >= list.length - 1 }, () => { this.id = list[idx + 1]; });
      // ---- left: art & identity ----
      UI.panel(ctx, 100, 120, 450, 780, {});
      const rec = own ? RK.Save.char(id) : RK.Save._freshChar();
      const st = P.stats(id, rec);
      if (rec.awakened) { ctx.fillStyle = `rgba(255,215,60,${0.3 + Math.sin(this.t * 3) * 0.1})`; ctx.beginPath(); ctx.ellipse(325, 340, 190, 210, 0, 0, Math.PI * 2); ctx.fill(); }
      A.fitImg(ctx, own ? A.skin(c.isFactory ? 'FACTORY_LV1' : c.asset, rec.costume) : A.silhouette(c.isFactory ? 'FACTORY_LV1' : c.asset), 140, 150, 370, 380, true);
      UI.box(ctx, 130, 545, 390, 40, UI.RAR[c.rarity], null, 20); UI.text(ctx, `${c.rarity} · ${c.role}${c.kind ? ' · ' + c.kind : ''}`, 325, 565, { size: 20, maxW: 370 });
      UI.text(ctx, c.name, 325, 610, { size: 26, color: '#6B3F1C', outline: false, maxW: 400 });
      UI.text(ctx, own ? `Lv.${rec.level}/${P.maxLevel(rec.star)}  ${'★'.repeat(rec.star)}${'☆'.repeat(6 - rec.star)}` : 'ยังไม่ปลดล็อก', 325, 650, { size: 26, color: '#E0A000', outline: false });
      UI.para(ctx, c.description, 135, 690, 380, { size: 19 });
      UI.text(ctx, `เศษตัวละคร: ${sd.characters.fragments[id] || 0}`, 325, 860, { size: 20, color: '#A54FE0', outline: false });
      // ---- middle: stats (doc 15.7) ----
      UI.panel(ctx, 570, 120, 500, 780, { });
      const rows = [['HP', st.hp], ['ATK', st.atk], ['DEF', st.def], ['ความเร็วโจมตี', st.attackSpeed ? st.attackSpeed.toFixed(2) + ' วิ' : '-'], ['ระยะ', st.range ? st.range.toFixed(1) + ' ช่อง' : '-'],
        ['Cost', st.cost + ' โดนัท'], ['Cooldown', st.cooldown.toFixed(0) + ' วิ'], ['Skill', `${c.skill.name} Lv.${rec.skill}`], ['Passive', c.passive || '-'],
        ['Upgrade Branch', rec.branch >= 0 ? c.branches[rec.branch].name : 'ยังไม่เลือก (ดาว 3)'], ['อุปกรณ์', rec.equip ? D.equipment[rec.equip].name : '-'], ['ชุด', D.costumes[rec.costume || 'CS_DEFAULT'].name], ['พลังรวม', st.power]];
      rows.forEach((r, i) => { const y = 150 + i * 56; UI.text(ctx, r[0], 600, y + 20, { size: 20, align: 'left', color: '#9A6A3A', outline: false }); UI.text(ctx, String(r[1]), 1040, y + 20, { size: 22, align: 'right', color: '#6B3F1C', outline: false, maxW: 260 }); ctx.fillStyle = '#EAD7B8'; ctx.fillRect(600, y + 44, 440, 2); });
      UI.text(ctx, c.skill.desc, 820, 885, { size: 16, color: '#9A6A3A', outline: false, maxW: 470 });
      // ---- right: upgrade menu (doc 15.8) ----
      UI.panel(ctx, 1090, 120, 560, 780, {});
      if (!own) {
        UI.text(ctx, 'ยังไม่มีตัวละครนี้', 1370, 300, { size: 32, color: '#B05050', outline: false });
        UI.text(ctx, 'วิธีปลดล็อก: ' + unlockHow(id), 1370, 360, { size: 20, color: '#6B3F1C', outline: false, maxW: 500 });
        const need = 10, f = sd.characters.fragments[id] || 0;
        UI.text(ctx, `หรือใช้เศษ ${need} ชิ้น (มี ${f})`, 1370, 420, { size: 22, color: '#A54FE0', outline: false });
        UI.btn(ctx, { x: 1200, y: 470, w: 340, h: 84, label: 'ปลดล็อกด้วยเศษ', color: 'purple', forcePill: true, disabled: f < need, why: 'เศษไม่พอ' }, () => { sd.characters.fragments[id] -= need; RK.Save.unlockCharacter(id); RK.Save.save('frag-unlock'); UI.showRewards('ปลดล็อกตัวละคร!', [Object.assign({ key: id, qty: 1, isNew: true }, RK.Eco.info(id))]); });
        UI.btn(ctx, { x: 1200, y: 580, w: 340, h: 84, label: 'ไปร้านตัวละคร', color: 'pink', forcePill: true }, () => E.setScene(Scenes.shop, { tab: 1 }));
        return;
      }
      for (let i = 0; i < UTABS.length; i++) UI.btn(ctx, { x: 1110 + (i % 4) * 132, y: 140 + Math.floor(i / 4) * 66, w: 126, h: 58, label: UTABS[i], color: this.tab === i ? 'pink' : 'gray', forcePill: true, size: 17 }, () => { this.tab = i; this.cpage = 0; });
      const X = 1120, Y = 290, Wd = 500, fmt = s => s.map(r => `${r[0]} ${r[1]}`).join(' · ');
      const actBtn = (label, ok, fn) => UI.btn(ctx, { x: X + 80, y: 790, w: 340, h: 90, label, color: 'green', forcePill: label !== 'อัปเกรด', disabled: ok !== true, why: ok }, fn);
      if (this.tab === 0) {
        const nextRec = Object.assign({}, rec, { level: rec.level + 1 }), after = P.stats(id, nextRec), cost = P.levelCost(rec.level), ok = P.canLevel(id);
        UI.text(ctx, `Level ${rec.level} → ${Math.min(rec.level + 1, P.maxLevel(rec.star))}  (สูงสุด ${P.maxLevel(rec.star)})`, X + Wd / 2, Y + 20, { size: 26, color: '#6B3F1C', outline: false });
        this.statRows(st).forEach((r, i) => UI.text(ctx, `${r[0]}  ${r[1]}  →  ${this.statRows(after)[i][1]}`, X + Wd / 2, Y + 80 + i * 44, { size: 24, color: '#3E9A2B', outline: false }));
        UI.text(ctx, 'วัสดุที่ต้องใช้', X + Wd / 2, Y + 280, { size: 20, color: '#9A6A3A', outline: false });
        Object.keys(cost).filter(k => cost[k]).forEach((k, i) => { UI.item(ctx, k, cost[k], X + 60 + i * 130, Y + 300, 110); const have = k === 'gold' ? sd.cur.gold : sd.mats[k] || 0; UI.text(ctx, `มี ${RK.Eco.fmt(have)}`, X + 115 + i * 130, Y + 430, { size: 17, color: have >= cost[k] ? '#3E9A2B' : '#D33', outline: false }); });
        actBtn('อัปเกรด', ok, () => this.confirm('Level Up', this.statRows(st), this.statRows(after), cost, () => P.doLevel(id)));
      } else if (this.tab === 1) {
        const ok = P.canStar(id), cost = rec.star < 6 ? P.starCost(rec.star) : {}, after = P.stats(id, Object.assign({}, rec, { star: Math.min(6, rec.star + 1) }));
        UI.text(ctx, `Star Evolution ★${rec.star} → ★${Math.min(6, rec.star + 1)}`, X + Wd / 2, Y + 20, { size: 26, color: '#6B3F1C', outline: false });
        UI.text(ctx, `สถานะ +12% · เลเวลสูงสุด ${P.maxLevel(rec.star)} → ${P.maxLevel(Math.min(6, rec.star + 1))}`, X + Wd / 2, Y + 70, { size: 20, color: '#3E9A2B', outline: false });
        const f = sd.characters.fragments[id] || 0;
        Scenes.progressBar(ctx, X + 40, Y + 110, Wd - 80, 34, cost.frag ? f / cost.frag : 1, '#B98BF2'); UI.text(ctx, `เศษ ${f}/${cost.frag || '-'}`, X + Wd / 2, Y + 127, { size: 20 });
        UI.text(ctx, 'ใช้: ' + Scenes.costText(cost), X + Wd / 2, Y + 190, { size: 20, color: '#B05050', outline: false, maxW: Wd - 20 });
        UI.text(ctx, 'หาเศษได้จาก: ผ่านด่าน, กาชา (ตัวซ้ำ), ร้านตัวละคร', X + Wd / 2, Y + 240, { size: 18, color: '#9A6A3A', outline: false });
        actBtn('วิวัฒนาการ ★', ok, () => this.confirm('Star Evolution', this.statRows(st), this.statRows(after), cost, () => P.doStar(id)));
      } else if (this.tab === 2) {
        const ok = P.canSkill(id), cost = P.skillCost(rec.skill);
        UI.text(ctx, `${c.skill.name}  Lv.${rec.skill} → ${Math.min(5, rec.skill + 1)}`, X + Wd / 2, Y + 20, { size: 26, color: '#6B3F1C', outline: false });
        UI.para(ctx, c.skill.desc + ' และ ATK +5% ต่อเลเวลสกิล', X + 20, Y + 70, Wd - 40, { size: 20 });
        for (let s = 1; s <= 5; s++) A.drawFit(ctx, s <= rec.skill ? 'UI_ICON_STAR' : 'UI_ICON_STAR_BRONZE', X + 60 + (s - 1) * 80, Y + 160, 64, 64);
        UI.text(ctx, 'ใช้: ' + Scenes.costText(cost) + ' · ต้องมีดาว ≥ เลเวลสกิล', X + Wd / 2, Y + 270, { size: 18, color: '#B05050', outline: false, maxW: Wd - 20 });
        actBtn('อัปสกิล', ok, () => this.confirm('Skill Upgrade', [['Skill', 'Lv.' + rec.skill]], [['Skill', 'Lv.' + (rec.skill + 1)]], cost, () => P.doSkill(id)));
      } else if (this.tab === 3) {
        UI.text(ctx, 'Upgrade Mode — เลือก 1 สาย (ปลดล็อกที่ ★3)', X + Wd / 2, Y + 10, { size: 22, color: '#6B3F1C', outline: false });
        c.branches.forEach((br, i) => {
          const r = R(X + 10, Y + 40 + i * 140, Wd - 20, 128), on = rec.branch === i;
          UI.box(ctx, r.x, r.y, r.w, r.h, on ? '#FFE9F3' : '#FFF9EE', on ? '#FF7FB0' : '#D9B98C');
          UI.text(ctx, br.name, r.x + 20, r.y + 32, { size: 26, align: 'left', color: on ? '#FF5E9A' : '#6B3F1C', outline: false });
          UI.text(ctx, br.desc, r.x + 20, r.y + 76, { size: 20, align: 'left', color: '#8B5A2B', outline: false, maxW: r.w - 200 });
          const ok = P.canBranch(id, i);
          UI.btn(ctx, { x: r.x + r.w - 170, y: r.y + 28, w: 160, h: 70, label: on ? 'ใช้อยู่' : 'เลือก', color: on ? 'pink' : 'green', forcePill: true, disabled: ok !== true, why: ok, size: 22 },
            () => { const after = P.stats(id, Object.assign({}, rec, { branch: i })); this.confirm('เลือกสาย ' + br.name, this.statRows(st), this.statRows(after), P.branchCost(), () => P.doBranch(id, i)); });
        });
        UI.text(ctx, 'ค่าเปลี่ยนสาย: ' + Scenes.costText(P.branchCost()), X + Wd / 2, Y + 470, { size: 18, color: '#B05050', outline: false });
      } else if (this.tab === 4) {
        const ok = P.canAwaken(id), cost = P.awakenCost(), after = P.stats(id, Object.assign({}, rec, { awakened: true }));
        UI.text(ctx, rec.awakened ? 'Awakening สำเร็จแล้ว ✨' : 'Awakening — ปลุกพลังสูงสุด', X + Wd / 2, Y + 20, { size: 26, color: rec.awakened ? '#E0A000' : '#6B3F1C', outline: false });
        UI.text(ctx, 'สถานะทั้งหมด ×1.25 + ออร่าทองในสนาม', X + Wd / 2, Y + 70, { size: 20, color: '#3E9A2B', outline: false });
        UI.text(ctx, 'เงื่อนไข: ★6 และ Lv.40', X + Wd / 2, Y + 110, { size: 20, color: '#9A6A3A', outline: false });
        Object.keys(cost).forEach((k, i) => UI.item(ctx, k, cost[k], X + 70 + i * 130, Y + 150, 110));
        if (!rec.awakened) actBtn('Awakening', ok, () => this.confirm('Awakening', this.statRows(st), this.statRows(after), cost, () => P.doAwaken(id)));
      } else if (this.tab === 5) {
        UI.text(ctx, 'อุปกรณ์ (1 ช่อง)', X + Wd / 2, Y + 10, { size: 24, color: '#6B3F1C', outline: false });
        const eqs = Object.keys(D.equipment);
        eqs.forEach((k, i) => {
          const e = D.equipment[k], n = sd.equipInv[k] || 0, on = rec.equip === k, r = R(X + 10 + (i % 2) * 245, Y + 40 + Math.floor(i / 2) * 110, 235, 100);
          UI.box(ctx, r.x, r.y, r.w, r.h, on ? '#FFE9F3' : '#FFF9EE', on ? '#FF7FB0' : UI.RAR[e.rarity]);
          A.drawFit(ctx, e.icon, r.x + 8, r.y + 12, 70, 70);
          UI.text(ctx, e.name, r.x + 84, r.y + 28, { size: 18, align: 'left', color: '#6B3F1C', outline: false, maxW: 145 });
          UI.text(ctx, e.desc, r.x + 84, r.y + 56, { size: 15, align: 'left', color: '#8B5A2B', outline: false, maxW: 145 });
          UI.text(ctx, on ? 'สวมอยู่' : `มี ${n}`, r.x + 84, r.y + 82, { size: 15, align: 'left', color: on ? '#FF5E9A' : '#9A6A3A', outline: false });
          UI.area(r, () => { if (on) { P.equip(id, null); UI.toast('ถอดอุปกรณ์แล้ว'); } else if (n > 0) { P.equip(id, k); UI.toast('สวมอุปกรณ์แล้ว'); } else UI.toast('ไม่มีอุปกรณ์นี้ — ซื้อที่ร้านวัตถุดิบ / ตู้วัตถุดิบ'); });
        });
      } else {
        UI.text(ctx, 'ชุดแต่งตัว (เปลี่ยนสีภาพตัวละคร)', X + Wd / 2, Y + 10, { size: 24, color: '#6B3F1C', outline: false });
        Object.keys(D.costumes).forEach((k, i) => {
          const cs = D.costumes[k], have = sd.costumes[k], on = (rec.costume || 'CS_DEFAULT') === k, r = R(X + 10 + (i % 4) * 122, Y + 40 + Math.floor(i / 4) * 200, 114, 190);
          UI.box(ctx, r.x, r.y, r.w, r.h, on ? '#FFE9F3' : '#FFF9EE', on ? '#FF7FB0' : UI.RAR[cs.rarity]);
          A.fitImg(ctx, have ? A.skin(c.isFactory ? 'FACTORY_LV1' : c.asset, k) : A.silhouette(c.asset), r.x + 8, r.y + 8, r.w - 16, 130, true);
          UI.text(ctx, cs.name, r.x + r.w / 2, r.y + 152, { size: 15, color: '#6B3F1C', outline: false, maxW: r.w - 8 });
          UI.text(ctx, have ? (on ? 'ใส่อยู่' : 'แตะเพื่อใส่') : 'ยังไม่มี', r.x + r.w / 2, r.y + 174, { size: 13, color: have ? '#3E9A2B' : '#9A6A3A', outline: false });
          UI.area(r, () => { if (have) P.setCostume(id, k); else UI.toast('ซื้อชุดได้ที่ร้านชุดแต่งตัว / ตู้ชุด / กิจกรรม'); });
        });
      }
    }
  });

  // ---------------- Team Setup (doc 15.5) ----------------
  Scenes.team = Scenes.make({
    init(a) { this.role = 0; this.slotSel = -1; },
    draw(ctx) {
      const sd = RK.Save.data, T = sd.teams, pr = T.presets[T.active];
      Scenes.frame(ctx, { title: 'จัดทีม', back: () => E.setScene(this.args.back || Scenes.collection, this.args.backArgs) });
      UI.tabs(ctx, T.presets.map(p => p.name), T.active, 200, 112, 1270, 60, i => { T.active = i; this.slotSel = -1; RK.Save.save('team'); });
      UI.btn(ctx, { x: 1490, y: 108, w: 160, h: 66, label: 'เปลี่ยนชื่อ', color: 'blue', forcePill: true, size: 20 }, () => UI.textInput({ title: 'ชื่อทีม', value: pr.name, max: 16 }, v => { if (v && v.trim()) { pr.name = v.trim(); RK.Save.save('team-name'); } }));
      // slots
      UI.panel(ctx, 40, 190, 1600, 300, {});
      const mem = pr.members.filter(id => RK.Save.isOwned(id));
      UI.text(ctx, `เครื่องผลิตโดนัทอยู่ในทีมเสมอ · สมาชิก ${mem.length}/8 · พลังทีม ${RK.Prog.teamPower(mem)}`, 836, 220, { size: 22, color: '#6B3F1C', outline: false });
      for (let i = 0; i < 8; i++) {
        const id = mem[i], r = R(70 + i * 196, 245, 184, 228);
        UI.box(ctx, r.x, r.y, r.w, r.h, this.slotSel === i ? '#FFE9F3' : '#FFF9EE', this.slotSel === i ? '#FF7FB0' : '#D9B98C', 18);
        if (id) {
          const c = D.characters[id], st = RK.Prog.stats(id);
          A.fitImg(ctx, A.skin(c.asset, st.costume), r.x + 12, r.y + 8, r.w - 24, 130, true);
          UI.text(ctx, c.nameTH, r.x + r.w / 2, r.y + 152, { size: 16, color: '#6B3F1C', outline: false, maxW: r.w - 10 });
          UI.text(ctx, `HP ${st.hp} ATK ${st.atk}`, r.x + r.w / 2, r.y + 176, { size: 13, color: '#8B5A2B', outline: false });
          UI.text(ctx, `DEF ${st.def} R ${st.range ? st.range.toFixed(1) : '-'} · ${c.cost}🍩`, r.x + r.w / 2, r.y + 196, { size: 13, color: '#8B5A2B', outline: false });
          UI.text(ctx, `Lv.${st.level} ★${st.star}`, r.x + r.w / 2, r.y + 216, { size: 14, color: '#E0A000', outline: false });
        } else UI.text(ctx, '+', r.x + r.w / 2, r.y + r.h / 2, { size: 60, color: '#D9B98C', outline: false });
        UI.area(r, () => {
          if (this.slotSel === -1) { if (id) this.slotSel = i; return; }
          if (this.slotSel === i) { pr.members = mem.filter((_, k) => k !== i); this.slotSel = -1; RK.Save.save('team'); UI.toast('ถอดออกจากทีมแล้ว'); return; }
          if (id) { const a = mem.slice(); [a[i], a[this.slotSel]] = [a[this.slotSel], a[i]]; pr.members = a; RK.Save.save('team'); }   // swap positions
          this.slotSel = -1;
        });
      }
      UI.text(ctx, 'แตะช่อง 1 ครั้ง = เลือก, แตะช่องอื่น = สลับตำแหน่ง, แตะซ้ำ = ถอดออก', 836, 500, { size: 18, color: '#fff' });
      // roster
      UI.tabs(ctx, ['ทั้งหมด', 'โจมตี', 'ป้องกัน', 'สนับสนุน', 'ผลิต', 'พิเศษ'], this.role, 40, 520, 1100, 54, i => { this.role = i; this.page = 0; });
      const role = ROLES[this.role], ids = charList(role).filter(id => id !== 'FACTORY' && RK.Save.isOwned(id)), per = 9;
      ids.slice(this.page * per, this.page * per + per).forEach((id, i) => {
        const c = D.characters[id], st = RK.Prog.stats(id), inTeam = mem.includes(id), r = R(40 + i * 178, 590, 168, 200);
        UI.rarityFrame(ctx, r.x, r.y, r.w, r.h, c.rarity);
        A.fitImg(ctx, A.skin(c.asset, st.costume), r.x + 10, r.y + 6, r.w - 20, 130, true);
        UI.text(ctx, c.nameTH, r.x + r.w / 2, r.y + 150, { size: 15, color: '#6B3F1C', outline: false, maxW: r.w - 10 });
        if (inTeam) { ctx.fillStyle = 'rgba(80,60,50,0.45)'; UI.roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 14); ctx.fill(); A.drawFit(ctx, 'UI_ICON_CHECK', r.x + r.w - 46, r.y + 4, 42, 42); }
        UI.area(r, () => { if (inTeam) pr.members = mem.filter(x => x !== id); else if (mem.length < 8) pr.members = mem.concat([id]); else UI.toast('ทีมเต็ม 8 ตัวแล้ว'); RK.Save.save('team'); });
      });
      UI.pager(ctx, this.page, Math.ceil(ids.length / per), 1400, 530, p => this.page = p);
      const valid = mem.some(id => D.characters[id].atk > 0);
      UI.text(ctx, valid ? '✓ ทีมพร้อมใช้งาน' : '⚠ ทีมต้องมีตัวโจมตีอย่างน้อย 1 ตัว', 836, 830, { size: 26, color: valid ? '#8BE05F' : '#FF6B6B' });
      UI.btn(ctx, { x: 1300, y: 810, w: 330, h: 90, label: 'ใช้ทีมนี้', color: 'green', forcePill: true, disabled: !valid, why: 'ทีมต้องมีตัวโจมตี' }, () => E.setScene(this.args.back || Scenes.collection, this.args.backArgs));
    }
  });
})();
