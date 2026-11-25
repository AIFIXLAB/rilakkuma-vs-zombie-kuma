// ===== Main scenes: Title, Lobby (Main Menu), Story player, Select Town, Select Stage, Pre-battle, Settings, Profile, News, Gift box, Friends, Ranking =====
(function () {
  const UI = RK.UI, A = RK.Assets, U = RK.util, E = RK.Engine, D = RK.Data;
  const Scenes = RK.Scenes, R = Scenes.R;

  function lockOverlay(ctx, r, label) {
    ctx.save(); ctx.fillStyle = 'rgba(40,25,40,0.45)'; UI.roundRect(ctx, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 22); ctx.fill();
    A.drawFit(ctx, 'UI_ICON_LOCK', r.x + r.w - 58, r.y + 4, 52, 52);
    if (label) UI.text(ctx, label, r.x + r.w / 2, r.y + r.h - 22, { size: 18, color: '#FFE14D' });
    ctx.restore();
  }

  // ---------------- Title Screen (doc 15.1) ----------------
  Scenes.title = Scenes.make({
    init() { RK.Audio.play('bgmMenu'); },
    draw(ctx) {
      A.drawFit(ctx, 'BG_TITLE', 0, 0, E.W, E.H);
      UI.area(R(620, 637, 460, 120), () => { RK.Audio.play('buttonClick'); E.setScene(Scenes.lobby); });
      UI.area(R(296, 773, 168, 147), () => Scenes.openSettings());
      UI.area(R(517, 773, 174, 147), () => Scenes.openProfile());
      UI.area(R(747, 773, 173, 147), () => E.setScene(Scenes.news));
      UI.area(R(977, 773, 174, 147), () => E.setScene(Scenes.eventsList));
      UI.area(R(1204, 773, 173, 147), () => Scenes.openHelp());
      if (RK.Save.hasSave) UI.btn(ctx, { label: 'เล่นต่อ', icon: 'UI_ICON_PLAY', color: 'pink', forcePill: true, x: 1110, y: 660, w: 290, h: 84, size: 34 }, () => Scenes.continueGame());
      UI.text(ctx, 'v' + D.config.version, E.W - 20, E.H - 18, { size: 16, align: 'right', color: '#fff' });
    }
  });
  Scenes.continueGame = function () {
    const last = RK.Save.data.lastStage, st = last && D.stages[last];
    E.setScene(Scenes.stageSelect, { town: st ? st.town : 1 });
  };

  // ---------------- Lobby / Main Menu (doc 15.2) — every painted button opens a working screen ----------------
  Scenes.lobby = Scenes.make({
    init() { RK.Audio.play('bgmMenu'); RK.Missions.roll(); },
    draw(ctx) {
      A.drawFit(ctx, 'BG_LOBBY', 0, 0, E.W, E.H);
      const sd = RK.Save.data, p = sd.profile;
      const go = (s, a) => () => { RK.Audio.play('buttonClick'); E.setScene(s, a); };
      const spots = [
        [R(720, 133, 553, 254), () => Scenes.openStory()],
        [R(1291, 133, 366, 254), go(Scenes.modes)],
        [R(700, 403, 300, 170), () => Scenes.prebattle('ENDLESS')],
        [R(1009, 403, 204, 170), go(Scenes.missions)],
        [R(1224, 403, 213, 170), go(Scenes.collection, { upgrade: true })],
        [R(1447, 403, 210, 170), go(Scenes.collection)],
        [R(649, 600, 442, 187), go(Scenes.event, { id: RK.EventsSys.active().id })],
        [R(1104, 616, 133, 157), go(Scenes.shop)],
        [R(1251, 616, 129, 157), go(Scenes.gacha)],
        [R(1391, 616, 129, 157), go(Scenes.eventsList)],
        [R(1531, 616, 126, 157), go(Scenes.pass)],
        [R(16, 143, 124, 124), go(Scenes.gift)],
        [R(16, 276, 124, 111), go(Scenes.ranking)],
        [R(16, 387, 124, 113), go(Scenes.friends)],
        [R(16, 507, 124, 106), go(Scenes.login)],
        [R(16, 627, 124, 113), go(Scenes.news)],
        [R(1447, 13, 86, 74), go(Scenes.gift, { tab: 2 })],
        [R(1573, 13, 87, 74), () => Scenes.openSettings()],
        [R(16, 16, 391, 117), () => Scenes.openProfile()]
      ];
      spots.forEach(s => UI.area(s[0], s[1]));
      // live profile (covers painted placeholder)
      ctx.fillStyle = '#FFF6E6'; UI.roundRect(ctx, 150, 24, 250, 102, 14); ctx.fill();
      A.fitImg(ctx, A.get(p.avatar), 32, 26, 100, 96);
      UI.text(ctx, p.name, 160, 46, { size: 26, align: 'left', color: '#6B3F1C', outline: false, maxW: 230 });
      UI.text(ctx, 'Lv.' + p.level, 160, 84, { size: 24, align: 'left', color: '#FF7FB0', outlineColor: '#fff' });
      Scenes.progressBar(ctx, 232, 74, 156, 20, p.exp / (p.level * 100), '#FFD93B');
      UI.text(ctx, `${p.exp} / ${p.level * 100}`, 310, 112, { size: 18, color: '#8B5A2B', outline: false });
      const pill = (x, w, icon, txt) => { ctx.fillStyle = '#FFFFFF'; UI.roundRect(ctx, x - 70, 22, w + 70, 50, 22); ctx.fill(); A.drawFit(ctx, icon, x - 64, 24, 46, 46); UI.text(ctx, txt, x + w / 2 - 10, 48, { size: 28, color: '#5A3212', outline: false }); };
      pill(560, 186, 'UI_ICON_TICKET', `${sd.cur.tickets}`); pill(890, 186, 'UI_ICON_COIN', RK.Eco.fmt(sd.cur.gold)); pill(1210, 172, 'UI_ICON_GEM', RK.Eco.fmt(sd.cur.gems));
      // live daily / weekly / login bar (painted boxes, live numbers)
      const dl = RK.Missions.list('daily'), wl = RK.Missions.list('weekly'), lg = RK.Login.state();
      const dDone = dl.filter(m => m.done).length, wDone = wl.filter(m => m.done).length;
      const patch = (x, y, w, h, txt) => { ctx.fillStyle = '#F3E3C8'; UI.roundRect(ctx, x, y, w, h, 10); ctx.fill(); UI.text(ctx, txt, x + w / 2, y + h / 2, { size: 22, color: '#6B3F1C', outline: false }); };
      Scenes.progressBar(ctx, 215, 872, 315, 26, dDone / dl.length, '#FFD93B'); patch(445, 868, 90, 34, `${dDone}/${dl.length}`);
      Scenes.progressBar(ctx, 700, 872, 360, 26, wDone / wl.length, '#FFD93B'); patch(975, 868, 100, 34, `${wDone}/${wl.length}`);
      UI.area(R(133, 824, 420, 96), go(Scenes.missions)); UI.area(R(580, 824, 500, 96), go(Scenes.missions, { tab: 1 }));
      UI.btn(ctx, { x: 1380, y: 842, w: 175, h: 64, label: lg.canClaim ? 'รับได้แล้ว!' : 'รับแล้ว ✓', color: lg.canClaim ? 'yellow' : 'gray', forcePill: true, size: 22 }, go(Scenes.login));
      // badges for claimables
      Scenes.dot(ctx, 1200, 418, RK.Missions.claimable()); Scenes.dot(ctx, 1640, 630, RK.Pass.claimable()); Scenes.dot(ctx, 130, 520, lg.canClaim ? 1 : 0);
      const ev = RK.EventsSys.active();
      // live event banner (covers the painted Halloween example text)
      ctx.fillStyle = '#5B2C7A'; UI.roundRect(ctx, 664, 614, 270, 156, 18); ctx.fill();
      ctx.fillStyle = '#7B3FA0'; UI.roundRect(ctx, 672, 622, 254, 140, 14); ctx.fill();
      UI.text(ctx, 'กิจกรรมพิเศษ!', 799, 646, { size: 22, color: '#FFB3D9' });
      UI.text(ctx, ev.nameTH, 799, 690, { size: 34, color: '#FFE14D', outlineColor: '#3a1a40', maxW: 240 });
      UI.text(ctx, 'เหลือ ' + Math.ceil((RK.EventsSys.endsAt() - Date.now()) / 86400000) + ' วัน · แตะเพื่อเล่น', 799, 738, { size: 16, outline: false, color: '#fff' });
      ctx.fillStyle = '#FFF4DE'; UI.roundRect(ctx, 936, 640, 140, 135, 20); ctx.fill();
      A.fitImg(ctx, A.get(ev.banner), 940, 640, 132, 130, true);
    }
  });
  Scenes.openStory = function () {
    if (!RK.Save.data.seenStory.c1i) { RK.Save.data.seenStory.c1i = true; RK.Save.save('story'); E.setScene(Scenes.intro); return; }
    E.setScene(Scenes.townSelect);
  };

  // ---------------- Story intro comic + dialogue player (doc PART 19) ----------------
  Scenes.intro = Scenes.make({
    draw(ctx) {
      A.drawFit(ctx, 'CUT_INTRO', 0, 0, E.W, E.H);
      if (Math.sin(this.t * 4) > 0) { ctx.strokeStyle = '#FFE14D'; ctx.lineWidth = 6; UI.roundRect(ctx, 1290, 815, 360, 100, 40); ctx.stroke(); }
      UI.area(R(1290, 810, 360, 110), () => { if (this.t > 0.4) Scenes.playStory(1, 'intro', () => E.setScene(Scenes.townSelect)); });
      UI.btn(ctx, { label: 'ข้าม', color: 'gray', forcePill: true, x: 20, y: 860, w: 220, h: 70, size: 28 }, () => E.setScene(Scenes.townSelect));
    }
  });
  Scenes.playStory = function (chapter, part, onDone) { RK.Save.data.seenStory['c' + chapter + (part === 'intro' ? 'i' : 'o')] = true; RK.Save.save('story'); E.setScene(Scenes.story, { chapter, part, onDone }); };
  Scenes.story = Scenes.make({
    init(a) { this.ch = D.story[a.chapter - 1]; this.lines = this.ch[a.part]; this.i = 0; this.chars = 0; this.auto = false; this.autoT = 0; },
    update(dt) { this.t += dt; this.chars += dt * 40; if (this.auto) { this.autoT += dt; if (this.autoT > 2.5 && this.chars >= this.cur()[1].length) { this.autoT = 0; this.next(); } } },
    cur() { return this.lines[Math.min(this.i, this.lines.length - 1)]; },
    next() { const l = this.cur()[1]; if (this.chars < l.length) { this.chars = l.length; return; } this.i++; this.chars = 0; if (this.i >= this.lines.length) this.finish(); },
    finish() { const f = this.args.onDone; if (f) f(); else E.setScene(Scenes.townSelect); },
    draw(ctx) {
      const bg = this.ch.bg; A.drawFit(ctx, D.maps[bg] ? D.maps[bg].asset : bg, 0, 0, E.W, E.H);
      ctx.fillStyle = 'rgba(30,15,10,0.35)'; ctx.fillRect(0, 0, E.W, E.H);
      UI.panel(ctx, 520, 40, 632, 90, {}); UI.text(ctx, this.ch.titleTH, 836, 85, { size: 34, color: '#FF7FB0', outlineColor: '#fff' });
      const [sp, text] = this.cur(), s = D.speakers[sp];
      const left = !['zombie', 'boss1', 'demon', 'sea', 'shroom', 'ice', 'pharaoh', 'inferno', 'king'].includes(sp);
      const img = A.get(s.asset); const bob = Math.sin(this.t * 3) * 6;
      if (img) { ctx.save(); const h = 420, w = img.width * h / img.height, x = left ? 160 : E.W - 160 - w; ctx.translate(x + w / 2, 640 + bob); if (!left) ctx.scale(1, 1); ctx.drawImage(img, -w / 2, -h, w, h); ctx.restore(); }
      UI.panel(ctx, 80, 640, 1512, 270, {});
      UI.box(ctx, left ? 120 : 1260, 610, 300, 60, left ? '#FF86B6' : '#8B5AA8', '#fff', 30); UI.text(ctx, s.name, left ? 270 : 1410, 640, { size: 28 });
      UI.para(ctx, text.slice(0, Math.floor(this.chars)), 140, 715, 1400, { size: 32, weight: 'bold' });
      UI.area(R(0, 140, E.W, 770), () => this.next());
      UI.btn(ctx, { x: 1300, y: 830, w: 130, h: 64, label: 'ถัดไป', color: 'green', forcePill: true, size: 22 }, () => this.next());
      UI.btn(ctx, { x: 1440, y: 830, w: 130, h: 64, label: this.auto ? 'Auto ✓' : 'Auto', color: this.auto ? 'pink' : 'blue', forcePill: true, size: 22 }, () => { this.auto = !this.auto; });
      UI.btn(ctx, { x: 1460, y: 40, w: 180, h: 70, label: 'ข้าม ▶▶', color: 'gray', forcePill: true, size: 24 }, () => this.finish());
    }
  });

  // ---------------- Select Town (doc 15.3) ----------------
  const TOWN_CARDS = [R(83, 157, 257, 303), R(353, 157, 254, 303), R(616, 157, 257, 303), R(884, 157, 256, 303), R(83, 487, 257, 286), R(353, 487, 254, 286), R(616, 487, 257, 286), R(884, 487, 256, 286)];
  const STAR_TXT = [[237, 437], [507, 437], [771, 437], [1037, 437], [237, 740], [507, 740], [771, 740], [1037, 740]];
  Scenes.townSelect = Scenes.make({
    init(a) { RK.Audio.play('bgmMenu'); this.sel = a.town || Math.max(...RK.Save.data.towns.unlocked); },
    tapTown(n) {
      const town = D.towns[n - 1], unlocked = RK.Save.data.towns.unlocked.includes(n);
      if (!unlocked) { UI.openModal({ title: `Town ${n} · ${town.nameTH}`, lines: [{ t: 'ยังไม่ปลดล็อก', size: 34, color: '#B05050' }, `เงื่อนไข: ผ่าน Town ${n - 1} Stage 15`, `บอสประจำเมือง: ${D.enemies[town.boss].nameTH}`], buttons: [{ label: 'ตกลง', color: 'green', forcePill: true }] }); return; }
      if (this.sel === n) return this.enterTown();
      this.sel = n;
    },
    enterTown() {
      const n = this.sel, sd = RK.Save.data;
      if (!sd.seenStory['c' + n + 'i'] && n > 1) return Scenes.playStory(n, 'intro', () => E.setScene(Scenes.stageSelect, { town: n }));
      E.setScene(Scenes.stageSelect, { town: n });
    },
    draw(ctx) {
      A.drawFit(ctx, 'BG_SELECT_TOWN', 0, 0, E.W, E.H);
      const sd = RK.Save.data;
      D.towns.forEach((t, i) => {
        const r = TOWN_CARDS[i], unlocked = sd.towns.unlocked.includes(t.id), [cx, cy] = STAR_TXT[i];
        ctx.fillStyle = 'rgba(70,40,60,0.96)'; UI.roundRect(ctx, cx - 44, cy - 19, 92, 38, 12); ctx.fill();
        UI.text(ctx, `${RK.Save.totalStars(t.id)}/45`, cx + 2, cy + 1, { size: 22, outlineColor: '#3a1a30' });
        if (!unlocked) { ctx.fillStyle = 'rgba(30,20,40,0.55)'; UI.roundRect(ctx, r.x + 6, r.y + 6, r.w - 12, r.h - 12, 26); ctx.fill(); A.drawFit(ctx, 'UI_ICON_LOCK', r.x + r.w / 2 - 50, r.y + r.h / 2 - 80, 100, 100); }
        if (this.sel === t.id) { ctx.strokeStyle = '#FFE14D'; ctx.lineWidth = 8; UI.roundRect(ctx, r.x, r.y, r.w, r.h, 30); ctx.stroke(); }
        UI.area(r, () => { RK.Audio.play('buttonClick'); this.tapTown(t.id); });
      });
      // live town info panel (covers the painted Town 1 example)
      const T = D.towns[this.sel - 1], px = 1158, py = 18, pw = 500, ph = 715;
      UI.panel(ctx, px, py, pw, ph, { r: 30 });
      UI.text(ctx, `TOWN ${T.id}`, px + pw / 2, py + 40, { size: 24, color: '#9A6A3A', outline: false });
      UI.text(ctx, T.nameTH, px + pw / 2, py + 80, { size: 36, color: '#FF7FB0', outlineColor: '#6B3F1C' });
      A.drawFit(ctx, D.maps[T.map].asset, px + 30, py + 110, pw - 60, 230);
      UI.text(ctx, `ผ่าน ${RK.Save.clearedCount(T.id)}/15 ด่าน · ดาว ${RK.Save.totalStars(T.id)}/45`, px + pw / 2, py + 365, { size: 24, color: '#6B3F1C', outline: false });
      UI.text(ctx, 'ศัตรูหลักในเมืองนี้', px + pw / 2, py + 405, { size: 22, color: '#9A6A3A', outline: false });
      T.basic.concat(T.special).slice(0, 5).forEach((id, i) => A.fitImg(ctx, A.get(D.enemies[id].asset), px + 30 + i * 90, py + 425, 84, 92, true));
      UI.text(ctx, 'บอสประจำเมือง', px + pw / 2, py + 545, { size: 22, color: '#9A6A3A', outline: false });
      A.fitImg(ctx, A.get(D.enemies[T.boss].asset), px + 40, py + 560, 130, 140, true);
      UI.text(ctx, D.enemies[T.boss].nameTH, px + 320, py + 610, { size: 26, color: '#B05050', outline: false, maxW: 300 });
      UI.text(ctx, 'แตะเมืองซ้ำหรือกดเริ่มเล่น', px + 320, py + 650, { size: 18, color: '#9A6A3A', outline: false });
      UI.area(R(1213, 751, 400, 109), () => { RK.Audio.play('buttonClick'); this.enterTown(); });
      UI.btn(ctx, { label: 'กลับ', icon: 'UI_ICON_ARROW_LEFT', color: 'gray', forcePill: true, x: 10, y: 868, w: 200, h: 66, size: 26 }, () => E.setScene(Scenes.lobby));
      UI.btn(ctx, { label: 'เนื้อเรื่อง', color: 'pink', forcePill: true, x: 230, y: 868, w: 200, h: 66, size: 24 }, () => Scenes.playStory(this.sel, 'intro', () => E.setScene(Scenes.townSelect, { town: this.sel })));
    }
  });

  // ---------------- Team & booster strip (shared by stage select and pre-battle) ----------------
  Scenes.teamStrip = function (ctx, x, y, w, scene) {
    const sd = RK.Save.data, t = sd.teams;
    UI.tabs(ctx, t.presets.map((p, i) => `ทีม ${i + 1}`), t.active, x, y, w, 52, i => { t.active = i; RK.Save.save('team'); });
    const deck = RK.Save.deck;
    UI.text(ctx, `${t.presets[t.active].name} · พลังทีม ${RK.Prog.teamPower(deck)}`, x + 10, y + 78, { size: 20, align: 'left', color: '#6B3F1C', outline: false });
    for (let i = 0; i < 8; i++) {
      const id = deck[i], cx = x + i * (w / 8), s = w / 8 - 8;
      UI.box(ctx, cx, y + 96, s, s * 1.1, '#FFF9EE', '#D9B98C', 12);
      if (id) { const st = RK.Prog.stats(id); A.fitImg(ctx, A.skin(D.characters[id].asset, st.costume), cx + 4, y + 100, s - 8, s * 1.1 - 22, true); UI.text(ctx, D.characters[id].cost, cx + s / 2, y + 96 + s * 1.1 - 12, { size: 15, color: '#FFE14D' }); }
    }
    UI.btn(ctx, { x: x + w - 200, y: y + 64, w: 200, h: 30, label: 'แก้ทีม ✎', color: 'blue', forcePill: true, size: 18 }, () => E.setScene(Scenes.team, { back: scene, backArgs: scene.args }));
  };
  Scenes.boosterStrip = function (ctx, x, y, sel) {
    const sd = RK.Save.data; let i = 0;
    for (const k in D.boosters) {
      const b = D.boosters[k], n = sd.boosters[k] || 0, on = sel.includes(k), r = R(x + i * 112, y, 104, 104);
      UI.box(ctx, r.x, r.y, r.w, r.h, on ? '#FFE9F3' : '#FFF9EE', on ? '#FF7FB0' : '#D9B98C', 14);
      A.drawFit(ctx, b.icon, r.x + 20, r.y + 8, 64, 56); UI.text(ctx, '×' + n, r.x + r.w - 18, r.y + 16, { size: 16 });
      UI.text(ctx, b.name, r.x + r.w / 2, r.y + 84, { size: 13, color: '#6B3F1C', outline: false, maxW: 98 });
      if (on) A.drawFit(ctx, 'UI_ICON_CHECK', r.x + r.w - 34, r.y + r.h - 34, 32, 32);
      UI.area(r, () => { if (on) sel.splice(sel.indexOf(k), 1); else if (n > 0) sel.push(k); else UI.toast('ไม่มีบูสเตอร์นี้ — ซื้อได้ที่ร้านโดนัท'); });
      i++;
    }
  };

  // ---------------- Select Stage (doc 15.4) ----------------
  Scenes.stageSelect = Scenes.make({
    init(a) { RK.Audio.play('bgmMenu'); this.town = a.town || 1; this.sel = a.select || this.firstOpen(); this.boost = []; },
    firstOpen() { const sd = RK.Save.data; let last = 'T' + this.town + '-S1'; for (let n = 1; n <= 15; n++) { const id = `T${this.town}-S${n}`; if (sd.unlockedStages.includes(id)) last = id; } return last; },
    nodeRect(n) { const i = n - 1, col = i % 5, row = Math.floor(i / 5); return R(64 + col * 182, 150 + row * 200, 152, 168); },
    start() {
      const deck = RK.Save.deck;
      if (!deck.some(id => D.characters[id].atk > 0)) return UI.toast('ทีมต้องมีตัวโจมตีอย่างน้อย 1 ตัว');
      E.setScene(RK.Battle, { stageId: this.sel, deck: deck.slice(), boosters: this.boost.slice() });
    },
    draw(ctx) {
      const sd = RK.Save.data, town = D.towns[this.town - 1], st = D.stages[this.sel];
      Scenes.frame(ctx, { title: `Town ${town.id} · ${town.nameTH}`, bg: D.maps[town.map].asset, back: () => E.setScene(Scenes.townSelect, { town: this.town }) });
      UI.panel(ctx, 30, 120, 950, 650, {});
      for (let n = 1; n <= 15; n++) {
        const id = `T${this.town}-S${n}`, r = this.nodeRect(n), open = sd.unlockedStages.includes(id), rec = sd.stages[id];
        const isBoss = n === 15, isMini = n === 10;
        A.drawFit(ctx, 'UI_CARD_FRAME_EMPTY', r.x, r.y, r.w, r.h);
        if (this.sel === id) { ctx.strokeStyle = '#FF7FB0'; ctx.lineWidth = 7; UI.roundRect(ctx, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 26); ctx.stroke(); }
        if (isBoss || isMini) A.fitImg(ctx, A.get(D.enemies[isBoss ? town.boss : town.mini].asset), r.x + 30, r.y + 22, r.w - 60, 70);
        UI.text(ctx, String(n), r.x + r.w / 2, r.y + (isBoss || isMini ? 104 : 66), { size: isBoss || isMini ? 34 : 54, color: open ? (isBoss ? '#FF6B6B' : isMini ? '#FFB13B' : '#FFE14D') : '#C8B8A8' });
        if (isBoss || isMini) UI.text(ctx, isBoss ? 'BOSS' : 'MINI BOSS', r.x + r.w / 2, r.y + 18, { size: 16, color: '#FF6B6B' });
        for (let s = 0; s < 3; s++) A.drawFit(ctx, rec && rec.stars[s] ? 'UI_ICON_STAR' : 'UI_ICON_STAR_BRONZE', r.x + 16 + s * 40, r.y + 118, 38, 38);
        if (!open) { ctx.fillStyle = 'rgba(60,40,30,0.45)'; UI.roundRect(ctx, r.x + 8, r.y + 8, r.w - 16, r.h - 16, 22); ctx.fill(); A.drawFit(ctx, 'UI_ICON_LOCK', r.x + r.w / 2 - 30, r.y + 40, 60, 60); }
        UI.area(r, () => { if (!open) return UI.toast(`ผ่านด่าน ${n - 1} ก่อนเพื่อปลดล็อก`); RK.Audio.play('buttonClick'); this.sel = id; });
      }
      Scenes.stageInfo(ctx, st, 1000, 110, 650, 360);
      UI.panel(ctx, 1000, 486, 650, 290, {});
      Scenes.teamStrip(ctx, 1020, 500, 610, Scenes.stageSelect);
      UI.text(ctx, 'บูสเตอร์ (แตะเพื่อใช้)', 60, 800, { size: 20, align: 'left', color: '#fff' });
      Scenes.boosterStrip(ctx, 260, 790, this.boost);
      UI.btn(ctx, { label: 'เริ่มเกม', x: 1290, y: 800, w: 340, h: 110 }, () => this.start());
    }
  });
  // stage info panel (doc 15.4: wave count, recommended power, enemy & boss preview, rewards)
  Scenes.stageInfo = function (ctx, st, x, y, w, h) {
    UI.panel(ctx, x, y, w, h, {});
    if (!st) return;
    const sd = RK.Save.data;
    UI.text(ctx, st.name, x + w / 2, y + 42, { size: 30, color: '#6B3F1C', outline: false, maxW: w - 40 });
    const pw = RK.Prog.teamPower(RK.Save.deck);
    UI.text(ctx, `Wave ${st.mode === 'endless' ? '∞' : st.waves.length} · โดนัทเริ่ม ${st.startingDonut} · พลังแนะนำ ${st.recommendedPower || '-'}`, x + w / 2, y + 80, { size: 20, color: '#9A6A3A', outline: false });
    UI.text(ctx, `พลังทีมของคุณ ${pw}`, x + w / 2, y + 106, { size: 20, color: pw >= (st.recommendedPower || 0) ? '#3E9A2B' : '#D33', outline: false });
    const ens = []; (st.waves || []).forEach(wv => wv.spawns.forEach(g => { if (!ens.includes(g.enemy)) ens.push(g.enemy); }));
    ens.slice(0, 7).forEach((id, i) => { const e = D.enemies[id]; A.fitImg(ctx, A.get(e.asset), x + 24 + i * 86, y + 122, 80, 88, true); if (e.isBoss || e.miniBoss) UI.text(ctx, 'BOSS', x + 64 + i * 86, y + 130, { size: 14, color: '#FF6B6B' }); });
    const rw = st.reward || {}, keys = Object.keys(rw).filter(k => typeof rw[k] === 'number' && rw[k] > 0 && k !== 'exp').slice(0, 5);
    UI.text(ctx, 'รางวัล', x + 30, y + 240, { size: 18, align: 'left', color: '#9A6A3A', outline: false });
    keys.forEach((k, i) => UI.item(ctx, k === 'fragments' ? 'fragments' : k, rw[k], x + 90 + i * 82, y + 220, 74));
    (rw.unlock || []).filter(id => !RK.Save.isOwned(id)).slice(0, 2).forEach((id, i) => { UI.box(ctx, x + 520 + i * 60, y + 220, 56, 74, '#FFE9F3', '#FF7FB0', 12); A.fitImg(ctx, A.get(D.characters[id].asset), x + 524 + i * 60, y + 224, 48, 66, true); });
    (st.stars || []).forEach((s, i) => UI.text(ctx, `★ ${s.text}`, x + 30 + i * 205, y + h - 34, { size: 16, align: 'left', color: ((sd.stages[st.id] || { stars: [] }).stars[i]) ? '#3E9A2B' : '#9A6A3A', outline: false, maxW: 200 }));
  };
  // Pre-battle for non-story modes
  Scenes.prebattle = function (stageId, opts) { E.setScene(Scenes.pre, Object.assign({ stageId }, opts || {})); };
  Scenes.pre = Scenes.make({
    init(a) { this.boost = []; },
    draw(ctx) {
      const st = D.stages[this.args.stageId];
      Scenes.frame(ctx, { title: st.mode === 'endless' ? 'โหมดไม่รู้จบ' : st.name, bg: D.maps[st.map].asset, back: this.args.back || (() => E.setScene(st.mode === 'event' ? Scenes.event : st.mode === 'endless' ? Scenes.lobby : Scenes.modes, { id: st.event })) });
      Scenes.stageInfo(ctx, st, 40, 120, 800, 380);
      if (st.desc) UI.text(ctx, st.desc, 440, 470, { size: 22, color: '#B05050', outline: false, maxW: 760 });
      if (st.mode === 'endless') { UI.text(ctx, `สถิติสูงสุด: WAVE ${RK.Save.data.endless.best}`, 440, 470, { size: 26, color: '#6B3F1C', outline: false }); }
      if (this.args.practice) UI.text(ctx, 'โหมดฝึก: กิจกรรมนี้ยังไม่เปิด — เล่นได้แต่ไม่ได้รางวัลกิจกรรม', 440, 440, { size: 20, color: '#D33', outline: false });
      UI.panel(ctx, 870, 120, 780, 380, {});
      Scenes.teamStrip(ctx, 890, 136, 740, Scenes.pre);
      UI.text(ctx, 'บูสเตอร์', 60, 560, { size: 22, align: 'left', color: '#fff' });
      Scenes.boosterStrip(ctx, 60, 590, this.boost);
      if (st.rules && st.rules.roles) UI.text(ctx, 'ใช้ได้เฉพาะ: ' + st.rules.roles.join(', '), 836, 740, { size: 22, color: '#fff' });
      UI.btn(ctx, { label: 'เริ่มเกม', x: 1290, y: 780, w: 340, h: 110 }, () => {
        const deck = RK.Save.deck;
        E.setScene(RK.Battle, { stageId: st.id, deck: deck.slice(), deck2: (RK.Save.data.teams.presets[(RK.Save.data.teams.active + 1) % 5].members.length ? RK.Save.data.teams.presets[(RK.Save.data.teams.active + 1) % 5].members : deck).slice(), boosters: this.boost.slice(), practice: this.args.practice });
      });
    }
  });

  // ---------------- Settings (doc 15.16) ----------------
  Scenes.openSettings = function (onClose) {
    const s = RK.Save.data.settings;
    const toggles = [['เพลงประกอบ (แต่งใหม่อัตโนมัติ)', 'musicOn'], ['แสดง HP Bar ตลอดเวลา', 'hpBarAlways'], ['แสดงตัวเลขดาเมจ', 'damageNumbers'], ['หยุดเกมอัตโนมัติเมื่อสลับแอป', 'autoPause'], ['สั่น (อุปกรณ์ที่รองรับ)', 'vibration']];
    UI.openModal({ title: 'ตั้งค่า', w: 1300, h: 760, customButtons: true,
      draw(ctx, b) {
        toggles.forEach((r, i) => { const y = b.y + 80 + i * 68; UI.text(ctx, r[0], b.x + 60, y + 28, { size: 24, align: 'left', color: '#6B3F1C', outline: false }); const tr = R(b.x + 470, y, 130, 52); A.drawFit(ctx, s[r[1]] ? 'UI_TOGGLE_ON' : 'UI_TOGGLE_OFF', tr.x, tr.y, tr.w, tr.h); UI.area(tr, () => { s[r[1]] = !s[r[1]]; RK.Save.save('settings'); RK.Music.applyVolume(); }); });
        const vol = (label, key, y) => { UI.text(ctx, label, b.x + 60, y + 26, { size: 24, align: 'left', color: '#6B3F1C', outline: false }); for (let k = 0; k < 5; k++) { const r = R(b.x + 400 + k * 46, y + 30 - k * 6, 38, 20 + k * 6); ctx.fillStyle = s[key] >= (k + 1) * 0.2 - 0.01 ? '#FF7FB0' : '#E8D7BE'; UI.roundRect(ctx, r.x, r.y, r.w, r.h, 8); ctx.fill(); UI.area(R(r.x - 4, y, 46, 60), () => { s[key] = (k + 1) * 0.2; RK.Save.save('settings'); RK.Music.applyVolume(); }); } };
        vol('ความดังเพลง', 'music', b.y + 420); vol('ความดังเสียงเอฟเฟกต์', 'sfx', b.y + 490);
        UI.text(ctx, RK.Audio.hasFiles() ? '' : '(ยังไม่มีไฟล์เสียงเอฟเฟกต์ใน Asset)', b.x + 60, b.y + 570, { size: 18, align: 'left', color: '#9A6A3A', outline: false });
        // right column
        const cx = b.x + 680, row = (label, y) => UI.text(ctx, label, cx, y, { size: 24, align: 'left', color: '#6B3F1C', outline: false });
        row('คุณภาพกราฟิก / ความละเอียด', b.y + 100);
        ['low', 'medium', 'high'].forEach((q, i) => UI.btn(ctx, { x: cx + i * 180, y: b.y + 120, w: 170, h: 56, label: { low: 'ประหยัด', medium: 'กลาง', high: 'สูง' }[q], color: s.graphics === q ? 'pink' : 'gray', forcePill: true, size: 22 }, () => { s.graphics = q; RK.Save.save('settings'); E.resize(); }));
        row('ความเร็วเกมเริ่มต้น', b.y + 210);
        [1, 2].forEach((v, i) => UI.btn(ctx, { x: cx + i * 180, y: b.y + 230, w: 170, h: 56, label: '×' + v, color: s.battleSpeed === v ? 'pink' : 'gray', forcePill: true, size: 22 }, () => { s.battleSpeed = v; RK.Save.save('settings'); }));
        row('ภาษา: ไทย (เมนูทั้งหมดเป็นภาษาไทย)', b.y + 320);
        row('การแจ้งเตือน: เว็บแอปบน iPad ยังไม่รองรับ', b.y + 360);
        row(`บัญชี: ${RK.Save.data.profile.playerId} (เก็บในเครื่องนี้)`, b.y + 400);
        UI.btn(ctx, { x: cx, y: b.y + 430, w: 180, h: 60, label: 'บันทึกเลย', color: 'green', forcePill: true, size: 22 }, () => { if (RK.Save.save('manual')) UI.toast('บันทึกแล้ว'); });
        UI.btn(ctx, { x: cx + 190, y: b.y + 430, w: 200, h: 60, label: 'ส่งออกเซฟ', color: 'blue', forcePill: true, size: 22 }, () => Scenes.exportSave());
        UI.btn(ctx, { x: cx + 400, y: b.y + 430, w: 200, h: 60, label: 'นำเข้าเซฟ', color: 'blue', forcePill: true, size: 22 }, () => Scenes.importSave());
        UI.btn(ctx, { x: cx, y: b.y + 510, w: 280, h: 60, label: 'กลับหน้าแรก', color: 'brown', forcePill: true, size: 22 }, () => { UI.closeModal(); E.setScene(Scenes.title); });
        UI.modal._btns = [
          { label: 'รีเซ็ตข้อมูล', color: 'red', forcePill: true, x: b.x + 60, y: b.y + b.h - 110, w: 300, h: 80, size: 28, action: () => Scenes.resetData(onClose) },
          { label: 'ปิด', color: 'green', forcePill: true, x: b.x + b.w - 330, y: b.y + b.h - 110, w: 260, h: 80, size: 30, action: () => onClose && onClose() }];
      } });
  };
  Scenes.exportSave = function () {
    const code = RK.Save.exportCode();
    let copied = false;
    try { navigator.clipboard.writeText(code).then(() => UI.toast('คัดลอกรหัสเซฟแล้ว'), () => { }); copied = true; } catch (e) { }
    UI.textInput({ title: 'รหัสเซฟของคุณ', value: code, mono: true, max: 999999, lines: ['คัดลอกรหัสนี้ไปวางในอุปกรณ์อื่น (นำเข้าเซฟ)'] }, () => { });
  };
  Scenes.importSave = function () {
    UI.textInput({ title: 'นำเข้าเซฟ', placeholder: 'วางรหัสเซฟที่นี่', mono: true, max: 999999, lines: ['ข้อมูลปัจจุบันจะถูกแทนที่'] }, v => {
      if (!v) return; if (RK.Save.importCode(v)) { UI.toast('นำเข้าเซฟสำเร็จ'); E.setScene(Scenes.lobby); } else UI.toast('รหัสเซฟไม่ถูกต้อง');
    });
  };
  // Reset needs two confirmations (doc 15.16)
  Scenes.resetData = function (onClose) {
    UI.confirm('รีเซ็ตข้อมูล?', ['ความคืบหน้าทั้งหมดจะถูกลบ', 'แน่ใจหรือไม่?'], () => {
      UI.confirm('ยืนยันครั้งที่ 2', [{ t: 'ลบข้อมูลทั้งหมดจริง ๆ ?', color: '#B05050' }, 'ย้อนกลับไม่ได้'], () => { RK.Save.reset(); UI.toast('รีเซ็ตข้อมูลแล้ว'); E.setScene(Scenes.title); }, 'ลบข้อมูล');
    }, 'ดำเนินการต่อ');
  };
  // ---------------- Profile (doc 15.15) ----------------
  Scenes.openProfile = function () { E.setScene(Scenes.profile); };
  Scenes.profile = Scenes.make({
    draw(ctx) {
      Scenes.frame(ctx, { title: 'โปรไฟล์' });
      const d = RK.Save.data, p = d.profile, s = d.stats;
      UI.panel(ctx, 40, 120, 560, 780, {});
      A.fitImg(ctx, A.get(p.avatar), 170, 150, 300, 300, true);
      UI.text(ctx, p.name, 320, 490, { size: 40, color: '#FF7FB0', outlineColor: '#6B3F1C', maxW: 500 });
      UI.text(ctx, `Player ID: ${p.playerId}`, 320, 540, { size: 22, color: '#9A6A3A', outline: false });
      UI.text(ctx, `Lv.${p.level}`, 320, 590, { size: 32, color: '#6B3F1C', outline: false });
      Scenes.progressBar(ctx, 120, 620, 400, 28, p.exp / (p.level * 100), '#FFD93B');
      UI.text(ctx, `EXP ${p.exp} / ${p.level * 100}`, 320, 670, { size: 20, color: '#9A6A3A', outline: false });
      UI.btn(ctx, { x: 80, y: 720, w: 230, h: 74, label: 'เปลี่ยนชื่อ', color: 'blue', forcePill: true, size: 24 }, () => UI.textInput({ title: 'ชื่อผู้เล่น', value: p.name, max: 14 }, v => { if (v && v.trim()) { p.name = v.trim().slice(0, 14); RK.Save.save('rename'); } }));
      UI.btn(ctx, { x: 330, y: 720, w: 230, h: 74, label: 'เปลี่ยนอวาตาร์', color: 'pink', forcePill: true, size: 24 }, () => {
        const owned = Object.keys(d.characters.owned).map(id => D.characters[id].isFactory ? 'FACTORY_LV1' : D.characters[id].asset);
        UI.openModal({ title: 'เลือกอวาตาร์', w: 1200, h: 620, draw(c, b) { owned.slice(0, 24).forEach((a, i) => { const r = R(b.x + 40 + (i % 8) * 140, b.y + 70 + Math.floor(i / 8) * 150, 128, 140); UI.box(c, r.x, r.y, r.w, r.h, a === p.avatar ? '#FFE9F3' : '#FFF9EE', '#D9B98C'); A.fitImg(c, A.get(a), r.x + 8, r.y + 8, r.w - 16, r.h - 16, true); UI.area(r, () => { p.avatar = a; RK.Save.save('avatar'); UI.closeModal(); }); }); }, buttons: [{ label: 'ปิด', color: 'gray', forcePill: true }] });
      });
      UI.panel(ctx, 640, 120, 1000, 780, {});
      const rows = [['ชนะ', s.wins], ['แพ้', s.losses], ['ด่านที่ผ่าน', `${s.stagesCompleted} / 120`], ['ตัวละครที่มี', `${Object.keys(d.characters.owned).length} / ${Object.keys(D.characters).length}`],
        ['กำจัดซอมบี้ทั้งหมด', s.zombiesKilled.toLocaleString()], ['เก็บโดนัททั้งหมด', s.donutsCollected.toLocaleString()], ['เวลาเล่น', `${Math.floor(s.playTime / 3600)} ชม. ${Math.floor(s.playTime % 3600 / 60)} นาที`],
        ['ดาวทั้งหมด', RK.Save.totalStars()], ['บอสที่ชนะ', d.counters.killBoss || 0], ['สถิติโหมดไม่รู้จบ', `WAVE ${d.endless.best}`], ['ชนะ VS', d.counters.vsWin || 0], ['ซอมบี้ที่สะสม (VS)', Object.keys(d.zombies.owned).length]];
      rows.forEach((r, i) => { const x = 690 + (i % 2) * 480, y = 170 + Math.floor(i / 2) * 110; UI.box(ctx, x, y, 450, 92, '#FFF9EE', '#D9B98C'); UI.text(ctx, r[0], x + 24, y + 28, { size: 20, align: 'left', color: '#9A6A3A', outline: false }); UI.text(ctx, String(r[1]), x + 24, y + 64, { size: 30, align: 'left', color: '#6B3F1C', outline: false }); });
    }
  });
  Scenes.openHelp = function () {
    UI.openModal({ title: 'วิธีเล่น', w: 1100, h: 700, lines: ['วางเครื่องผลิตโดนัท แล้ว "แตะ" โดนัทที่เด้งออกมาเพื่อเก็บ', 'ใช้โดนัทวางตัวละคร: ตัวโจมตียิงซอมบี้ในแถวเดียวกัน', 'แตะตัวละครบนสนาม → หมุนซ้าย/ขวา (ยิงซอมบี้ที่บินผ่าน) หรือขายคืนโดนัท',
      'แท็บ "กับดัก" ใต้สนาม: วางกับดักที่ซื้อจากร้านกับดัก', 'เกจสกิลทีมเต็ม → กดการ์ด "สกิล" ใช้ คุมะถล่ม / หยุดเวลา / ปิกนิกฟื้นพลัง', 'แตะเครื่องผลิตเพื่ออัปเกรด Lv1–5 · ปกป้องร้านโดนัทด้านซ้ายให้ได้!'], buttons: [{ label: 'เข้าใจแล้ว', color: 'green', forcePill: true }] });
  };

  // ---------------- News ----------------
  Scenes.news = Scenes.make({
    draw(ctx) {
      Scenes.frame(ctx, { title: 'ข่าวสาร' });
      RK.Save.data.newsRead = D.news.length;
      D.news.forEach((n, i) => {
        const y = 130 + i * 255; UI.panel(ctx, 80, y, 1510, 235, {});
        UI.text(ctx, n.title, 120, y + 44, { size: 32, align: 'left', color: '#FF7FB0', outlineColor: '#6B3F1C' }); UI.text(ctx, n.date, 1550, y + 44, { size: 20, align: 'right', color: '#9A6A3A', outline: false });
        n.body.forEach((l, k) => UI.text(ctx, '• ' + l, 130, y + 92 + k * 34, { size: 22, align: 'left', color: '#6B3F1C', outline: false }));
      });
    }
  });
  // ---------------- Gift box / Mailbox / Redeem code ----------------
  Scenes.gift = Scenes.make({
    init(a) { this.tab = a.tab || 0; },
    draw(ctx) {
      Scenes.frame(ctx, { title: 'กล่องของขวัญ' });
      const sd = RK.Save.data, today = RK.Time.dayKey();
      UI.tabs(ctx, ['ของขวัญรายวัน', 'ใส่โค้ด', 'จดหมาย'], this.tab, 300, 120, 1070, 64, i => this.tab = i, [sd.freeGiftDay !== today ? 1 : 0, 0, sd.mail.filter(m => !m.claimed).length]);
      UI.panel(ctx, 80, 210, 1510, 690, {});
      if (this.tab === 0) {
        A.drawFit(ctx, 'UI_ICON_GIFT2', 690, 260, 300, 300);
        UI.text(ctx, 'ของขวัญฟรีวันละ 1 ครั้ง: ทอง 500 + คุกกี้ 5 + เพชร 10', 836, 610, { size: 28, color: '#6B3F1C', outline: false });
        const ok = sd.freeGiftDay !== today;
        UI.btn(ctx, { x: 686, y: 680, w: 300, h: 100, label: ok ? 'รับ' : 'รับแล้ววันนี้', color: 'gray', forcePill: !ok, disabled: !ok }, () => { sd.freeGiftDay = today; RK.Save.save('gift'); UI.showRewards('ของขวัญรายวัน', RK.Eco.grant({ gold: 500, cookie: 5, gems: 10 })); });
      } else if (this.tab === 1) {
        UI.text(ctx, 'ใส่โค้ดของขวัญเพื่อรับไอเท็ม', 836, 330, { size: 32, color: '#6B3F1C', outline: false });
        UI.btn(ctx, { x: 636, y: 400, w: 400, h: 100, label: 'ใส่โค้ด', color: 'pink', forcePill: true }, () => UI.textInput({ title: 'ใส่โค้ด', placeholder: 'เช่น KUMA2026', max: 20 }, v => {
          const c = (v || '').trim().toUpperCase(), r = D.redeemCodes[c];
          if (!r) return UI.toast('โค้ดไม่ถูกต้อง'); if (sd.redeemed[c]) return UI.toast('ใช้โค้ดนี้ไปแล้ว');
          sd.redeemed[c] = true; RK.Save.save('redeem'); UI.showRewards('ใช้โค้ดสำเร็จ!', RK.Eco.grant(r));
        }));
        UI.text(ctx, 'ดูโค้ดได้ที่หน้า ข่าวสาร', 836, 560, { size: 22, color: '#9A6A3A', outline: false });
      } else {
        const list = sd.mail.slice().reverse();
        if (!list.length) UI.text(ctx, 'ไม่มีจดหมาย', 836, 500, { size: 30, color: '#9A6A3A', outline: false });
        list.slice(this.page * 5, this.page * 5 + 5).forEach((m, i) => {
          const y = 240 + i * 120; UI.box(ctx, 120, y, 1430, 105, '#FFF9EE', '#D9B98C');
          A.drawFit(ctx, 'UI_ICON_MAIL', 140, y + 12, 80, 80);
          UI.text(ctx, m.title, 250, y + 34, { size: 26, align: 'left', color: '#6B3F1C', outline: false }); UI.text(ctx, m.body, 250, y + 72, { size: 20, align: 'left', color: '#9A6A3A', outline: false });
          Object.keys(m.reward).slice(0, 4).forEach((k, j) => UI.item(ctx, k, m.reward[k], 900 + j * 90, y + 12, 80));
          UI.btn(ctx, { x: 1300, y: y + 18, w: 220, h: 70, label: m.claimed ? 'รับแล้ว' : 'รับ', disabled: m.claimed, color: 'gray', forcePill: m.claimed }, () => { m.claimed = true; RK.Save.save('mail'); UI.showRewards(m.title, RK.Eco.grant(m.reward)); });
        });
        UI.pager(ctx, this.page, Math.ceil(list.length / 5), 836, 830, p => this.page = p);
      }
    }
  });
  // ---------------- Friends (needs online backend) ----------------
  Scenes.friends = Scenes.make({
    draw(ctx) {
      Scenes.frame(ctx, { title: 'เพื่อน' });
      UI.panel(ctx, 230, 150, 1210, 720, {});
      A.drawFit(ctx, 'UI_ICON_FRIENDS', 700, 190, 270, 220);
      UI.text(ctx, 'ระบบเพื่อนออนไลน์ต้องมีเซิร์ฟเวอร์ (Backend) — ยังไม่เปิดใช้งาน', 836, 460, { size: 28, color: '#B05050', outline: false });
      UI.text(ctx, `Player ID ของคุณ: ${RK.Save.data.profile.playerId}`, 836, 510, { size: 26, color: '#6B3F1C', outline: false });
      UI.text(ctx, 'เล่นกับเพื่อนบน iPad เครื่องเดียวกันได้ตอนนี้: VS Mode 2 คน และ CO-OP 2 คน', 836, 570, { size: 24, color: '#6B3F1C', outline: false });
      UI.btn(ctx, { x: 586, y: 640, w: 500, h: 100, label: 'ไปเล่นกับเพื่อน (เครื่องเดียว)', color: 'pink', forcePill: true, size: 28 }, () => E.setScene(Scenes.modes));
    }
  });
  // ---------------- Ranking (local records) ----------------
  Scenes.ranking = Scenes.make({
    draw(ctx) {
      Scenes.frame(ctx, { title: 'อันดับ' });
      const sd = RK.Save.data;
      UI.panel(ctx, 80, 130, 900, 770, { title: 'โหมดไม่รู้จบ (ในเครื่องนี้)' });
      if (!sd.endless.scores.length) UI.text(ctx, 'ยังไม่มีสถิติ — ลองเล่นโหมดไม่รู้จบ!', 530, 400, { size: 26, color: '#9A6A3A', outline: false });
      sd.endless.scores.forEach((s, i) => { const y = 200 + i * 66; UI.box(ctx, 120, y, 820, 58, i < 3 ? '#FFF2C2' : '#FFF9EE', '#D9B98C'); UI.text(ctx, `#${i + 1}`, 160, y + 29, { size: 26, color: i < 3 ? '#E0A000' : '#6B3F1C', outline: false }); UI.text(ctx, s.name, 230, y + 29, { size: 24, align: 'left', color: '#6B3F1C', outline: false }); UI.text(ctx, `WAVE ${s.wave} · ${s.kills} kills · ${s.date}`, 920, y + 29, { size: 22, align: 'right', color: '#9A6A3A', outline: false }); });
      UI.panel(ctx, 1020, 130, 580, 770, { title: 'สถิติส่วนตัว' });
      const rows = [['ดาวทั้งหมด', RK.Save.totalStars()], ['ด่านที่ผ่าน', sd.stats.stagesCompleted], ['บอสที่ชนะ', sd.counters.killBoss || 0], ['ชนะ VS', sd.counters.vsWin || 0], ['ชนะ CO-OP', sd.counters.coopWin || 0]];
      rows.forEach((r, i) => { UI.text(ctx, r[0], 1060, 220 + i * 90, { size: 24, align: 'left', color: '#9A6A3A', outline: false }); UI.text(ctx, String(r[1]), 1560, 220 + i * 90, { size: 34, align: 'right', color: '#6B3F1C', outline: false }); });
      UI.text(ctx, 'อันดับออนไลน์ต้องมีเซิร์ฟเวอร์ (ยังไม่เปิด)', 1310, 820, { size: 20, color: '#B05050', outline: false });
    }
  });
})();
