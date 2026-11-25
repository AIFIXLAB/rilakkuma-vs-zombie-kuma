// ===== Battle view: rendering + touch input for every mode =====
(function () {
  const CFG = RK.Data.config, U = RK.util, UI = RK.UI, A = RK.Assets, D = RK.Data, E = () => RK.Engine;
  const B = RK.Battle;
  const W = () => RK.Engine.W, H = () => RK.Engine.H;
  const R = (x, y, w, h) => ({ x, y, w, h });

  const View = RK.BattleView = {
    // ---------------- layout: card bars per player ----------------
    layout(b) {
      const bars = [];
      const mk = (owner, x0, x1, n, kind) => {
        const slots = [], cw = Math.min(132, (x1 - x0 - 8 * (n - 1)) / n);
        for (let i = 0; i < n; i++) slots.push(R(x0 + i * (cw + 8), 778, cw, 150));
        bars.push({ owner, kind, slots, x0, x1 });
      };
      if (b.mode === 'coop') { mk(0, 8, 828, 8, 'bear'); mk(1, 844, 1664, 8, 'bear'); }
      else if (b.mode === 'vs') {
        if (b.vs.zombieCtl === 'human') mk('z', 8, 828, Math.max(1, b.vs.zcards.length), 'zombie');
        if (b.vs.bearCtl === 'human') mk(0, 844, 1664, Math.min(8, b.players[0].cards.length + 2), 'bear');
      } else mk(0, 8, 1664, Math.min(12, b.players[0].cards.length + 2), 'bear');
      b.bars = bars;
    },
    // slot content for a bear bar: [TRAP toggle][cards or traps...][SKILL]
    slotItems(b, bar) {
      if (bar.kind === 'zombie') return b.vs.zcards.map(id => ({ kind: 'zcard', id }));
      const p = b.players[bar.owner], n = bar.slots.length, items = [{ kind: 'trapToggle' }];
      if (p.bar === 'traps') {
        const ids = Object.keys(D.traps).filter(k => b.trapBag[k] > 0);
        const page = p.trapPage || 0, per = n - 3;
        ids.slice(page * per, page * per + per).forEach(id => items.push({ kind: 'trap', id }));
        while (items.length < n - 2) items.push({ kind: 'empty' });
        items.push(ids.length > per ? { kind: 'trapPage', pages: Math.ceil(ids.length / per) } : { kind: 'empty' });
      } else {
        p.cards.slice(0, n - 2).forEach(c => items.push({ kind: 'card', c }));
        while (items.length < n - 1) items.push({ kind: 'empty' });
      }
      items.push({ kind: 'skill' });
      return items;
    },

    // ======================= INPUT =======================
    onTap(b, x, y) {
      if (b.result) return View.tapResult(b, x, y);
      for (const h of (b._hud || [])) if (U.inRect(x, y, h.r)) { h.fn(); return; }
      if (b.state !== 'play' && b.state !== 'intro') return;
      // skill picker
      if (b.skillPick) {
        for (const o of b.skillPick.opts) if (U.inRect(x, y, o.r)) { const k = o.key, pid = b.skillPick.pid; b.skillPick = null; if (D.teamSkills[k].target === 'row') { b.skillTarget = { key: k, pid }; UI.toast('แตะแถวที่ต้องการถล่ม'); } else b.useSkill(k, null, pid); return; }
        b.skillPick = null; return;
      }
      if (b.skillTarget) { const wx = b.mirror ? W() - x : x, cell = b.grid.cellAt(wx, y); const st = b.skillTarget; b.skillTarget = null; if (cell) b.useSkill(st.key, cell.r, st.pid); return; }
      // unit popup
      if (b.popup) { for (const o of b.popup.btns || []) if (U.inRect(x, y, o.r)) { o.fn(); b.popup = null; return; } b.popup = null; }
      // donuts first (screen coords)
      const Rr = CFG.donut.tapRadius; let best = null, bd = 1e9;
      for (const d of b.donutItems) { if (d.collected) continue; const dd = Math.hypot(d.x - x, d.y - y); if (dd < Rr && dd < bd) { bd = dd; best = d; } }
      if (best) return b.collectDonut(best);
      // bars
      for (const bar of b.bars) if (x >= bar.x0 && x <= bar.x1 && y >= 770) { const items = View.slotItems(b, bar); bar.slots.forEach((r, i) => { if (U.inRect(x, y, r) && items[i]) View.tapSlot(b, bar, items[i]); }); return; }
      // grid
      const wx = b.mirror ? W() - x : x, cell = b.grid.cellAt(wx, y);
      if (cell) {
        const actor = b.lastActor;
        if (actor === 'z' && b.vs && b.vs.zselected) { if (b.vsDeploy(b.vs.zselected, cell.r)) b.vs.zselected = null; return; }
        const p = typeof actor === 'number' ? b.players[actor] : b.players.find(q => q.selected);
        if (p && p.selected) {
          if (p.selected.trap) { if (b.placeTrap(p.selected.trap, cell.r, cell.c)) p.selected = null; return; }
          if (b.place(p.selected, cell.r, cell.c, p.id)) p.selected = null; return;
        }
        const u = b.units.find(u => u.row === cell.r && u.col === cell.c && !u.dying);
        if (u) { u.showHpT = 3; View.openPopup(b, u); }
        return;
      }
      b.players.forEach(p => p.selected = null); if (b.vs) b.vs.zselected = null;
    },
    tapSlot(b, bar, it) {
      RK.Audio.play('buttonClick');
      if (bar.kind === 'zombie') {
        const v = b.vs, info = D.vsZombies[it.id];
        if (v.zcd[it.id] > 0) return UI.toast('ซอมบี้ยังไม่พร้อม');
        if (v.brain < info.brain) return UI.toast(`Brain Energy ไม่พอ (${info.brain})`);
        if (info.boss && b.t < 90) return UI.toast(`บอสเรียกได้หลังนาทีที่ 1:30`);
        v.zselected = v.zselected === it.id ? null : it.id; b.lastActor = 'z'; if (v.zselected) UI.toast('แตะแถวบนสนามเพื่อปล่อยซอมบี้');
        return;
      }
      const p = b.players[bar.owner];
      if (it.kind === 'trapToggle') { p.bar = p.bar === 'traps' ? 'cards' : 'traps'; p.selected = null; return; }
      if (it.kind === 'trapPage') { p.trapPage = ((p.trapPage || 0) + 1) % it.pages; return; }
      if (it.kind === 'skill') {
        if (b.skill.gauge < 1) return UI.toast(`เกจสกิล ${Math.floor(b.skill.gauge * 100) % 100 + (b.skill.gauge >= 1 ? 0 : 0)}% — เติมจากการกำจัดซอมบี้และโดนัทสายรุ้ง`);
        const r0 = bar.slots[bar.slots.length - 1], keys = Object.keys(D.teamSkills);
        b.skillPick = { pid: p.id, opts: keys.map((k, i) => ({ key: k, r: R(U.clamp(r0.x - 300 + i * 140, 10, W() - 150), 600, 132, 160) })) };
        return;
      }
      if (it.kind === 'trap') {
        const def = D.traps[it.id];
        if (b.donuts < def.cost) return UI.toast(`โดนัทไม่พอ (ต้องใช้ ${def.cost})`);
        p.selected = p.selected && p.selected.trap === it.id ? null : { trap: it.id }; b.lastActor = p.id; return;
      }
      if (it.kind === 'card') {
        const c = it.c;
        if (p.selected === c) { p.selected = null; return; }
        if (p.cd[c.id] > 0) return UI.toast(`${c.nameTH} ยังไม่พร้อม (${Math.ceil(p.cd[c.id])} วิ)`);
        if (b.donuts < c.cost) return UI.toast(`โดนัทไม่พอ (ต้องใช้ ${c.cost})`);
        p.selected = c; b.lastActor = p.id;
      }
    },
    openPopup(b, u) {
      const x = b.ux(u), y = b.uy(u) - b.grid.cellH(u.row) * 0.75;
      const btns = [];
      if (!u.isFactory) btns.push({ label: u.facing > 0 ? '⟲ หันหลัง' : '⟳ หันหน้า', color: 'blue', fn: () => b.rotate(u) });
      if (u.isFactory && u.level < 5) btns.push({ label: 'อัปเกรด', color: 'green', fn: () => View.openFactoryUpgrade(b, u) });
      btns.push({ label: `ขาย +${b.sellValue(u)}`, color: 'yellow', fn: () => b.sell(u) });
      btns.push({ label: 'ข้อมูล', color: 'gray', fn: () => View.unitInfo(b, u) });
      const bw = 176, bh = 66, tot = btns.length * (bw + 8) - 8, x0 = U.clamp(x - tot / 2, 10, W() - tot - 10), y0 = U.clamp(y - bh - 10, 120, 700);
      btns.forEach((o, i) => o.r = R(x0 + i * (bw + 8), y0, bw, bh));
      b.popup = { u, btns };
    },
    unitInfo(b, u) {
      const d = u.data;
      UI.openModal({ title: d.nameTH, w: 900, h: 540, lines: [], draw(ctx, bx) {
        A.fitImg(ctx, A.skin(u.isFactory ? u.assetId : u.asset, d.costume), bx.x + 40, bx.y + 70, 260, 300, true);
        const rows = [['บทบาท', d.role + (d.kind ? ' · ' + d.kind : '')], ['HP', `${Math.ceil(u.hp)} / ${u.maxHp}`], ['ATK', d.atk], ['DEF', u.def], ['ความเร็วโจมตี', d.attackSpeed ? d.attackSpeed.toFixed(2) + ' วิ' : '-'],
          ['ระยะ', d.range ? d.range.toFixed(1) + ' ช่อง' : '-'], ['ทิศ', u.facing > 0 ? 'หันหน้า (ขวา)' : 'หันหลัง (ซ้าย)'], ['Lv / ดาว', `Lv.${d.level || 1} · ★${d.star || 1}`], ['ความสามารถ', d.passive || '-']];
        rows.forEach((r, i) => { UI.text(ctx, r[0], bx.x + 330, bx.y + 90 + i * 42, { size: 22, align: 'left', color: '#9A6A3A', outline: false }); UI.text(ctx, String(r[1]), bx.x + 520, bx.y + 90 + i * 42, { size: 24, align: 'left', color: '#6B3F1C', outline: false }); });
      }, buttons: [{ label: 'ปิด', color: 'green', forcePill: true }] });
    },
    openFactoryUpgrade(b, u) {
      const cur = u.lvl, next = CFG.factoryLevels[u.level + 1];
      if (!next) { UI.toast('เครื่องผลิตระดับสูงสุดแล้ว (Lv.5)'); return; }
      const sp = D.factorySpecial[u.level + 1];
      UI.openModal({ title: 'อัปเกรดเครื่องผลิตโดนัท', w: 920, h: 560,
        draw: (ctx, bx) => {
          A.drawFit(ctx, cur.asset, bx.x + 30, bx.y + 70, 210, 210);
          A.drawFit(ctx, 'UI_ICON_ARROW_RIGHT', bx.x + 250, bx.y + 140, 64, 64);
          A.drawFit(ctx, next.asset, bx.x + 320, bx.y + 70, 210, 210);
          const tx = bx.x + 730, rows = [['ระดับ', `Lv.${cur.level} → Lv.${next.level}`], ['เวลาผลิต', `${cur.productionTime} → ${next.productionTime} วิ`], ['โดนัท/รอบ', `${cur.donutsPerCycle} → ${next.donutsPerCycle}`], ['ค่าอัปเกรด', `${next.upgradeCost} โดนัท`]];
          rows.forEach((r, i) => { UI.text(ctx, r[0], tx, bx.y + 85 + i * 58, { size: 22, color: '#9A6A3A', outline: false }); UI.text(ctx, r[1], tx, bx.y + 112 + i * 58, { size: 26, color: i === 3 && b.donuts < next.upgradeCost ? '#D33' : '#6B3F1C', outline: false }); });
          UI.text(ctx, `โอกาสโดนัทพิเศษ Lv.${next.level}: ช็อก ${Math.round(sp.chocolate * 100)}% · ทอง ${Math.round(sp.golden * 100)}% · สายรุ้ง ${Math.round(sp.rainbow * 100)}%`, bx.x + bx.w / 2, bx.y + 330, { size: 22, color: '#8B5A2B', outline: false });
        },
        buttons: [{ label: 'ยกเลิก' }, { label: 'อัปเกรด', disabled: b.donuts < next.upgradeCost, action: () => b.upgradeFactory(u) }] });
    },
    tapResult(b, x, y) {
      if (b.result.t < 0.6) return;
      for (const o of (b.result.btns || [])) if (UI.hit(o, x, y)) { RK.Audio.play('buttonClick'); o.action(); return; }
    },

    // ======================= RENDER =======================
    render(b, ctx) {
      const g = b.grid;
      ctx.save();
      if (b.shake > 0) ctx.translate(RK.RNG.range(-6, 6) * b.shake, RK.RNG.range(-4, 4) * b.shake);
      // --- world (mirrored in VS) ---
      ctx.save();
      if (b.mirror) { ctx.translate(W(), 0); ctx.scale(-1, 1); }
      A.drawFit(ctx, b.map.asset, 0, 0, W(), H());
      if (b.baseShake > 0) { ctx.fillStyle = `rgba(255,40,40,${b.baseShake})`; ctx.fillRect(0, 150, 300, 600); }
      // terrain overlays
      const TC = { Lava: 'rgba(255,90,20,0.38)', 'Poison Ground': 'rgba(120,255,60,0.30)', Ice: 'rgba(170,230,255,0.40)', Water: 'rgba(40,140,255,0.42)', Sand: 'rgba(230,190,110,0.35)', 'Special Ground': 'rgba(255,230,90,0.35)' };
      for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) { const t = g.cells[r][c].terrainType; if (TC[t]) View.poly(ctx, g.cellPoly(r, c), TC[t], t === 'Special Ground' ? 'rgba(255,240,150,0.9)' : null); }
      // placement highlights
      const sel = b.players.find(p => p.selected), zsel = b.vs && b.vs.zselected;
      if (sel || b.skillTarget || zsel) {
        for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
          let ok;
          if (b.skillTarget || zsel) ok = true;
          else if (sel.selected.trap) ok = !g.cells[r][c].trapId;
          else ok = b.canPlace(sel.selected, r, c, Object.assign({}, sel, { cd: {} })).ok || (b.donuts < sel.selected.cost && !g.cells[r][c].occupied);
          View.poly(ctx, g.cellPoly(r, c), ok ? (b.skillTarget ? 'rgba(255,120,80,0.25)' : zsel ? 'rgba(170,90,255,0.22)' : 'rgba(120,255,120,0.26)') : 'rgba(255,80,80,0.2)', ok ? 'rgba(255,255,255,0.7)' : null);
        }
      }
      if (b.mode === 'vs') { for (let r = 0; r < g.rows; r++) View.poly(ctx, g.cellPoly(r, g.cols - 3), null, 'rgba(255,80,80,0.6)'); }
      for (const u of b.units) if (u.data.aura && !u.dying) for (let k = 1; k <= u.data.aura.cellsAhead; k++) { const c = u.col + k * u.facing; if (c >= 0 && c < g.cols) View.poly(ctx, g.cellPoly(u.row, c), 'rgba(120,200,255,0.2)'); }
      for (const t of b.traps) View.drawTrap(b, ctx, t);
      const ents = b.units.concat(b.zombies).sort((p, q) => p.row - q.row || (p.side === 'zombie') - (q.side === 'zombie'));
      for (const e of ents) View.drawEntity(b, ctx, e);
      for (const p of b.projectiles) View.drawProjectile(b, ctx, p);
      ctx.restore();
      // --- screen-space overlays ---
      for (const l of b.lines) { ctx.strokeStyle = `rgba(180,220,255,${1 - l.t / 0.2})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(l.x1, l.y1); for (let i = 1; i < 6; i++) ctx.lineTo(U.lerp(l.x1, l.x2, i / 6) + RK.RNG.range(-10, 10), U.lerp(l.y1, l.y2, i / 6) + RK.RNG.range(-10, 10)); ctx.lineTo(l.x2, l.y2); ctx.stroke(); }
      for (const f of b.effects) View.drawFx(b, ctx, f);
      for (const d of b.donutItems) View.drawDonut(b, ctx, d);
      for (const e of ents) View.drawHpBar(b, ctx, e);
      for (const n of b.dmgNums) { ctx.save(); ctx.globalAlpha = 1 - Math.max(0, (n.t / n.max - 0.6) / 0.4); UI.text(ctx, n.text, n.x, n.y - n.t * 60, { size: n.size, color: n.color, outlineColor: '#3a1a08' }); ctx.restore(); }
      ctx.restore();
      b._hud = [];
      if (b.mode === 'vs') View.drawVSHud(b, ctx); else View.drawHUD(b, ctx);
      for (const bar of b.bars) View.drawBar(b, ctx, bar);
      if (b.popup) View.drawPopup(b, ctx);
      if (b.skillPick) View.drawSkillPick(b, ctx);
      if (b.boss && !b.boss.dying) View.drawBossBar(b, ctx);
      if (b.state === 'intro') View.drawIntro(b, ctx);
      if (b.banner) View.drawBanner(b, ctx);
      if (b.tutorialStep >= 0 && b.tutorialStep < 3 && b.state === 'play') View.drawTutorial(b, ctx);
      if (b.result) View.drawResult(b, ctx);
    },
    poly(ctx, pts, fill, stroke) {
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
    },
    worldPos(b, e) { return { x: b.grid.colToX(e.row, e.side === 'bear' ? e.col + 0.5 : e.x), y: b.grid.footY(e.row), h: b.grid.cellH(e.row) }; },
    drawEntity(b, ctx, e) {
      const p = View.worldPos(b, e), base = b.grid.cellH(2) || p.h;
      let img, h;
      if (e.side === 'bear') {
        h = base * (e.isFactory ? 1.42 : 1.28) * (p.h / base * 0.5 + 0.5);
        let id = e.assetId;
        if (e.isFactory && e.level === 1 && e.prodTimer < 1.6) { id = e.prodTimer > 1.0 ? 'FACTORY_ANIM_HEATING' : e.prodTimer > 0.4 ? 'FACTORY_ANIM_BAKING' : 'FACTORY_ANIM_EJECT'; h *= 0.8; }
        img = e.isFactory ? A.get(id) : A.skin(id, e.data.costume);
      } else { h = base * (e.data.scale || 1.25) * (p.h / base * 0.5 + 0.5); img = A.get(e.data.asset); }
      if (!img) return;
      const w = img.width * h / img.height;
      ctx.save(); ctx.translate(p.x, p.y);
      let sx = 1, sy = 1, rot = 0, dx = 0, dy = 0, alpha = 1;
      if (e.side === 'zombie') {
        if (e.flying) dy = -40 - Math.sin(e.anim.phase) * 6;
        if (e.anim.jump > 0) dy = -Math.sin((1 - e.anim.jump / 0.7) * Math.PI) * 90;
        if (e.burrowed) { ctx.fillStyle = 'rgba(110,70,30,0.85)'; ctx.beginPath(); ctx.ellipse(0, -8, w * 0.32, 16 + Math.sin(e.anim.phase) * 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return; }
        if (e.hidden) alpha = 0.25;
      }
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(0, -4, w * 0.36, h * 0.07, 0, 0, Math.PI * 2); ctx.fill();
      if (e.side === 'bear') {
        const ph = b.t * 2.2 + e.anim.idlePhase; sy = 1 + Math.sin(ph) * 0.025; sx = 1 - Math.sin(ph) * 0.015;
        if (e.anim.attack > 0) { const k = e.anim.attack / 0.22; dx = Math.sin(k * Math.PI) * 14; sx *= 1 + k * 0.06; }
        if (e.anim.spawn > 0) { const k = 1 - e.anim.spawn / 0.35; sx *= 0.6 + 0.4 * k; sy *= 0.6 + 0.4 * k + Math.sin(k * Math.PI) * 0.15; }
        if (e.isFactory && e.ejectAnim > 0) sy *= 1 + Math.sin(e.ejectAnim / 0.6 * Math.PI) * 0.08;
        if (e.status.stun || e.status.freeze) rot = Math.sin(b.t * 20) * 0.05;
        if (e.data.awakened) { ctx.fillStyle = `rgba(255,215,60,${0.35 + Math.sin(b.t * 4) * 0.15})`; ctx.beginPath(); ctx.ellipse(0, -h * 0.45, w * 0.55, h * 0.55, 0, 0, Math.PI * 2); ctx.fill(); }
        if (e.shieldHp > 0) { ctx.strokeStyle = 'rgba(120,200,255,0.8)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(0, -h * 0.45, w * 0.55, h * 0.55, 0, 0, Math.PI * 2); ctx.stroke(); }
        if (e.facing < 0) sx = -sx;
      } else {
        if (e.state === 'walk' && RK.Combat.speedMult(e) > 0) { rot = Math.sin(e.anim.phase) * 0.06; sy = 1 + Math.abs(Math.sin(e.anim.phase)) * 0.03; }
        if (e.anim.attack > 0) { const k = e.anim.attack / 0.3; dx = -Math.sin(k * Math.PI) * 16; rot = -Math.sin(k * Math.PI) * 0.08; }
        if (e.anim.spawn > 0) alpha *= 1 - e.anim.spawn / 0.5;
        if (e.shieldHp > 0 && (e.isBoss)) { ctx.strokeStyle = 'rgba(255,215,90,0.85)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(0, -h * 0.45 + dy, w * 0.5, h * 0.55, 0, 0, Math.PI * 2); ctx.stroke(); }
      }
      if (e.dying) { const k = 1 - Math.max(0, e.dying) / 0.55; alpha = 1 - k; rot = (e.side === 'bear' ? -1 : 1) * k * 0.9; sy *= 1 - k * 0.3; }
      ctx.globalAlpha = alpha;
      ctx.translate(dx * (e.facing || 1), dy); ctx.rotate(rot); ctx.scale(sx, sy);
      ctx.drawImage(img, -w / 2, -h, w, h);
      if (e.hitFlash > 0 || e.status.poison || e.status.slow || e.status.wet || e.status.stun || e.status.freeze || e.status.burn) {
        const tint = e.hitFlash > 0 ? 'rgba(255,60,60,0.55)' : e.status.freeze ? 'rgba(150,220,255,0.6)' : e.status.burn ? 'rgba(255,140,40,0.4)' : e.status.poison ? 'rgba(120,255,90,0.35)' : e.status.stun ? 'rgba(255,240,120,0.35)' : 'rgba(110,190,255,0.38)';
        View.drawTint(ctx, img, -w / 2, -h, w, h, tint);
      }
      ctx.restore();
      if (e.isFactory && !e.dying) {
        const k = 1 - e.prodTimer / (e.level === 1 && b.t < CFG.firstProductionDelay ? CFG.firstProductionDelay : e.lvl.productionTime);
        ctx.beginPath(); ctx.arc(p.x + w * 0.38, p.y - h * 0.9, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * U.clamp(k, 0, 1)); ctx.strokeStyle = '#FFD93B'; ctx.lineWidth = 6; ctx.stroke();
      }
    },
    drawTint(ctx, img, x, y, w, h, color) {
      const c = View._tint || (View._tint = document.createElement('canvas'));
      const cw = Math.ceil(w), ch = Math.ceil(h); if (c.width < cw) c.width = cw; if (c.height < ch) c.height = ch;
      const t = c.getContext('2d'); t.clearRect(0, 0, c.width, c.height); t.globalCompositeOperation = 'source-over';
      t.drawImage(img, 0, 0, w, h); t.globalCompositeOperation = 'source-in'; t.fillStyle = color; t.fillRect(0, 0, w, h);
      ctx.drawImage(c, 0, 0, cw, ch, x, y, cw, ch);
    },
    drawTrap(b, ctx, t) {
      const g = b.grid, x = g.colToX(t.row, t.col + 0.5), y = g.footY(t.row), h = g.cellH(t.row) * 0.7;
      ctx.save(); if (!t.alive) ctx.globalAlpha = Math.max(0, t.fade || 0) * 2; else if (t.cd > 0) ctx.globalAlpha = 0.55;
      const k = t.anim > 0 ? 1 + Math.sin(t.anim * 20) * 0.08 : 1;
      const img = A.get(t.data.asset); if (img) { const s = h * k / img.height; ctx.drawImage(img, x - img.width * s / 2, y - h * k + 6, img.width * s, h * k); }
      ctx.restore();
      if (t.alive && t.data.hp) { const bw = 60; ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x - bw / 2, y + 4, bw, 6); ctx.fillStyle = '#C8D2DC'; ctx.fillRect(x - bw / 2, y + 4, bw * Math.max(0, t.hp / t.maxHp), 6); }
    },
    drawHpBar(b, ctx, e) {
      if (e.dying || e.burrowed || e.hidden) return;
      const show = RK.Save.data.settings.hpBarAlways || e.showHpT > 0 || b.t - e.lastHitT < 3 || (e.side === 'zombie' && e.state !== 'walk');
      if (!show || e.isBoss) return;
      const p = View.worldPos(b, e), h = e.side === 'bear' ? p.h * 1.32 : p.h * (e.data.scale || 1.25);
      const x0 = b.ux(e), bw = 92, bh = 13, x = x0 - bw / 2, y = p.y - h - 16 - (e.flying ? 40 : 0);
      ctx.fillStyle = 'rgba(40,20,8,0.75)'; UI.roundRect(ctx, x - 3, y - 3, bw + 6, bh + 6, 8); ctx.fill();
      const k = U.clamp(e.hp / e.maxHp, 0, 1);
      ctx.fillStyle = e.side === 'bear' ? (k > 0.5 ? '#6EE04A' : k > 0.25 ? '#FFD93B' : '#FF5A5A') : '#FF5A5A';
      UI.roundRect(ctx, x, y, Math.max(4, bw * k), bh, 6); ctx.fill();
      const extra = (e.armorHp || 0) + (e.shieldHp || 0), extraMax = (e.maxArmor || 0) + (e.maxShield || 0);
      if (extraMax > 0 && extra > 0) { ctx.fillStyle = e.side === 'bear' ? '#7FD7FF' : '#C8D2DC'; UI.roundRect(ctx, x, y - 9, Math.max(4, bw * extra / extraMax), 7, 4); ctx.fill(); }
      if (e.side === 'bear' && e.facing < 0) UI.text(ctx, '◀', x - 14, y + 6, { size: 18, color: '#7FD7FF' });
    },
    drawProjectile(b, ctx, p) {
      const g = b.grid, x = g.colToX(p.row, p.x);
      let y = g.footY(p.row) - g.cellH(p.row) * 0.62;
      if (p.arc) { const end = p.lob ? (p.targetX != null ? p.targetX : p.startX + p.range * Math.sign(p.speed)) : p.endX; const span = Math.max(0.5, Math.abs(end - p.startX)), k = U.clamp(Math.abs(p.x - p.startX) / span, 0, 1); y -= Math.sin(k * Math.PI) * (p.lob ? 120 : 70); }
      const img = A.tinted(p.img, p.tint); if (!img) return;
      const size = (p.side === 'bear' ? 44 : 58) * (p.scale || 1);
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.side === 'bear' ? p.age * 9 : 0);
      const s = size / Math.max(img.width, img.height); ctx.drawImage(img, -img.width * s / 2, -img.height * s / 2, img.width * s, img.height * s);
      ctx.restore();
    },
    drawDonut(b, ctx, d) {
      const img = A.tinted('DONUT_NORMAL', D.donutTypes[d.type].tint); if (!img) return;
      let x = d.x, y = d.y, s = d.type === 'golden' ? 64 : 56, a = 1;
      if (d.collected) { const k = 1 - d.fly / 0.45; x = U.lerp(d.fromX, b.mirror ? W() - 80 : 80, k * k); y = U.lerp(d.fromY, 58, k * k); s *= 1 - k * 0.5; }
      else {
        const left = d.expireTime - b.t;
        if (left < CFG.donut.blinkBefore) a = 0.35 + 0.65 * Math.abs(Math.sin(b.t * 10));
        if (d.landed) { s += Math.sin(b.t * 5 + d.spawnTime) * 3; A.drawFit(ctx, 'UI_FX_STAR_GLOW', x - 40, y - 40, 80, 80); }
      }
      ctx.save(); ctx.globalAlpha = a; ctx.drawImage(img, x - s / 2, y - s * img.height / img.width / 2, s, s * img.height / img.width); ctx.restore();
    },
    drawFx(b, ctx, f) {
      const k = f.t / f.max; ctx.save(); ctx.globalAlpha = 1 - k;
      switch (f.type) {
        case 'hit': A.drawFit(ctx, 'UI_FX_HIT_SPLAT', f.x - 30, f.y - 30, 60 + k * 20, 60 + k * 20); break;
        case 'slash': ctx.strokeStyle = '#fff'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(f.x - 30 * f.dir, f.y, 50, -1 + k, 0.6 + k); ctx.stroke(); break;
        case 'explode': A.drawFit(ctx, 'UI_FX_CLOUD', f.x - 60 - k * 30, f.y - 60 - k * 30, 120 + k * 60, 120 + k * 60); A.drawFit(ctx, 'FX_SPARKLE', f.x - 40, f.y - 50, 80, 80); break;
        case 'spray': case 'wind': case 'beam': {
          ctx.fillStyle = f.type === 'spray' ? 'rgba(170,225,255,0.8)' : f.type === 'beam' ? 'rgba(255,240,200,0.6)' : 'rgba(235,250,255,0.8)';
          for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(f.x + (40 + k * 190 + i * 14) * f.dir, f.y + Math.sin(i * 1.7 + f.t * 30) * 22, 10 + i * 1.5, 0, Math.PI * 2); ctx.fill(); }
          break; }
        case 'death': A.drawFit(ctx, 'UI_FX_CLOUD', f.x - 50, f.y - 20 - k * 30, 100, 100); break;
        case 'place': case 'collect': case 'trap': A.drawFit(ctx, 'UI_FX_BURST_LINES', f.x - 55 - k * 20, f.y - 55 - k * 20, 110 + k * 40, 110 + k * 40); break;
        case 'roll': A.drawFit(ctx, 'UI_FX_CLOUD', f.x + k * 700 * f.dir - 60, f.y - 50, 120, 120); break;
        case 'upgrade': A.drawFit(ctx, 'UI_ICON_UPGRADE', f.x - 40, f.y - 80 - k * 60, 80, 80); A.drawFit(ctx, 'FX_SPARKLE', f.x - 60, f.y - 40, 120, 120); break;
        case 'break': A.drawFit(ctx, 'UI_FX_BURST_LINES', f.x - 50, f.y - 90, 100, 100); break;
        case 'heal': A.drawFit(ctx, 'UI_ICON_HEART', f.x - 18, f.y - 60 - k * 50, 36, 36); break;
        case 'shield': ctx.strokeStyle = 'rgba(120,200,255,0.9)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(f.x, f.y, 40 + k * 30, 0, Math.PI * 2); ctx.stroke(); break;
        case 'roar': ctx.strokeStyle = 'rgba(255,80,60,0.8)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(f.x, f.y, 60 + k * 260, 0, Math.PI * 2); ctx.stroke(); break;
        case 'summon': case 'dirt': A.drawFit(ctx, 'UI_FX_CLOUD', f.x - 50, f.y, 100, 80); break;
        case 'jump': A.drawFit(ctx, 'UI_FX_TWINKLE', f.x - 20, f.y - 40 - k * 40, 40, 40); break;
      }
      ctx.restore();
    },

    // ---------------- HUD ----------------
    hudBtn(b, r, fn) { b._hud.push({ r, fn }); },
    drawHUD(b, ctx) {
      const d = R(14, 12, 250, 92); UI.panel(ctx, d.x, d.y, d.w, d.h, { r: 24 });
      A.drawFit(ctx, 'DONUT_NORMAL', d.x + 14, d.y + 12, 68, 68);
      UI.text(ctx, String(b.donuts), d.x + 160, d.y + d.h / 2 + 2, { size: 44, color: '#FFE14D' });
      const bb = R(274, 12, 320, 92); UI.panel(ctx, bb.x, bb.y, bb.w, bb.h, { r: 24 });
      A.drawFit(ctx, 'UI_ICON_HEART', bb.x + 12, bb.y + 14, 64, 64);
      const k = b.baseHp / b.baseMax, bx = bb.x + 84, bw = bb.w - 104;
      ctx.fillStyle = '#5a3212'; UI.roundRect(ctx, bx, bb.y + 30, bw, 34, 17); ctx.fill();
      ctx.fillStyle = k > 0.5 ? '#6EE04A' : k > 0.25 ? '#FFD93B' : '#FF5A5A'; UI.roundRect(ctx, bx + 3, bb.y + 33, Math.max(10, (bw - 6) * k), 28, 14); ctx.fill();
      UI.text(ctx, `${Math.ceil(b.baseHp)} / ${b.baseMax}`, bx + bw / 2, bb.y + 48, { size: 21 });
      UI.text(ctx, 'ฐาน', bx + bw / 2, bb.y + 17, { size: 16, color: '#8B5A2B', outline: false });
      const w = R(604, 12, 520, 92); UI.panel(ctx, w.x, w.y, w.w, w.h, { r: 24 });
      if (b.mode === 'endless') {
        UI.text(ctx, b.waveIdx < 0 ? `เตรียมตัว ${Math.ceil(Math.max(0, b.waveDelay))} วิ` : `ENDLESS · WAVE ${b.waveIdx + 1}`, w.x + 180, w.y + 34, { size: 30, color: '#FFE14D' });
        UI.text(ctx, `สถิติ ${RK.Save.data.endless.best} · กำจัด ${b.stats.killed}`, w.x + 400, w.y + 34, { size: 22 });
      } else {
        const cur = b.waveIdx < 0 ? 0 : b.waveIdx + 1, tot = b.waves.length;
        UI.text(ctx, b.waveIdx < 0 ? `เตรียมตัว ${Math.ceil(Math.max(0, b.waveDelay))} วิ` : `WAVE ${cur}/${tot}`, w.x + 120, w.y + 34, { size: 30, color: b.waveIdx >= 0 && b.waves[b.waveIdx].final ? '#FF6B6B' : '#FFE14D' });
        UI.text(ctx, `ซอมบี้เหลือ ${b.zombiesRemaining}`, w.x + 370, w.y + 34, { size: 24 });
      }
      const pk = b.mode === 'endless' ? (b.waveIdx >= 0 && b.waves[b.waveIdx] ? 1 - b.queue.length / Math.max(1, b.waves[b.waveIdx].spawns.length) : 0) : b.stats.killed / Math.max(1, b.totalZombies);
      ctx.fillStyle = '#5a3212'; UI.roundRect(ctx, w.x + 24, w.y + 58, w.w - 48, 18, 9); ctx.fill();
      ctx.fillStyle = '#FF7FB0'; UI.roundRect(ctx, w.x + 26, w.y + 60, Math.max(8, (w.w - 52) * U.clamp(pk, 0, 1)), 14, 7); ctx.fill();
      // skill gauge
      const sg = R(1134, 12, 290, 92); UI.panel(ctx, sg.x, sg.y, sg.w, sg.h, { r: 24 });
      UI.text(ctx, 'สกิลทีม', sg.x + 60, sg.y + 46, { size: 20, color: '#8B5A2B', outline: false });
      for (let i = 0; i < 3; i++) { const f = U.clamp(b.skill.gauge - i, 0, 1); const cx = sg.x + 140 + i * 50; ctx.fillStyle = '#5a3212'; ctx.beginPath(); ctx.arc(cx, sg.y + 46, 20, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = f >= 1 ? '#FF7FE0' : '#B58ACB'; ctx.beginPath(); ctx.moveTo(cx, sg.y + 46); ctx.arc(cx, sg.y + 46, 17, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); ctx.fill(); }
      const sp = R(1440, 14, 100, 86), pa = R(1556, 14, 100, 86);
      UI.button(ctx, Object.assign({ label: b.speed === 2 ? '×2' : '×1', color: b.speed === 2 ? 'pink' : 'blue', size: 36, forcePill: true }, sp));
      UI.button(ctx, Object.assign({ label: 'II', color: 'yellow', size: 38, forcePill: true }, pa));
      View.hudBtn(b, sp, () => { b.speed = b.speed === 1 ? 2 : 1; RK.Save.data.settings.battleSpeed = b.speed; RK.Save.saveSoon('speed'); });
      View.hudBtn(b, pa, () => b.openPause());
      if (b.mode === 'coop') { UI.text(ctx, 'P1', 30, 765, { size: 22, color: '#7FD7FF' }); UI.text(ctx, 'P2', 860, 765, { size: 22, color: '#FF9B9B' }); UI.text(ctx, 'โดนัทใช้ร่วมกัน', 836, 140, { size: 20 }); }
    },
    drawVSHud(b, ctx) {
      const v = b.vs;
      // zombie side (left)
      const z = R(14, 12, 420, 92); UI.panel(ctx, z.x, z.y, z.w, z.h, { r: 24, fill: '#EEE3F7', border: '#6B3F8B' });
      A.drawFit(ctx, 'ZOM_NORMAL', z.x + 10, z.y + 8, 70, 76);
      UI.text(ctx, `🧠 ${Math.floor(v.brain)}`, z.x + 150, z.y + 34, { size: 32, color: '#D18BFF', outlineColor: '#3a1a40' });
      const zk = v.zBase / v.zBaseMax; ctx.fillStyle = '#3a1a40'; UI.roundRect(ctx, z.x + 90, z.y + 58, 310, 22, 11); ctx.fill(); ctx.fillStyle = '#B06BFF'; UI.roundRect(ctx, z.x + 92, z.y + 60, Math.max(8, 306 * zk), 18, 9); ctx.fill();
      UI.text(ctx, `ฐานซอมบี้ ${Math.ceil(v.zBase)}`, z.x + 300, z.y + 34, { size: 20, color: '#6B3F8B', outline: false });
      // bear side (right)
      const bb = R(1238, 12, 420, 92); UI.panel(ctx, bb.x, bb.y, bb.w, bb.h, { r: 24 });
      A.drawFit(ctx, 'DONUT_NORMAL', bb.x + 10, bb.y + 12, 66, 66);
      UI.text(ctx, String(b.donuts), bb.x + 130, bb.y + 34, { size: 34, color: '#FFE14D' });
      const k = b.baseHp / b.baseMax; ctx.fillStyle = '#5a3212'; UI.roundRect(ctx, bb.x + 90, bb.y + 58, 310, 22, 11); ctx.fill(); ctx.fillStyle = '#6EE04A'; UI.roundRect(ctx, bb.x + 92, bb.y + 60, Math.max(8, 306 * k), 18, 9); ctx.fill();
      UI.text(ctx, `ฐานหมี ${Math.ceil(b.baseHp)}`, bb.x + 300, bb.y + 34, { size: 20, color: '#8B5A2B', outline: false });
      // timer + pause
      const tm = R(600, 12, 360, 92); UI.panel(ctx, tm.x, tm.y, tm.w, tm.h, { r: 24 });
      const s = Math.max(0, Math.ceil(v.timer)); UI.text(ctx, `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`, tm.x + 120, tm.y + 46, { size: 46, color: s < 30 ? '#FF6B6B' : '#FFE14D' });
      UI.text(ctx, 'VS', tm.x + 270, tm.y + 46, { size: 40, color: '#FF7FB0' });
      const pa = R(976, 14, 100, 86), sp = R(1090, 14, 100, 86);
      UI.button(ctx, Object.assign({ label: 'II', color: 'yellow', size: 38, forcePill: true }, pa)); View.hudBtn(b, pa, () => b.openPause());
      UI.button(ctx, Object.assign({ label: b.speed === 2 ? '×2' : '×1', color: b.speed === 2 ? 'pink' : 'blue', size: 36, forcePill: true }, sp)); View.hudBtn(b, sp, () => { b.speed = b.speed === 1 ? 2 : 1; });
      UI.text(ctx, v.zombieCtl === 'cpu' ? 'ZOMBIE: CPU' : 'P2 ZOMBIE', 220, 765, { size: 22, color: '#D18BFF' });
      UI.text(ctx, v.bearCtl === 'cpu' ? 'BEAR: CPU' : 'P1 BEAR', 1450, 765, { size: 22, color: '#7FD7FF' });
      if (b.t < 90 && !v.bossUsed) UI.text(ctx, `บอสพร้อมใน ${Math.ceil(90 - b.t)} วิ`, 780, 130, { size: 20 });
    },
    drawBar(b, ctx, bar) {
      const items = View.slotItems(b, bar);
      bar.slots.forEach((r, i) => { const it = items[i]; if (it) View.drawSlot(b, ctx, bar, r, it); });
    },
    drawSlot(b, ctx, bar, r, it) {
      const p = bar.kind === 'bear' ? b.players[bar.owner] : null;
      if (it.kind === 'empty') { ctx.save(); ctx.globalAlpha = 0.35; A.drawFit(ctx, 'UI_CARD_FRAME_EMPTY', r.x, r.y, r.w, r.h - 30); ctx.restore(); return; }
      if (it.kind === 'trapToggle' || it.kind === 'trapPage') {
        const on = p.bar === 'traps';
        UI.button(ctx, { label: it.kind === 'trapPage' ? 'หน้าถัดไป' : on ? 'การ์ด' : 'กับดัก', color: on ? 'blue' : 'brown', forcePill: true, x: r.x, y: r.y + 40, w: r.w, h: 76, size: 22 });
        if (it.kind === 'trapToggle') { const n = Object.values(b.trapBag).reduce((s, v) => s + v, 0); A.drawFit(ctx, on ? 'DONUT_NORMAL' : 'TRAP_SPIKE', r.x + r.w / 2 - 26, r.y - 6, 52, 52); if (!on) UI.text(ctx, '×' + n, r.x + r.w - 18, r.y + 34, { size: 18 }); }
        return;
      }
      if (it.kind === 'skill') {
        const ready = b.skill.gauge >= 1;
        A.drawFit(ctx, 'UI_CARD_FRAME_EMPTY', r.x, r.y, r.w, r.h - 30);
        A.drawFit(ctx, 'UI_ICON_ROCKET', r.x + 16, r.y + 12, r.w - 32, r.h - 70);
        UI.text(ctx, 'สกิล', r.x + r.w / 2, r.y + r.h - 22, { size: 22, color: ready ? '#FF7FE0' : '#bbb' });
        UI.text(ctx, '×' + Math.floor(b.skill.gauge), r.x + r.w - 22, r.y + 22, { size: 20, color: '#FFE14D' });
        if (ready) { ctx.strokeStyle = `rgba(255,127,224,${0.6 + Math.sin(b.t * 6) * 0.4})`; ctx.lineWidth = 5; UI.roundRect(ctx, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 20); ctx.stroke(); }
        return;
      }
      ctx.save();
      let sel = false, cost, cd = 0, cdMax = 1, img, name, count = null;
      if (it.kind === 'card') { const c = it.c; sel = p.selected === c; cost = c.cost; cd = p.cd[c.id]; cdMax = c.cooldown; img = A.skin(c.isFactory ? 'FACTORY_LV1' : c.asset, c.costume); name = c.nameTH; count = b.donuts >= c.cost && cd <= 0 ? Math.floor(b.donuts / c.cost) : null; }
      else if (it.kind === 'trap') { const t = D.traps[it.id]; sel = p.selected && p.selected.trap === it.id; cost = t.cost; img = A.get(t.asset); name = t.nameTH; count = b.trapBag[it.id]; }
      else if (it.kind === 'zcard') { const z = D.enemies[it.id], info = D.vsZombies[it.id]; sel = b.vs.zselected === it.id; cost = info.brain; cd = b.vs.zcd[it.id] || 0; cdMax = info.cd; img = A.get(z.asset); name = z.nameTH; }
      const afford = it.kind === 'zcard' ? b.vs.brain >= cost : b.donuts >= cost;
      const lift = sel ? -14 : 0;
      A.drawFit(ctx, 'UI_CARD_FRAME_EMPTY', r.x, r.y + lift, r.w, r.h - 30);
      A.fitImg(ctx, img, r.x + 10, r.y + 10 + lift, r.w - 20, r.h - 56, true);
      ctx.fillStyle = afford ? '#FFF4DE' : '#F5C6C6'; UI.roundRect(ctx, r.x + 10, r.y + r.h - 40 + lift, r.w - 20, 36, 18); ctx.fill(); ctx.strokeStyle = '#8B5A2B'; ctx.lineWidth = 3; ctx.stroke();
      if (it.kind === 'zcard') UI.text(ctx, '🧠', r.x + 28, r.y + r.h - 22 + lift, { size: 18, outline: false }); else A.drawFit(ctx, 'DONUT_NORMAL', r.x + 14, r.y + r.h - 37 + lift, 28, 28);
      UI.text(ctx, String(cost), r.x + r.w / 2 + 12, r.y + r.h - 22 + lift, { size: 22, color: afford ? '#FFE14D' : '#FF6B6B' });
      UI.text(ctx, name.length > 8 ? name.slice(0, 8) + '…' : name, r.x + r.w / 2, r.y + 14 + lift, { size: 15 });
      if (count != null) UI.text(ctx, '×' + count, r.x + r.w - 22, r.y + r.h - 54 + lift, { size: 16, color: '#B6FF9B' });
      if (it.kind === 'card') UI.text(ctx, 'Lv.' + (it.c.level || 1), r.x + 26, r.y + r.h - 54 + lift, { size: 15, color: '#7FD7FF' });
      if (!afford || cd > 0) {
        ctx.fillStyle = 'rgba(30,20,20,0.45)'; UI.roundRect(ctx, r.x + 4, r.y + 4 + lift, r.w - 8, r.h - 8, 20); ctx.fill();
        if (cd > 0) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(r.x + 6, r.y + 6 + lift, r.w - 12, (r.h - 12) * (cd / cdMax)); A.drawFit(ctx, 'UI_ICON_HOURGLASS', r.x + r.w / 2 - 18, r.y + 36 + lift, 36, 36); UI.text(ctx, Math.ceil(cd) + 's', r.x + r.w / 2, r.y + 92 + lift, { size: 26 }); }
      }
      if (sel) { ctx.strokeStyle = '#FFE14D'; ctx.lineWidth = 7; UI.roundRect(ctx, r.x - 2, r.y - 2 + lift, r.w + 4, r.h + 4, 22); ctx.stroke(); }
      ctx.restore();
    },
    drawPopup(b, ctx) {
      for (const o of b.popup.btns) UI.button(ctx, { label: o.label, color: o.color, forcePill: true, x: o.r.x, y: o.r.y, w: o.r.w, h: o.r.h, size: 22 });
    },
    drawSkillPick(b, ctx) {
      for (const o of b.skillPick.opts) {
        const s = D.teamSkills[o.key]; UI.panel(ctx, o.r.x, o.r.y, o.r.w, o.r.h, { r: 20 });
        A.drawFit(ctx, s.icon, o.r.x + 30, o.r.y + 14, o.r.w - 60, 70);
        UI.text(ctx, s.nameTH, o.r.x + o.r.w / 2, o.r.y + 104, { size: 20, color: '#6B3F1C', outline: false });
        UI.text(ctx, s.target === 'row' ? 'เลือกแถว' : 'ทันที', o.r.x + o.r.w / 2, o.r.y + 132, { size: 16, color: '#9A6A3A', outline: false });
      }
    },
    drawBossBar(b, ctx) {
      const z = b.boss, x = 486, y = 112, w = 700;
      ctx.fillStyle = 'rgba(40,10,20,0.85)'; UI.roundRect(ctx, x, y, w, 52, 18); ctx.fill();
      const k = U.clamp(z.hp / z.maxHp, 0, 1); ctx.fillStyle = '#FF3B5C'; UI.roundRect(ctx, x + 6, y + 26, (w - 12) * k, 20, 10); ctx.fill();
      if (z.shieldHp > 0) { ctx.fillStyle = '#FFD75A'; UI.roundRect(ctx, x + 6, y + 26, (w - 12) * Math.min(1, z.shieldHp / z.maxHp), 8, 4); ctx.fill(); }
      const ph = z.boss ? ` · PHASE ${z.boss.phase + 1}` : ' · MINI BOSS';
      UI.text(ctx, `${z.data.nameTH}  Lv.${Math.round(b.stage.d || 1)}${ph}`, x + w / 2, y + 13, { size: 20, color: '#FFE14D' });
    },
    drawIntro(b, ctx) {
      const k = Math.min(1, (2.2 - b.introT) * 3);
      ctx.save(); ctx.globalAlpha = Math.min(1, b.introT * 2) * k;
      const st = b.stage, t = st.mode === 'story' ? `Town ${st.town} · Stage ${st.number}` : st.mode === 'vs' ? 'VS MODE' : st.mode === 'coop' ? 'CO-OP' : st.mode === 'endless' ? 'ENDLESS' : st.mode === 'event' ? 'EVENT' : 'CHALLENGE';
      UI.panel(ctx, 486, 330, 700, 200, { title: t });
      UI.text(ctx, st.name, 836, 430, { size: 40, color: '#FF7FB0', outlineColor: '#6B3F1C' });
      UI.text(ctx, st.desc || (b.mode === 'vs' ? 'ฝั่งซอมบี้ (ซ้าย) vs ฝั่งหมี (ขวา) · 4 นาที' : `${b.mode === 'endless' ? '∞' : b.waves.length} Waves · โดนัทเริ่มต้น ${b.donuts}${b.practice ? ' · โหมดฝึก' : ''}`), 836, 488, { size: 24, color: '#8B5A2B', outline: false });
      ctx.restore();
    },
    drawBanner(b, ctx) {
      const bn = b.banner, k = Math.min(1, (2.4 - bn.t) * 4, bn.t * 3);
      ctx.save(); ctx.globalAlpha = Math.max(0, k);
      A.drawFit(ctx, bn.final ? 'UI_RIBBON_RED' : 'UI_RIBBON_BLUE', 536, 360 - (1 - k) * 40, 600, 150);
      UI.text(ctx, bn.text, 836, 420 - (1 - k) * 40, { size: 54 });
      UI.text(ctx, bn.sub, 836, 520, { size: 30, color: '#FFE14D' });
      ctx.restore();
    },
    drawTutorial(b, ctx) {
      const msg = ['① แตะการ์ด "เครื่องผลิตโดนัท" แล้วแตะช่องบนสนามเพื่อวาง', '② รอโดนัทเด้งออกมา แล้วแตะโดนัทเพื่อเก็บ!', '③ วาง "คุมะยิงโดนัท" ไว้กันซอมบี้ · แตะตัวละครเพื่อ หมุน / ขาย'][b.tutorialStep];
      ctx.save(); ctx.font = UI.font(26); const w = ctx.measureText(msg).width + 80;
      UI.roundRect(ctx, 836 - w / 2, 172, w, 56, 28); ctx.fillStyle = 'rgba(255,244,222,0.95)'; ctx.fill(); ctx.strokeStyle = '#FF7FB0'; ctx.lineWidth = 4; ctx.stroke();
      UI.text(ctx, msg, 836, 201, { size: 26, color: '#6B3F1C', outline: false });
      ctx.restore();
      if (b.tutorialStep === 0 && b.bars[0]) { const r = b.bars[0].slots[1]; const bob = Math.sin(b.t * 6) * 10; ctx.save(); ctx.translate(r.x + r.w / 2, r.y - 45 + bob); ctx.rotate(Math.PI / 2); A.drawFit(ctx, 'UI_ICON_ARROW_RIGHT', -35, -35, 70, 70); ctx.restore(); }
    },
    drawRewards(ctx, got, cx, y, max) {
      const list = (got || []).slice(0, max || 8), n = list.length, sz = 96;
      list.forEach((g, i) => {
        const x = cx + (i - (n - 1) / 2) * (sz + 14) - sz / 2;
        ctx.fillStyle = g.isNew ? '#FFE9F3' : '#FFF9EE'; UI.roundRect(ctx, x, y, sz, sz, 16); ctx.fill(); ctx.strokeStyle = g.isNew ? '#FF7FB0' : '#D9B98C'; ctx.lineWidth = 3; ctx.stroke();
        const img = g.costume ? A.skin('ATK_DONUT_KUMA', g.costume) : A.tinted(g.icon, g.tint);
        A.fitImg(ctx, img, x + 10, y + 6, sz - 20, sz - 30);
        UI.text(ctx, (g.qty > 1 || typeof g.qty === 'number' && g.key !== g.icon ? '×' + RK.Eco.fmt(g.qty) : ''), x + sz / 2, y + sz - 14, { size: 18 });
        if (g.isNew) UI.text(ctx, 'NEW', x + sz - 18, y + 10, { size: 15, color: '#FF7FB0' });
      });
    },
    drawResult(b, ctx) {
      const Rz = b.result;
      const k = Math.min(1, Rz.t * 2.5);
      ctx.fillStyle = `rgba(40,20,10,${0.55 * k})`; ctx.fillRect(0, 0, W(), H());
      const pw = 980, ph = 680, x = (W() - pw) / 2, y = 150 + (1 - k) * 60;
      ctx.save(); ctx.globalAlpha = k;
      let title = Rz.win ? 'ชนะแล้ว! VICTORY' : 'แพ้แล้ว… DEFEAT';
      if (Rz.endless) title = `จบรอบ — ถึง WAVE ${Rz.wave}`;
      if (Rz.vs) title = Rz.winner === 'draw' ? 'เสมอ! DRAW' : Rz.winner === 'bear' ? 'ฝั่งหมีชนะ!' : 'ฝั่งซอมบี้ชนะ!';
      UI.panel(ctx, x, y, pw, ph, { title, ribbon: Rz.win || Rz.endless ? 'UI_RIBBON_YELLOW' : 'UI_RIBBON_RED' });
      const btns = [], st = b.stage;
      const exitTo = () => { if (st.mode === 'story') RK.Engine.setScene(RK.Scenes.stageSelect, { town: st.town }); else if (st.mode === 'event') RK.Engine.setScene(RK.Scenes.event, { id: st.event }); else RK.Engine.setScene(RK.Scenes.modes); };
      if (Rz.win && !Rz.vs) {
        Rz.stars.forEach((s, i) => { const sx = x + pw / 2 + (i - 1) * 140 - 55, sz = i === 1 ? 120 : 100, pop = Math.min(1, Math.max(0, Rz.t * 3 - i * 0.5)); ctx.save(); ctx.globalAlpha = k * (s ? 1 : 0.35) * pop; A.drawFit(ctx, s ? 'UI_ICON_STAR' : 'UI_ICON_STAR_BRONZE', sx, y + 50 - (i === 1 ? 14 : 0), sz, sz); ctx.restore(); });
        st.stars.forEach((s, i) => UI.text(ctx, (Rz.stars[i] ? '✓ ' : '✗ ') + s.text, x + pw / 2, y + 190 + i * 32, { size: 22, color: Rz.stars[i] ? '#3E9A2B' : '#B05050', outline: false }));
        const rows = [['โดนัทที่เก็บ', b.stats.donutsCollected], ['ซอมบี้ที่กำจัด', b.stats.killed], ['ตัวละครรอด', Rz.surviving], ['เวลา', View.fmtTime(Rz.time)]];
        rows.forEach((r, i) => { const cx = x + 130 + i * 240; UI.text(ctx, r[0], cx, y + 300, { size: 20, color: '#9A6A3A', outline: false }); UI.text(ctx, String(r[1]), cx, y + 330, { size: 30, color: '#6B3F1C', outline: false }); });
        UI.text(ctx, Rz.firstClear ? 'รางวัลเคลียร์ครั้งแรก' : 'รางวัล', x + pw / 2, y + 380, { size: 22, color: '#FF7FB0', outline: false });
        View.drawRewards(ctx, Rz.got, x + pw / 2, y + 400, 8);
        if (!Rz.saved) UI.text(ctx, '⚠ บันทึกไม่สำเร็จ ข้อมูลเดิมยังอยู่', x + pw / 2, y + 520, { size: 22, color: '#D33', outline: false });
        btns.push({ label: 'ออก', color: 'blue', forcePill: true, action: exitTo });
        btns.push({ label: 'เล่นซ้ำ', color: 'yellow', forcePill: true, action: () => b.restart() });
        if (Rz.story) btns.push({ label: 'ดูเนื้อเรื่อง ▶', color: 'pink', forcePill: true, action: () => RK.Scenes.playStory(Rz.story.chapter, 'outro', () => RK.Engine.setScene(RK.Scenes.townSelect)) });
        else if (Rz.nextId && D.stages[Rz.nextId]) btns.push({ label: 'ด่านต่อไป ▶', color: 'green', forcePill: true, action: () => { const n = D.stages[Rz.nextId]; if (n.mode === 'story') RK.Engine.setScene(RK.Scenes.stageSelect, { town: n.town, select: n.id }); else RK.Scenes.prebattle(n.id); } });
      } else if (Rz.vs) {
        A.drawFit(ctx, Rz.winner === 'zombie' ? 'BOSS_GIANT_ZOMBIE_KUMA' : 'ATK_DONUT_KUMA', x + pw / 2 - 110, y + 60, 220, 230, true);
        UI.text(ctx, `ฐานหมี ${Math.ceil(b.baseHp)} · ฐานซอมบี้ ${Math.ceil(b.vs.zBase)} · เวลา ${View.fmtTime(Rz.time)}`, x + pw / 2, y + 330, { size: 26, color: '#6B3F1C', outline: false });
        View.drawRewards(ctx, Rz.got, x + pw / 2, y + 390, 6);
        btns.push({ label: 'ออก', color: 'blue', forcePill: true, action: () => RK.Engine.setScene(RK.Scenes.modes) });
        btns.push({ label: 'เล่นอีกครั้ง', color: 'green', forcePill: true, action: () => b.restart() });
      } else {
        A.drawFit(ctx, 'ZOM_NORMAL', x + pw / 2 - 90, y + 60, 180, 200);
        if (Rz.endless) {
          UI.text(ctx, `สถิติสูงสุด WAVE ${RK.Save.data.endless.best} · กำจัด ${b.stats.killed}`, x + pw / 2, y + 300, { size: 30, color: '#6B3F1C', outline: false });
          View.drawRewards(ctx, Rz.got, x + pw / 2, y + 360, 6);
        } else {
          UI.text(ctx, 'ซอมบี้บุกถึงร้านโดนัทแล้ว!', x + pw / 2, y + 300, { size: 34, color: '#B05050', outline: false });
          UI.text(ctx, `กำจัดได้ ${b.stats.killed}/${b.totalZombies} ตัว · เวลา ${View.fmtTime(Rz.time)}`, x + pw / 2, y + 350, { size: 26, color: '#6B3F1C', outline: false });
          UI.text(ctx, 'เคล็ดลับ: อัปเกรดตัวละคร, วางกับดัก, หมุนตัวละครยิงซอมบี้ที่บินผ่าน', x + pw / 2, y + 410, { size: 22, color: '#9A6A3A', outline: false });
        }
        btns.push({ label: 'ออก', color: 'blue', forcePill: true, action: exitTo });
        if (!Rz.endless) btns.push({ label: 'อัปเกรด', color: 'pink', forcePill: true, action: () => RK.Engine.setScene(RK.Scenes.collection) });
        btns.push({ label: 'ลองใหม่', color: 'green', forcePill: true, action: () => b.restart() });
      }
      const bw = 250, gap = 26, tw = btns.length * bw + (btns.length - 1) * gap;
      Rz.btns = btns.map((o, i) => Object.assign(o, { x: x + (pw - tw) / 2 + i * (bw + gap), y: y + ph - 108, w: bw, h: 80, size: 28 }));
      Rz.btns.forEach(o => UI.button(ctx, o));
      ctx.restore();
    },
    fmtTime(s) { s = Math.round(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
  };
  // hook scene functions
  B.render = function (ctx) { View.render(this, ctx); };
  B.onTap = function (x, y) { View.onTap(this, x, y); };
  B.cardRects = function () { return this.bars[0].slots; };
})();
