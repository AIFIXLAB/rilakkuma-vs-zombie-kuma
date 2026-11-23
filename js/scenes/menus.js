// ===== Menu scenes: Title, Lobby (Main Menu), Select Town, Select Stage + Team, Intro comic, Settings, Profile =====
// Title / Lobby / Select Town use the user's full-screen UI art; tap areas are placed over the painted buttons.
// Painted placeholder numbers (e.g. 1,250,000 coins, Lv.42) are covered with the player's real save values.
(function () {
  const UI = RK.UI, A = RK.Assets, U = RK.util, E = RK.Engine;
  const R = (x, y, w, h) => ({ x, y, w, h });
  const Scenes = RK.Scenes = {};

  // Draw a "disabled" state over a painted button (doc 15.2 Disabled State)
  function lockOverlay(ctx, r, label) {
    ctx.save(); ctx.fillStyle = 'rgba(40,25,40,0.45)'; UI.roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 22); ctx.fill();
    A.drawFit(ctx, 'UI_ICON_LOCK', r.x + r.w - 58, r.y + 4, 52, 52);
    if (label) UI.text(ctx, label, r.x + r.w / 2, r.y + r.h - 22, { size: 18, color: '#FFE14D' });
    ctx.restore();
  }
  function pressFx(ctx, r) { ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.25)'; UI.roundRect(ctx, r.x, r.y, r.w, r.h, 24); ctx.fill(); ctx.restore(); }
  function hotspotScene(def) {
    return Object.assign({
      pressed: null, pressT: 0,
      onTap(x, y) {
        for (const h of this.spots()) if (U.inRect(x, y, h.r)) {
          RK.Audio.play('buttonClick'); this.pressed = h; this.pressT = 0.15;
          if (h.locked) { UI.toast(h.locked); return; }
          h.go(); return;
        }
        if (this.onTapElse) this.onTapElse(x, y);
      },
      update(dt) { this.pressT = Math.max(0, this.pressT - dt); },
      drawSpots(ctx) { for (const h of this.spots()) { if (h.lockLabel) lockOverlay(ctx, h.r, h.lockLabel); } if (this.pressT > 0 && this.pressed) pressFx(ctx, this.pressed.r); }
    }, def);
  }

  // ---------------- Title Screen (doc 15.1) ----------------
  Scenes.title = hotspotScene({
    enter() { RK.Audio.play('bgmMenu'); this.t = 0; },
    spots() {
      const s = [
        { r: R(620, 637, 460, 120), go: () => E.setScene(Scenes.lobby) },                        // เริ่มเกม -> Main Menu
        { r: R(296, 773, 168, 147), go: () => Scenes.openSettings() },                             // ตั้งค่า
        { r: R(517, 773, 174, 147), go: () => Scenes.openProfile() },                              // บัญชี
        { r: R(747, 773, 173, 147), go: () => UI.openModal({ title: 'ประกาศ', lines: ['RILAKKUMA vs ZOMBIE KUMA', 'Prototype Phase 1 — Town 1 ด่าน 1–5', 'ระบบอื่นจะเปิดตาม Phase ถัดไป'], buttons: [{ label: 'ตกลง', color: 'green', forcePill: true }] }) },
        { r: R(977, 773, 174, 147), locked: 'กิจกรรม (Event) จะเปิดใน Phase 4' },
        { r: R(1204, 773, 173, 147), go: () => Scenes.openHelp() }
      ];
      if (RK.Save.hasSave) s.push({ r: R(1110, 660, 290, 84), go: () => Scenes.continueGame() });   // Continue
      return s;
    },
    render(ctx) {
      this.t = (this.t || 0) + 1 / 60;
      A.drawFit(ctx, 'BG_TITLE', 0, 0, E.W, E.H);
      if (RK.Save.hasSave) UI.button(ctx, { label: 'เล่นต่อ', icon: 'UI_ICON_PLAY', color: 'pink', forcePill: true, x: 1110, y: 660, w: 290, h: 84, size: 34 });
      this.drawSpots(ctx);
      UI.text(ctx, 'v' + RK.Data.config.version, E.W - 20, E.H - 18, { size: 16, align: 'right', color: '#fff' });
    }
  });
  Scenes.continueGame = function () {
    const last = RK.Save.data.lastStage;
    const town = last ? RK.Data.stages[last] && RK.Data.stages[last].town : 1;
    E.setScene(Scenes.stageSelect, { town: town || 1 });
  };

  // ---------------- Lobby / Main Menu (doc 15.2) ----------------
  Scenes.lobby = hotspotScene({
    enter() { this.t = 0; RK.Audio.play('bgmMenu'); },
    spots() {
      return [
        { r: R(720, 133, 553, 254), go: () => Scenes.openStory() },                                         // Story Mode
        { r: R(1291, 133, 366, 254), locked: 'VS Mode จะเปิดใน Phase 5', lockLabel: 'VS · Phase 5' },
        { r: R(700, 403, 300, 170), locked: 'โหมดไม่รู้จบ ยังไม่อยู่ในเอกสารออกแบบ' },
        { r: R(1009, 403, 204, 170), locked: 'Mission จะเปิดใน Phase 4', lockLabel: 'Phase 4' },
        { r: R(1224, 403, 213, 170), locked: 'Upgrade จะเปิดใน Phase 2', lockLabel: 'Phase 2' },
        { r: R(1447, 403, 210, 170), go: () => Scenes.openCollection(), },                                   // simple collection list
        { r: R(649, 600, 442, 187), locked: 'Event จะเปิดใน Phase 4', lockLabel: 'Phase 4' },
        { r: R(1104, 616, 133, 157), locked: 'Shop จะเปิดใน Phase 4', lockLabel: 'Phase 4' },
        { r: R(1251, 616, 129, 157), locked: 'Gacha จะเปิดใน Phase 4', lockLabel: 'Phase 4' },
        { r: R(1391, 616, 129, 157), locked: 'Event จะเปิดใน Phase 4', lockLabel: 'Phase 4' },
        { r: R(1531, 616, 126, 157), locked: 'Pass ยังไม่อยู่ในเอกสารออกแบบ' },
        { r: R(16, 143, 124, 124), locked: 'กล่องของขวัญ จะเปิดใน Phase 4' },
        { r: R(16, 276, 124, 111), locked: 'อันดับ ต้องใช้ Online (ภายหลัง)' },
        { r: R(16, 387, 124, 113), locked: 'เพื่อน ต้องใช้ Online (ภายหลัง)' },
        { r: R(16, 507, 124, 106), locked: 'Daily Login จะเปิดใน Phase 4' },
        { r: R(16, 627, 124, 113), locked: 'ข่าวสาร จะเปิดใน Phase 4' },
        { r: R(1447, 13, 86, 74), locked: 'จดหมาย จะเปิดใน Phase 4' },
        { r: R(1573, 13, 87, 74), go: () => Scenes.openSettings() },
        { r: R(16, 16, 391, 117), go: () => Scenes.openProfile() },
        { r: R(1490, 860, 170, 70), go: () => E.setScene(Scenes.title) }
      ];
    },
    render(ctx) {
      A.drawFit(ctx, 'BG_LOBBY', 0, 0, E.W, E.H);
      const sd = RK.Save.data, p = sd.profile;
      // profile patch (real name / level / exp)
      ctx.fillStyle = '#FFF6E6'; UI.roundRect(ctx, 150, 24, 250, 102, 14); ctx.fill();
      UI.text(ctx, p.name, 160, 46, { size: 26, align: 'left', color: '#6B3F1C', outline: false });
      UI.text(ctx, 'Lv.' + p.level, 160, 84, { size: 24, align: 'left', color: '#FF7FB0', outlineColor: '#fff' });
      ctx.fillStyle = '#E8D7BE'; UI.roundRect(ctx, 232, 74, 156, 20, 10); ctx.fill();
      ctx.fillStyle = '#FFD93B'; UI.roundRect(ctx, 234, 76, Math.max(8, 152 * p.exp / (p.level * 100)), 16, 8); ctx.fill();
      UI.text(ctx, `${p.exp} / ${p.level * 100}`, 310, 112, { size: 18, color: '#8B5A2B', outline: false });
      // currency patches
      const pill = (x, w, txt) => { ctx.fillStyle = '#FFFFFF'; UI.roundRect(ctx, x, 26, w, 42, 18); ctx.fill(); UI.text(ctx, txt, x + w / 2, 48, { size: 28, color: '#5A3212', outline: false }); };
      pill(512, 186, '—'); pill(845, 186, sd.gold.toLocaleString()); pill(1176, 172, sd.gems.toLocaleString());
      // bottom quest bar = Mission system (Phase 4)
      ctx.fillStyle = 'rgba(60,35,20,0.86)'; UI.roundRect(ctx, 104, 818, 1372, 108, 28); ctx.fill();
      UI.text(ctx, 'ภารกิจรายวัน / รายสัปดาห์ / รางวัลล็อกอิน — เปิดใน Phase 4', 790, 872, { size: 28, color: '#FFF4DE' });
      UI.button(ctx, { label: 'กลับ', icon: 'UI_ICON_ARROW_LEFT', color: 'gray', forcePill: true, x: 1490, y: 860, w: 170, h: 70, size: 26 });
      this.drawSpots(ctx);
      // Collection button is live: show nothing over it
    }
  });

  Scenes.openStory = function () {
    if (!RK.Save.data.seenIntro) { E.setScene(Scenes.intro); return; }
    E.setScene(Scenes.townSelect);
  };

  // ---------------- Story intro comic (doc PART 19) ----------------
  Scenes.intro = {
    enter() { this.t = 0; },
    update(dt) { this.t += dt; },
    onTap(x, y) {
      if (this.t < 0.4) return;
      RK.Save.data.seenIntro = true; RK.Save.save('intro');
      if (U.inRect(x, y, R(1290, 810, 360, 110)) || U.inRect(x, y, R(20, 860, 220, 70))) E.setScene(Scenes.townSelect);
    },
    render(ctx) {
      A.drawFit(ctx, 'CUT_INTRO', 0, 0, E.W, E.H);
      if (Math.sin(this.t * 4) > 0) { ctx.strokeStyle = '#FFE14D'; ctx.lineWidth = 6; UI.roundRect(ctx, 1290, 815, 360, 100, 40); ctx.stroke(); }
      UI.button(ctx, { label: 'ข้าม', color: 'gray', forcePill: true, x: 20, y: 860, w: 220, h: 70, size: 28 });
    }
  };

  // ---------------- Select Town (doc 15.3) ----------------
  const TOWN_CARDS = [R(83, 157, 257, 303), R(353, 157, 254, 303), R(616, 157, 257, 303), R(884, 157, 256, 303), R(83, 487, 257, 286), R(353, 487, 254, 286), R(616, 487, 257, 286), R(884, 487, 256, 286)];
  const STAR_TXT = [[237, 437], [507, 437], [771, 437], [1037, 437], [237, 740], [507, 740], [771, 740], [1037, 740]];
  Scenes.townSelect = hotspotScene({
    enter() { this.sel = 1; RK.Audio.play('bgmMenu'); },
    spots() {
      const s = TOWN_CARDS.map((r, i) => ({ r, go: () => this.tapTown(i + 1) }));
      s.push({ r: R(1213, 751, 400, 109), go: () => this.enterTown() });          // เริ่มเล่น
      s.push({ r: R(10, 868, 200, 66), go: () => E.setScene(Scenes.lobby) });       // back
      return s;
    },
    tapTown(n) {
      const town = RK.Data.towns[n - 1], unlocked = RK.Save.data.towns.unlocked.includes(n);
      if (!unlocked) { UI.openModal({ title: `Town ${n} · ${town.name}`, lines: [{ t: 'ยังไม่ปลดล็อก', size: 34, color: '#B05050' }, `เงื่อนไข: ผ่าน Town ${n - 1} Stage 15`, `บอสประจำเมือง: ${town.boss}`, { t: 'เนื้อหาเมืองนี้จะเพิ่มใน Phase 3', size: 22, color: '#9A6A3A' }], buttons: [{ label: 'ตกลง', color: 'green', forcePill: true }] }); return; }
      if (this.sel === n) return this.enterTown();
      this.sel = n;
    },
    enterTown() { E.setScene(Scenes.stageSelect, { town: this.sel }); },
    render(ctx) {
      A.drawFit(ctx, 'BG_SELECT_TOWN', 0, 0, E.W, E.H);
      const sd = RK.Save.data;
      RK.Data.towns.forEach((t, i) => {
        const r = TOWN_CARDS[i], unlocked = sd.towns.unlocked.includes(t.id), [cx, cy] = STAR_TXT[i];
        ctx.fillStyle = 'rgba(70,40,60,0.96)'; UI.roundRect(ctx, cx - 40, cy - 19, 84, 38, 12); ctx.fill();
        UI.text(ctx, `${RK.Save.totalStars(t.id)}/${RK.Data.stagesPerTown * 3}`, cx + 2, cy + 1, { size: 22, outlineColor: '#3a1a30' });
        if (!unlocked) { ctx.fillStyle = 'rgba(30,20,40,0.55)'; UI.roundRect(ctx, r.x + 6, r.y + 6, r.w - 12, r.h - 12, 26); ctx.fill(); A.drawFit(ctx, 'UI_ICON_LOCK', r.x + r.w / 2 - 50, r.y + r.h / 2 - 80, 100, 100); }
        if (this.sel === t.id) { ctx.strokeStyle = '#FFE14D'; ctx.lineWidth = 8; UI.roundRect(ctx, r.x, r.y, r.w, r.h, 30); ctx.stroke(); }
      });
      // patch the painted wave count on the info panel with the real stage-cleared count for Town 1
      ctx.fillStyle = 'rgba(120,30,60,0.97)'; UI.roundRect(ctx, 1424, 428, 210, 54, 22); ctx.fill();
      UI.text(ctx, `ผ่าน ${RK.Save.clearedCount(this.sel)}/${RK.Data.stagesPerTown}`, 1529, 456, { size: 26 });
      UI.button(ctx, { label: 'กลับ', icon: 'UI_ICON_ARROW_LEFT', color: 'gray', forcePill: true, x: 10, y: 868, w: 200, h: 66, size: 26 });
      this.drawSpots(ctx);
    }
  });

  // ---------------- Select Stage + Team (doc 15.4 / 15.5 lite) ----------------
  Scenes.stageSelect = {
    enter(a) { this.town = a.town || 1; this.sel = a.select || this.firstOpen(); this.t = 0; RK.Audio.play('bgmMenu'); },
    firstOpen() { const sd = RK.Save.data; let last = 'T' + this.town + '-S1'; for (let n = 1; n <= RK.Data.stagesPerTown; n++) { const id = `T${this.town}-S${n}`; if (sd.unlockedStages.includes(id) && RK.Data.stages[id]) last = id; } return last; },
    update(dt) { this.t += dt; },
    nodeRect(n) { const i = n - 1, col = i % 5, row = Math.floor(i / 5); return R(70 + col * 182, 170 + row * 200, 150, 160); },
    deckRects() { const owned = Object.keys(RK.Save.data.characters.owned).filter(id => id !== 'FACTORY'); return owned.map((id, i) => ({ id, r: R(1018 + (i % 5) * 124, 455 + Math.floor(i / 5) * 128, 116, 120) })); },
    onTap(x, y) {
      const sd = RK.Save.data;
      if (U.inRect(x, y, R(20, 860, 200, 66))) return E.setScene(Scenes.townSelect);
      for (let n = 1; n <= RK.Data.stagesPerTown; n++) if (U.inRect(x, y, this.nodeRect(n))) {
        const id = `T${this.town}-S${n}`;
        if (!RK.Data.stages[id]) return UI.toast(`ด่าน ${n} จะเพิ่มใน Phase 3`);
        if (!sd.unlockedStages.includes(id)) return UI.toast(`ผ่านด่าน ${n - 1} ก่อนเพื่อปลดล็อก`);
        RK.Audio.play('buttonClick'); this.sel = id; return;
      }
      for (const d of this.deckRects()) if (U.inRect(x, y, d.r)) {
        const i = sd.deck.indexOf(d.id);
        if (i >= 0) sd.deck.splice(i, 1); else if (sd.deck.length < RK.Data.maxDeck) sd.deck.push(d.id); else UI.toast(`จัดทีมได้สูงสุด ${RK.Data.maxDeck} ตัว (+เครื่องโดนัท)`);
        RK.Save.save('deck'); RK.Audio.play('buttonClick'); return;
      }
      if (U.inRect(x, y, R(1210, 830, 420, 96))) return this.start();
    },
    start() {
      const sd = RK.Save.data;
      if (!sd.deck.some(id => RK.Data.characters[id] && RK.Data.characters[id].role === 'Attacker')) return UI.toast('ทีมต้องมีตัวโจมตีอย่างน้อย 1 ตัว');
      RK.Audio.play('buttonClick');
      E.setScene(RK.Battle, { stageId: this.sel, deck: sd.deck.slice() });
    },
    render(ctx) {
      const sd = RK.Save.data, town = RK.Data.towns[this.town - 1], st = RK.Data.stages[this.sel];
      A.drawFit(ctx, RK.Data.maps[town.map] ? RK.Data.maps[town.map].asset : 'MAP_TOWN1', 0, 0, E.W, E.H);
      ctx.fillStyle = 'rgba(255,244,222,0.35)'; ctx.fillRect(0, 0, E.W, E.H);
      UI.panel(ctx, 30, 120, 950, 720, { title: `Town ${town.id} · ${town.name}` });
      for (let n = 1; n <= RK.Data.stagesPerTown; n++) {
        const id = `T${this.town}-S${n}`, r = this.nodeRect(n), built = !!RK.Data.stages[id], open = built && sd.unlockedStages.includes(id), rec = sd.stages[id];
        const isBoss = n === 15, isMini = n === 10;
        A.drawFit(ctx, 'UI_CARD_FRAME_EMPTY', r.x, r.y, r.w, r.h);
        if (this.sel === id) { ctx.strokeStyle = '#FF7FB0'; ctx.lineWidth = 7; UI.roundRect(ctx, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 26); ctx.stroke(); }
        UI.text(ctx, String(n), r.x + r.w / 2, r.y + 62, { size: 54, color: open ? (isBoss ? '#FF6B6B' : isMini ? '#FFB13B' : '#FFE14D') : '#C8B8A8' });
        if (isBoss || isMini) UI.text(ctx, isBoss ? 'BOSS' : 'MINI BOSS', r.x + r.w / 2, r.y + 18, { size: 16, color: '#FF6B6B' });
        for (let s = 0; s < 3; s++) A.drawFit(ctx, rec && rec.stars[s] ? 'UI_ICON_STAR' : 'UI_ICON_STAR_BRONZE', r.x + 16 + s * 40, r.y + 102, 38, 38), ctx.globalAlpha = 1;
        if (!open) { ctx.fillStyle = 'rgba(60,40,30,0.45)'; UI.roundRect(ctx, r.x + 8, r.y + 8, r.w - 16, r.h - 16, 22); ctx.fill(); A.drawFit(ctx, 'UI_ICON_LOCK', r.x + r.w / 2 - 30, r.y + 40, 60, 60); if (!built) UI.text(ctx, 'Phase 3', r.x + r.w / 2, r.y + 120, { size: 18 }); }
      }
      // stage info
      UI.panel(ctx, 1000, 30, 650, 380, { r: 26 });
      if (st) {
        UI.text(ctx, `Stage ${st.number}: ${st.name}`, 1325, 80, { size: 32, color: '#6B3F1C', outline: false });
        UI.text(ctx, `Wave ${st.waves.length} · โดนัทเริ่มต้น ${st.startingDonut} · พลังแนะนำ ${st.recommendedPower}`, 1325, 122, { size: 20, color: '#9A6A3A', outline: false });
        const ens = []; st.waves.forEach(w => w.spawns.forEach(g => { if (!ens.includes(g.enemy)) ens.push(g.enemy); }));
        UI.text(ctx, 'ศัตรูในด่าน', 1090, 160, { size: 20, color: '#9A6A3A', outline: false });
        ens.forEach((id, i) => A.drawFit(ctx, RK.Data.enemies[id].asset, 1030 + i * 88, 175, 82, 92, true));
        UI.text(ctx, 'รางวัล', 1060, 300, { size: 20, color: '#9A6A3A', outline: false });
        A.drawFit(ctx, 'UI_ICON_COIN', 1100, 278, 44, 44); UI.text(ctx, '' + st.reward.gold, 1180, 300, { size: 26 });
        A.drawFit(ctx, 'UI_ICON_EXP', 1230, 276, 50, 50); UI.text(ctx, '' + st.reward.exp, 1305, 300, { size: 26 });
        (st.reward.unlock || []).forEach((id, i) => { if (!RK.Save.isOwned(id)) A.drawFit(ctx, RK.Data.characters[id].asset, 1360 + i * 72, 262, 66, 70, true); });
        st.stars.forEach((s, i) => UI.text(ctx, `★ ${s.text}`, 1030, 345 + i * 22, { size: 18, align: 'left', color: (sd.stages[st.id] || { stars: [] }).stars[i] ? '#3E9A2B' : '#9A6A3A', outline: false }));
      }
      // team
      UI.panel(ctx, 1000, 420, 650, 400, { r: 26 });
      UI.text(ctx, `ทีม ${sd.deck.length}/${RK.Data.maxDeck} (แตะเพื่อเลือก/ถอด) · เครื่องโดนัทมีเสมอ`, 1325, 440, { size: 20, color: '#9A6A3A', outline: false });
      for (const d of this.deckRects()) {
        const c = RK.Data.characters[d.id], on = sd.deck.includes(d.id);
        A.drawFit(ctx, 'UI_CARD_FRAME_EMPTY', d.r.x, d.r.y, d.r.w, d.r.h);
        A.drawFit(ctx, c.asset, d.r.x + 10, d.r.y + 8, d.r.w - 20, d.r.h - 34, true);
        UI.text(ctx, `${c.cost}`, d.r.x + d.r.w / 2, d.r.y + d.r.h - 16, { size: 18, color: '#FFE14D' });
        UI.text(ctx, c.role === 'Defender' ? 'DEF' : 'ATK', d.r.x + 24, d.r.y + 16, { size: 14, color: c.role === 'Defender' ? '#7FD7FF' : '#FF9B9B' });
        if (!on) { ctx.fillStyle = 'rgba(80,60,50,0.5)'; UI.roundRect(ctx, d.r.x + 4, d.r.y + 4, d.r.w - 8, d.r.h - 8, 18); ctx.fill(); }
        else A.drawFit(ctx, 'UI_ICON_CHECK', d.r.x + d.r.w - 38, d.r.y - 4, 40, 40);
      }
      UI.button(ctx, { label: 'เริ่มเกม', x: 1260, y: 830, w: 340, h: 96 });
      UI.button(ctx, { label: 'กลับ', icon: 'UI_ICON_ARROW_LEFT', color: 'gray', forcePill: true, x: 20, y: 860, w: 200, h: 66, size: 26 });
    }
  };

  // ---------------- Modals ----------------
  Scenes.openSettings = function (onClose) {
    const s = RK.Save.data.settings;
    const rows = [['เพลงประกอบ (แต่งใหม่อัตโนมัติ)', 'musicOn'], ['แสดง HP Bar ตลอดเวลา', 'hpBarAlways'], ['แสดงตัวเลขดาเมจ', 'damageNumbers'], ['หยุดเกมอัตโนมัติเมื่อสลับแอป', 'autoPause']];
    UI.openModal({ title: 'ตั้งค่า', w: 860, h: 700, customButtons: true,
      draw(ctx, b) {
        rows.forEach((r, i) => { UI.text(ctx, r[0], b.x + 70, b.y + 100 + i * 80, { size: 28, align: 'left', color: '#6B3F1C', outline: false }); A.drawFit(ctx, s[r[1]] ? 'UI_TOGGLE_ON' : 'UI_TOGGLE_OFF', b.x + b.w - 230, b.y + 72 + i * 80, 160, 58); });
        const vy = b.y + 72 + rows.length * 80;
        UI.text(ctx, 'ความดังเพลง', b.x + 70, vy + 29, { size: 28, align: 'left', color: '#6B3F1C', outline: false });
        for (let k = 0; k < 5; k++) { ctx.fillStyle = s.music >= (k + 1) * 0.2 - 0.01 ? '#FF7FB0' : '#E8D7BE'; UI.roundRect(ctx, b.x + b.w - 330 + k * 52, vy + 34 - k * 7, 40, 20 + k * 7, 8); ctx.fill(); }
        const mi = RK.Music.info();
        UI.text(ctx, mi ? `กำลังเล่น: เพลงที่ ${mi.song} · ${mi.bpm} BPM · ${mi.scale}` : 'เพลงจะเริ่มหลังแตะหน้าจอครั้งแรก', b.x + 70, vy + 100, { size: 20, align: 'left', color: '#9A6A3A', outline: false });
        UI.text(ctx, 'เสียงเอฟเฟกต์: ยังไม่มีไฟล์เสียงใน Asset', b.x + 70, vy + 130, { size: 20, align: 'left', color: '#9A6A3A', outline: false });
        UI.modal._btns = [
          ...rows.map((r, i) => ({ x: b.x + b.w - 230, y: b.y + 72 + i * 80, w: 160, h: 58, keepOpen: true, invisible: true, label: '', action: () => { s[r[1]] = !s[r[1]]; RK.Save.save('settings'); RK.Music.applyVolume(); } })),
          ...[0, 1, 2, 3, 4].map(k => ({ x: b.x + b.w - 336 + k * 52, y: b.y + 72 + rows.length * 80, w: 52, h: 60, keepOpen: true, invisible: true, label: '', action: () => { s.music = (k + 1) * 0.2; RK.Save.save('settings'); RK.Music.applyVolume(); } })),
          { label: 'รีเซ็ตข้อมูล', color: 'red', forcePill: true, x: b.x + 70, y: b.y + b.h - 120, w: 300, h: 80, size: 28, action: () => Scenes.resetData(onClose) },
          { label: 'ปิด', color: 'green', forcePill: true, x: b.x + b.w - 320, y: b.y + b.h - 120, w: 250, h: 80, size: 30, action: () => onClose && onClose() }
        ];
      } });
  };
  // Reset needs two confirmations (doc 15.16)
  Scenes.resetData = function (onClose) {
    UI.confirm('รีเซ็ตข้อมูล?', ['ความคืบหน้าทั้งหมดจะถูกลบ', 'แน่ใจหรือไม่?'], () => {
      UI.confirm('ยืนยันครั้งที่ 2', [{ t: 'ลบข้อมูลทั้งหมดจริง ๆ ?', color: '#B05050' }, 'ย้อนกลับไม่ได้'], () => { RK.Save.reset(); UI.toast('รีเซ็ตข้อมูลแล้ว'); E.setScene(Scenes.title); }, 'ลบข้อมูล');
    }, 'ดำเนินการต่อ');
  };
  Scenes.openProfile = function () {
    const d = RK.Save.data, p = d.profile, s = d.stats;
    UI.openModal({ title: 'โปรไฟล์', w: 820, h: 600,
      lines: [`Player ID: ${p.playerId}`, `ชื่อ: ${p.name} · Lv.${p.level} (EXP ${p.exp}/${p.level * 100})`, `ชนะ ${s.wins} · แพ้ ${s.losses} · ด่านที่ผ่าน ${s.stagesCompleted}`,
        `ตัวละครที่มี ${Object.keys(d.characters.owned).length} · ทอง ${d.gold}`, `กำจัดซอมบี้ ${s.zombiesKilled} · เก็บโดนัท ${s.donutsCollected}`],
      buttons: [{ label: 'เปลี่ยนชื่อ', color: 'blue', forcePill: true, action: () => { let n = null; try { n = window.prompt('ชื่อผู้เล่น', p.name); } catch (e) { } if (n && n.trim()) { p.name = n.trim().slice(0, 14); RK.Save.save('rename'); } else if (n === null) UI.toast('เปลี่ยนชื่อไม่ได้ในหน้านี้'); } }, { label: 'ปิด', color: 'green', forcePill: true }] });
  };
  Scenes.openHelp = function () {
    UI.openModal({ title: 'วิธีเล่น', w: 980, h: 600, lines: ['วางเครื่องผลิตโดนัท แล้ว "แตะ" โดนัทที่เด้งออกมาเพื่อเก็บ', 'ใช้โดนัทวางตัวละคร: ตัวโจมตียิงซอมบี้ในแถวเดียวกัน', 'ตัวป้องกันขวางซอมบี้ไว้ ซอมบี้ระยะไกลจะขว้างของใส่', 'แตะเครื่องผลิตเพื่ออัปเกรด (Lv.1–5)', 'ปกป้องร้านโดนัทด้านซ้ายจนครบทุก Wave!'], buttons: [{ label: 'เข้าใจแล้ว', color: 'green', forcePill: true }] });
  };
  Scenes.openCollection = function () {
    const all = Object.values(RK.Data.characters);
    UI.openModal({ title: 'สะสมตัวละคร', w: 1280, h: 700, customButtons: true,
      draw(ctx, b) {
        all.forEach((c, i) => {
          const x = b.x + 40 + (i % 8) * 150, y = b.y + 60 + Math.floor(i / 8) * 250, own = RK.Save.isOwned(c.id);
          A.drawFit(ctx, 'UI_CARD_FRAME_EMPTY', x, y, 138, 180);
          ctx.save(); if (!own) ctx.filter = 'brightness(0) opacity(0.45)'; A.drawFit(ctx, c.isFactory ? 'FACTORY_LV1' : c.asset, x + 10, y + 10, 118, 150, true); ctx.restore();
          UI.text(ctx, own ? c.nameTH : '???', x + 69, y + 200, { size: 18, color: '#6B3F1C', outline: false });
          UI.text(ctx, own ? `${c.role} · ${c.cost}` : 'ผ่านด่านเพื่อปลดล็อก', x + 69, y + 224, { size: 15, color: '#9A6A3A', outline: false });
        });
        UI.modal._btns = [{ label: 'ปิด', color: 'green', forcePill: true, x: b.x + b.w / 2 - 120, y: b.y + b.h - 100, w: 240, h: 76, size: 30 }];
      } });
  };
})();
