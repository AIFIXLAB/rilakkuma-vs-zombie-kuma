// ===== Missions (15.12), Achievements (15.13), Daily Login (15.11), Kuma Pass =====
(function () {
  const UI = RK.UI, A = RK.Assets, E = RK.Engine, D = RK.Data;
  const Scenes = RK.Scenes, R = Scenes.R;
  const KINDS = ['daily', 'weekly', 'story', 'challenge'];
  const GOTO = { donut: 'story', kill: 'story', play: 'story', clear: 'story', placeDefender: 'story', trapUse: 'shopTrap', upgrade: 'collection', gacha: 'gacha', mpPlay: 'modes', vsWin: 'modes', coopWin: 'modes',
    endlessBest: 'endless', challengeClear: 'modes', threeStar: 'story', killBoss: 'story', rotate: 'story', sell: 'story', stagesCompleted: 'story' };
  function go(stat) {
    const g = GOTO[stat] || (stat.startsWith('townClear') ? 'story' : 'story');
    if (g === 'story') Scenes.openStory(); else if (g === 'collection') E.setScene(Scenes.collection, { upgrade: true }); else if (g === 'gacha') E.setScene(Scenes.gacha);
    else if (g === 'modes') E.setScene(Scenes.modes); else if (g === 'endless') Scenes.prebattle('ENDLESS'); else if (g === 'shopTrap') E.setScene(Scenes.shop, { tab: 3 });
  }
  function row(ctx, y, m, onClaim, onGo) {
    UI.box(ctx, 60, y, 1550, 96, m.claimed ? '#EFE6D6' : m.done ? '#FFF2C2' : '#FFF9EE', '#D9B98C', 18);
    UI.text(ctx, m.text, 90, y + 30, { size: 24, align: 'left', color: '#6B3F1C', outline: false, maxW: 650 });
    Scenes.progressBar(ctx, 90, y + 56, 520, 24, m.goal ? m.prog / m.goal : 0, m.done ? '#FFD93B' : '#8BE05F');
    UI.text(ctx, `${Math.min(m.prog, m.goal).toLocaleString()} / ${m.goal.toLocaleString()}`, 350, y + 68, { size: 17 });
    Object.keys(m.reward || {}).slice(0, 4).forEach((k, i) => UI.item(ctx, k, m.reward[k], 820 + i * 92, y + 8, 80));
    if (m.claimed) UI.btn(ctx, { x: 1360, y: y + 14, w: 220, h: 68, label: 'รับแล้ว ✓', color: 'gray', forcePill: true, disabled: true, size: 22 });
    else if (m.done) UI.btn(ctx, { x: 1360, y: y + 10, w: 220, h: 76, label: 'รับ' }, onClaim);
    else UI.btn(ctx, { x: 1360, y: y + 10, w: 220, h: 76, label: 'ไปทำ' }, onGo);
  }
  Scenes.missions = Scenes.make({
    init(a) { this.tab = a.tab || 0; },
    draw(ctx) {
      Scenes.frame(ctx, { title: 'ภารกิจ', cur: ['gold', 'gems', 'tickets'] });
      const lists = KINDS.map(k => RK.Missions.list(k)), ach = RK.Ach.list();
      const badges = lists.map(l => l.filter(m => m.done && !m.claimed).length).concat([RK.Ach.claimable()]);
      UI.tabs(ctx, ['รายวัน', 'รายสัปดาห์', 'เนื้อเรื่อง', 'ท้าทาย', 'ความสำเร็จ'], this.tab, 220, 112, 1200, 62, i => { this.tab = i; this.page = 0; }, badges);
      const per = 6;
      if (this.tab < 4) {
        const kind = KINDS[this.tab], list = lists[this.tab];
        if (kind === 'daily') UI.text(ctx, `รีเซ็ตทุกวันเวลา 00:00 · วันนี้ ${RK.Time.dayKey()}`, 836, 200, { size: 20, color: '#fff' });
        if (kind === 'weekly') UI.text(ctx, `รีเซ็ตทุกวันจันทร์ · สัปดาห์ ${RK.Time.weekKey()}`, 836, 200, { size: 20, color: '#fff' });
        list.slice(this.page * per, this.page * per + per).forEach((m, i) => row(ctx, 220 + i * 106, m, () => UI.showRewards('ภารกิจสำเร็จ!', RK.Missions.claim(kind, m.id)), () => go(m.stat)));
        UI.pager(ctx, this.page, Math.ceil(list.length / per), 600, 860, p => this.page = p);
        const n = list.filter(m => m.done && !m.claimed).length;
        UI.btn(ctx, { x: 1290, y: 850, w: 320, h: 76, label: `รับทั้งหมด (${n})`, color: 'green', forcePill: true, disabled: !n, size: 24 }, () => { const got = []; list.filter(m => m.done && !m.claimed).forEach(m => got.push(...(RK.Missions.claim(kind, m.id) || []))); UI.showRewards('รับรางวัลทั้งหมด', got); });
      } else {
        ach.slice(this.page * per, this.page * per + per).forEach((a, i) => {
          const y = 220 + i * 106;
          UI.box(ctx, 60, y, 1550, 96, a.done ? '#FFF2C2' : '#FFF9EE', '#D9B98C', 18);
          A.drawFit(ctx, 'UI_ICON_ACHIEVEMENT', 76, y + 10, 76, 76);
          UI.text(ctx, `${a.text}  (ขั้น ${Math.min(a.tier + 1, a.tiers.length)}/${a.tiers.length})`, 170, y + 30, { size: 24, align: 'left', color: '#6B3F1C', outline: false });
          for (let t = 0; t < a.tiers.length; t++) A.drawFit(ctx, t < a.tier ? 'UI_ICON_STAR' : 'UI_ICON_STAR_BRONZE', 650 + t * 34, y + 12, 30, 30);
          Scenes.progressBar(ctx, 170, y + 56, 450, 24, a.maxed ? 1 : a.value / a.goal, '#8BE05F');
          UI.text(ctx, a.maxed ? 'สำเร็จครบทุกขั้น' : `${Math.min(a.value, a.goal).toLocaleString()} / ${a.goal.toLocaleString()}`, 395, y + 68, { size: 17 });
          if (!a.maxed) Object.keys(a.nextReward).forEach((k, j) => UI.item(ctx, k, a.nextReward[k], 860 + j * 92, y + 8, 80));
          if (a.maxed) UI.btn(ctx, { x: 1360, y: y + 14, w: 220, h: 68, label: 'ครบแล้ว ✓', color: 'gray', forcePill: true, disabled: true, size: 22 });
          else UI.btn(ctx, { x: 1360, y: y + 10, w: 220, h: 76, label: 'รับ', disabled: !a.done, why: 'ยังไม่สำเร็จ' }, () => UI.showRewards('ความสำเร็จ!', RK.Ach.claim(a.id)));
        });
        UI.pager(ctx, this.page, Math.ceil(ach.length / per), 836, 860, p => this.page = p);
      }
    }
  });

  // ---------------- Daily login 7 days ----------------
  Scenes.login = Scenes.make({
    draw(ctx) {
      Scenes.frame(ctx, { title: 'เช็คชื่อรายวัน' });
      const s = RK.Login.state();
      UI.text(ctx, `ล็อกอินสะสม ${s.total} วัน · รับได้วันละ 1 ครั้ง (ตามวันที่ในเครื่อง)`, 836, 160, { size: 26, color: '#fff' });
      D.dailyLogin.forEach((d, i) => {
        const big = i === 6, r = big ? R(1216, 220, 420, 560) : R(40 + (i % 3) * 390, 220 + Math.floor(i / 3) * 290, 370, 270);
        const claimed = i < s.day && !(s.day === 0 && s.canClaim), today = i === s.day && s.canClaim;
        UI.box(ctx, r.x, r.y, r.w, r.h, today ? '#FFF2C2' : claimed ? '#EFE6D6' : '#FFF9EE', today ? '#FF7FB0' : '#D9B98C', 22);
        UI.text(ctx, `วันที่ ${i + 1}`, r.x + r.w / 2, r.y + 34, { size: 28, color: today ? '#FF5E9A' : '#6B3F1C', outline: false });
        A.fitImg(ctx, A.get(d.icon), r.x + r.w / 2 - (big ? 120 : 70), r.y + 60, big ? 240 : 140, big ? 280 : 130);
        UI.text(ctx, d.text, r.x + r.w / 2, r.y + r.h - 50, { size: 22, color: '#6B3F1C', outline: false, maxW: r.w - 20 });
        UI.text(ctx, d.label, r.x + r.w / 2, r.y + r.h - 20, { size: 16, color: '#9A6A3A', outline: false });
        if (claimed) A.drawFit(ctx, 'UI_ICON_CHECK', r.x + r.w - 70, r.y + 10, 60, 60);
      });
      UI.btn(ctx, { x: 1216, y: 800, w: 420, h: 100, label: s.canClaim ? 'รับ' : 'พรุ่งนี้มาใหม่', color: 'gray', forcePill: !s.canClaim, disabled: !s.canClaim, why: 'รับของวันนี้แล้ว' }, () => { const r = RK.Login.claim(); if (r) UI.showRewards(`เช็คชื่อวันที่ ${r.idx + 1}`, r.got); });
    }
  });

  // ---------------- Kuma Pass ----------------
  Scenes.pass = Scenes.make({
    init() { this.page = Math.floor(RK.Pass.tier() / 6); if (this.page > 4) this.page = 4; },
    draw(ctx) {
      Scenes.frame(ctx, { title: 'บัตรผ่านคุมะ', cur: ['gold', 'gems', 'passPts'] });
      const sd = RK.Save.data, tier = RK.Pass.tier(), pts = sd.cur.passPts || 0;
      UI.panel(ctx, 40, 110, 1600, 120, {});
      UI.text(ctx, `ระดับ ${tier}/30`, 160, 170, { size: 36, color: '#FF7FB0', outlineColor: '#6B3F1C' });
      Scenes.progressBar(ctx, 300, 152, 900, 36, tier >= 30 ? 1 : (pts % 100) / 100, '#FFD93B');
      UI.text(ctx, tier >= 30 ? 'สูงสุดแล้ว' : `${pts % 100}/100 แต้ม (ได้จากภารกิจรายวัน/รายสัปดาห์)`, 750, 170, { size: 18 });
      if (!sd.pass.premium) UI.btn(ctx, { x: 1230, y: 128, w: 390, h: 84, label: `ปลดล็อก Gold Pass ${D.pass.premiumPrice}💎`, color: 'yellow', forcePill: true, size: 22 },
        () => UI.confirm('ปลดล็อก Gold Pass', [`ใช้เพชร ${D.pass.premiumPrice} (เพชรในเกม ไม่ใช่เงินจริง)`, 'ได้รางวัลแถว Gold ทั้งหมด'], () => { if (RK.Pass.buyPremium()) UI.toast('ปลดล็อก Gold Pass แล้ว!'); else UI.toast('เพชรไม่พอ'); }));
      else UI.text(ctx, 'Gold Pass ✓', 1420, 170, { size: 30, color: '#E0A000' });
      UI.text(ctx, 'ฟรี', 80, 400, { size: 28, color: '#fff' }); UI.text(ctx, 'Gold', 80, 660, { size: 28, color: '#FFD93B' });
      for (let k = 0; k < 6; k++) {
        const i = this.page * 6 + k; if (i >= 30) break;
        const x = 140 + k * 250;
        UI.text(ctx, `ระดับ ${i + 1}`, x + 115, 265, { size: 22, color: i < tier ? '#FFE14D' : '#fff' });
        [['free', 300], ['prem', 560]].forEach(([tr, y]) => {
          const rw = D.pass[tr === 'free' ? 'free' : 'premium'][i], claimed = sd.pass[tr].includes(i), can = RK.Pass.can(tr, i);
          UI.box(ctx, x, y, 230, 240, claimed ? '#EFE6D6' : can ? '#FFF2C2' : '#FFF9EE', tr === 'prem' ? '#E0A000' : '#D9B98C', 18);
          Object.keys(rw).slice(0, 2).forEach((key, j) => UI.item(ctx, key, rw[key], x + 15 + j * 105, y + 20, 95));
          if (claimed) A.drawFit(ctx, 'UI_ICON_CHECK', x + 85, y + 130, 60, 60);
          else if (tr === 'prem' && !sd.pass.premium) A.drawFit(ctx, 'UI_ICON_LOCK', x + 85, y + 130, 60, 60);
          else UI.btn(ctx, { x: x + 25, y: y + 150, w: 180, h: 70, label: 'รับ', disabled: !can, why: 'ยังไม่ถึงระดับนี้' }, () => UI.showRewards(`รางวัลระดับ ${i + 1}`, RK.Pass.claim(tr, i)));
        });
      }
      UI.pager(ctx, this.page, 5, 836, 830, p => this.page = p);
    }
  });
})();
