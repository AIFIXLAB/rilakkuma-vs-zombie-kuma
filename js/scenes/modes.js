// ===== Battle modes hub (lobby "โหมดท้าทาย"): VS (17), CO-OP (18), Endless, Challenges, Online (placeholder) + Events (15.14) =====
(function () {
  const UI = RK.UI, A = RK.Assets, E = RK.Engine, D = RK.Data;
  const Scenes = RK.Scenes, R = Scenes.R;

  Scenes.modes = Scenes.make({
    init(a) { this.tab = a.tab || 0; },
    draw(ctx) {
      Scenes.frame(ctx, { title: 'โหมดการเล่น' });
      UI.tabs(ctx, ['VS Mode', 'CO-OP', 'ด่านท้าทาย', 'โหมดไม่รู้จบ', 'ออนไลน์'], this.tab, 220, 112, 1300, 62, i => { this.tab = i; this.page = 0; });
      const sd = RK.Save.data;
      if (this.tab === 0) {
        UI.panel(ctx, 40, 200, 1600, 700, {});
        A.drawFit(ctx, 'BG_VS', 70, 230, 760, 430);
        UI.para(ctx, 'ผู้เล่น 1 คุมกองทัพหมี (ฝั่งขวา) ผู้เล่น 2 คุมกองทัพซอมบี้ (ฝั่งซ้าย) เดินสวนทางกัน · Brain Energy เพิ่มตามเวลาและเมื่อกำจัดตัวละครฝั่งหมี · เวลา 4 นาที ฐานใครเหลือ % มากกว่าชนะ · เรียกบอสได้ครั้งเดียวหลัง 1:30', 80, 690, 740, { size: 20 });
        const btn = (y, label, col, vs) => UI.btn(ctx, { x: 900, y, w: 680, h: 110, label, color: col, forcePill: true, size: 32 }, () => E.setScene(Scenes.vsSetup, { vs }));
        btn(240, '2 ผู้เล่น (เครื่องเดียว)', 'pink', { bear: 'human', zombie: 'human' });
        btn(380, 'ฉันเล่นฝั่งหมี vs CPU', 'blue', { bear: 'human', zombie: 'cpu' });
        btn(520, 'ฉันเล่นฝั่งซอมบี้ vs CPU', 'purple', { bear: 'cpu', zombie: 'human' });
        UI.text(ctx, `ชนะ VS ${sd.counters.vsWin || 0} ครั้ง · การ์ดซอมบี้ ${Object.keys(sd.zombies.owned).length} ใบ`, 1240, 700, { size: 24, color: '#6B3F1C', outline: false });
        UI.btn(ctx, { x: 1000, y: 750, w: 480, h: 90, label: 'ตู้ซอมบี้ (การ์ด VS)', color: 'yellow', forcePill: true, size: 26 }, () => E.setScene(Scenes.gacha, { tab: 2 }));
      } else if (this.tab === 1) {
        UI.text(ctx, 'สองคนช่วยกันป้องกันฐานเดียว · สนาม 10 แถว · โดนัทใช้ร่วมกัน · ใช้สกิลพร้อมกันใน 3 วิ = COMBO ×1.6', 836, 205, { size: 22, color: '#fff' });
        D.coopStages.forEach((id, i) => {
          const st = D.stages[id], T = D.towns[i], open = sd.towns.unlocked.includes(i + 1) || i === 0, rec = sd.stages[id], r = R(40 + (i % 4) * 402, 240 + Math.floor(i / 4) * 320, 388, 300);
          UI.box(ctx, r.x, r.y, r.w, r.h, '#FFF9EE', '#D9B98C', 20);
          A.drawFit(ctx, D.maps[T.map].asset, r.x + 14, r.y + 14, r.w - 28, 150);
          UI.text(ctx, st.name, r.x + r.w / 2, r.y + 190, { size: 24, color: '#6B3F1C', outline: false, maxW: r.w - 20 });
          for (let s = 0; s < 3; s++) A.drawFit(ctx, rec && rec.stars[s] ? 'UI_ICON_STAR' : 'UI_ICON_STAR_BRONZE', r.x + 130 + s * 44, r.y + 212, 40, 40);
          UI.btn(ctx, { x: r.x + 60, y: r.y + 228 + 10, w: r.w - 120, h: 56, label: open ? 'เล่น' : `ปลดล็อก Town ${i + 1}`, color: open ? 'green' : 'gray', forcePill: true, disabled: !open, size: 22 }, () => Scenes.prebattle(id));
        });
        UI.text(ctx, 'P2 ใช้ทีมชุดถัดไป (ทีม ' + ((sd.teams.active + 1) % 5 + 1) + ') ถ้ามีสมาชิก ไม่งั้นใช้ทีมเดียวกัน', 836, 900, { size: 20, color: '#fff' });
      } else if (this.tab === 2) {
        D.challenges.forEach((id, i) => {
          const st = D.stages[id], rec = sd.stages[id], r = R(40 + (i % 5) * 322, 210 + Math.floor(i / 5) * 345, 308, 330);
          UI.box(ctx, r.x, r.y, r.w, r.h, rec && rec.cleared ? '#F2FBE6' : '#FFF9EE', '#D9B98C', 20);
          UI.text(ctx, `#${i + 1}`, r.x + 30, r.y + 30, { size: 26, color: '#FF7FB0' });
          UI.text(ctx, st.name, r.x + r.w / 2, r.y + 72, { size: 26, color: '#6B3F1C', outline: false, maxW: r.w - 20 });
          UI.para(ctx, st.desc, r.x + 16, r.y + 110, r.w - 32, { size: 18 });
          UI.text(ctx, `พลังแนะนำ ${st.recommendedPower}`, r.x + r.w / 2, r.y + 220, { size: 18, color: '#9A6A3A', outline: false });
          for (let s = 0; s < 3; s++) A.drawFit(ctx, rec && rec.stars[s] ? 'UI_ICON_STAR' : 'UI_ICON_STAR_BRONZE', r.x + 90 + s * 44, r.y + 236, 40, 40);
          UI.btn(ctx, { x: r.x + 40, y: r.y + 270, w: r.w - 80, h: 52, label: 'ท้าทาย', color: 'pink', forcePill: true, size: 22 }, () => Scenes.prebattle(id));
        });
      } else if (this.tab === 3) {
        UI.panel(ctx, 240, 220, 1190, 640, {});
        A.drawFit(ctx, 'MAP_EV_HARVEST', 290, 250, 560, 320);
        UI.para(ctx, 'ซอมบี้มาไม่หยุด ยิ่งรอดนานยิ่งยาก · มินิบอสทุก 5 Wave · บอสทุก 10 Wave · ศัตรูมาจากทุกเมืองที่ปลดล็อก · รางวัลตาม Wave ที่ไปถึง', 880, 270, 520, { size: 22 });
        UI.text(ctx, `สถิติสูงสุด: WAVE ${sd.endless.best}`, 835, 640, { size: 36, color: '#FF7FB0', outlineColor: '#6B3F1C' });
        UI.btn(ctx, { x: 635, y: 700, w: 400, h: 110, label: 'เริ่มเกม' }, () => Scenes.prebattle('ENDLESS', { back: () => E.setScene(Scenes.modes, { tab: 3 }) }));
        UI.btn(ctx, { x: 1080, y: 720, w: 300, h: 80, label: 'อันดับ', color: 'yellow', forcePill: true }, () => E.setScene(Scenes.ranking));
      } else {
        UI.panel(ctx, 240, 220, 1190, 640, {});
        UI.text(ctx, 'Online Multiplayer', 835, 290, { size: 40, color: '#FF7FB0', outlineColor: '#6B3F1C' });
        ['Matchmaking', 'Room', 'Invite Friend', 'Ready', 'Start', 'Disconnect / Reconnect', 'Result'].forEach((s, i) => UI.text(ctx, '• ' + s, 420, 360 + i * 44, { size: 24, align: 'left', color: '#9A6A3A', outline: false }));
        UI.para(ctx, 'โครงสร้างหน้าจอออนไลน์วางไว้แล้ว แต่ยังไม่มีเซิร์ฟเวอร์ (Backend) จึงยังเล่นออนไลน์ไม่ได้ — ไม่ได้จำลองว่าออนไลน์ทำงาน (ตามเอกสารข้อ 17.7) · ตอนนี้เล่น VS / CO-OP 2 คนบนเครื่องเดียวกันได้', 820, 380, 560, { size: 22 });
        UI.btn(ctx, { x: 635, y: 720, w: 400, h: 100, label: 'ยังไม่เปิดให้บริการ', color: 'gray', forcePill: true, disabled: true, size: 26 });
      }
    }
  });

  // ---------------- VS setup ----------------
  Scenes.vsSetup = Scenes.make({
    init(a) { const sd = RK.Save.data; this.zdeck = this.zdeck || Object.keys(sd.zombies.owned).filter(id => D.vsZombies[id]).slice(0, 8); },
    draw(ctx) {
      const sd = RK.Save.data, vs = this.args.vs;
      Scenes.frame(ctx, { title: 'เตรียม VS', back: () => E.setScene(Scenes.modes) });
      UI.panel(ctx, 40, 120, 790, 380, { });
      UI.text(ctx, vs.bear === 'cpu' ? 'ฝั่งหมี: CPU (ใช้ทีมของคุณ)' : 'ฝั่งหมี (P1 ขวา)', 435, 150, { size: 26, color: '#2477B8', outline: false });
      Scenes.teamStrip(ctx, 60, 180, 750, Scenes.vsSetup);
      UI.panel(ctx, 850, 120, 790, 640, {});
      UI.text(ctx, vs.zombie === 'cpu' ? 'ฝั่งซอมบี้: CPU' : 'ฝั่งซอมบี้ (P2 ซ้าย) — เลือก 8 ใบ', 1245, 150, { size: 26, color: '#6B3F8B', outline: false });
      const owned = Object.keys(sd.zombies.owned).filter(id => D.vsZombies[id]);
      owned.slice(0, 20).forEach((id, i) => {
        const on = this.zdeck.includes(id), r = R(870 + (i % 5) * 152, 190 + Math.floor(i / 5) * 140, 142, 130), z = D.enemies[id];
        UI.box(ctx, r.x, r.y, r.w, r.h, on ? '#F1E3FF' : '#FFF9EE', on ? '#A54FE0' : '#D9B98C', 14);
        A.fitImg(ctx, A.get(z.asset), r.x + 10, r.y + 4, r.w - 20, 90, true);
        UI.text(ctx, `🧠${D.vsZombies[id].brain}`, r.x + r.w / 2, r.y + 112, { size: 18, color: '#6B3F8B', outline: false });
        if (on) A.drawFit(ctx, 'UI_ICON_CHECK', r.x + r.w - 36, r.y, 36, 36);
        UI.area(r, () => { if (on) this.zdeck = this.zdeck.filter(x => x !== id); else if (this.zdeck.length < 8) this.zdeck.push(id); else UI.toast('เลือกได้ 8 ใบ'); });
      });
      UI.text(ctx, `ได้การ์ดเพิ่มจากตู้ซอมบี้ · มี ${owned.length} ใบ`, 1245, 740, { size: 20, color: '#9A6A3A', outline: false });
      UI.panel(ctx, 40, 520, 790, 240, {});
      UI.para(ctx, 'การควบคุม: แต่ละฝั่งใช้แถบการ์ดของตัวเองด้านล่าง (ซ้าย = ซอมบี้, ขวา = หมี) — เลือกการ์ดแล้วแตะแถว/ช่องบนสนาม · หมีวางได้ถึงเส้นแดง · การ์ดของอีกฝั่งกดแทนกันไม่ได้', 70, 560, 730, { size: 21 });
      UI.btn(ctx, { label: 'เริ่มเกม', x: 640, y: 790, w: 400, h: 110 }, () => {
        if (!this.zdeck.length) return UI.toast('ต้องมีการ์ดซอมบี้อย่างน้อย 1 ใบ');
        E.setScene(RK.Battle, { stageId: 'VS', deck: RK.Save.deck.slice(), vs: Object.assign({ zdeck: this.zdeck.slice() }, vs) });
      });
    }
  });

  // ---------------- Events list & event screen ----------------
  const fmtLeft = d => { const s = Math.max(0, (d - Date.now()) / 1000); const dd = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600); return dd > 0 ? `${dd} วัน ${hh} ชม.` : `${hh} ชม. ${Math.floor(s % 3600 / 60)} นาที`; };
  Scenes.eventsList = Scenes.make({
    draw(ctx) {
      Scenes.frame(ctx, { title: 'กิจกรรม' });
      const act = RK.EventsSys.active();
      D.events.forEach((ev, i) => {
        const on = ev.id === act.id, r = R(40 + (i % 3) * 535, 130 + Math.floor(i / 3) * 390, 520, 375);
        UI.box(ctx, r.x, r.y, r.w, r.h, '#FFF9EE', on ? '#FF7FB0' : '#D9B98C', 22);
        A.drawFit(ctx, D.maps[ev.map].asset, r.x + 14, r.y + 14, r.w - 28, 200);
        A.fitImg(ctx, A.get(ev.banner), r.x + r.w - 150, r.y + 90, 130, 150, true);
        UI.text(ctx, ev.nameTH, r.x + 24, r.y + 245, { size: 30, align: 'left', color: ev.color, outlineColor: '#fff' });
        UI.text(ctx, on ? `กำลังจัด · เหลือ ${fmtLeft(RK.EventsSys.endsAt())}` : `เริ่ม ${RK.EventsSys.startsAt(ev.id).toLocaleDateString('th-TH')}`, r.x + 24, r.y + 290, { size: 20, align: 'left', color: on ? '#3E9A2B' : '#9A6A3A', outline: false });
        UI.text(ctx, `โดนัทกิจกรรม ${RK.Eco.get('eventDonut', ev.id)}`, r.x + 24, r.y + 325, { size: 18, align: 'left', color: '#FF5E9A', outline: false });
        UI.btn(ctx, { x: r.x + r.w - 190, y: r.y + 290, w: 170, h: 66, label: on ? 'เข้าร่วม' : 'ดู / ฝึก', color: on ? 'pink' : 'gray', forcePill: true, size: 22 }, () => E.setScene(Scenes.event, { id: ev.id }));
      });
    }
  });
  Scenes.event = Scenes.make({
    init(a) { this.tab = a.tab || 0; },
    draw(ctx) {
      const ev = D.events.find(e => e.id === (this.args.id || RK.EventsSys.active().id)), on = RK.EventsSys.isActive(ev.id), st = RK.EventsSys.state(ev.id);
      Scenes.frame(ctx, { title: ev.nameTH, bg: D.maps[ev.map].asset, back: () => E.setScene(Scenes.eventsList), cur: ['eventDonut', 'gems'] });
      UI.text(ctx, on ? `กิจกรรมจำกัดเวลา · เหลือ ${fmtLeft(RK.EventsSys.endsAt())}` : `ยังไม่ถึงช่วงกิจกรรม (เริ่ม ${RK.EventsSys.startsAt(ev.id).toLocaleDateString('th-TH')}) — เล่นฝึกได้ แต่ไม่ได้รางวัลกิจกรรม`, 836, 130, { size: 24, color: on ? '#8BE05F' : '#FFB3B3' });
      UI.tabs(ctx, ['ด่านกิจกรรม', 'ภารกิจ', 'ร้านกิจกรรม', 'ศัตรูพิเศษ'], this.tab, 260, 160, 1150, 60, i => { this.tab = i; this.page = 0; }, [0, RK.EventsSys.missions(ev.id).filter(m => m.done && !m.claimed).length, 0, 0]);
      if (this.tab === 0) {
        ev.stages.forEach((id, i) => {
          const s = D.stages[id], r = R(40 + i * 322, 250, 308, 560), rec = RK.Save.data.stages[id];
          UI.box(ctx, r.x, r.y, r.w, r.h, '#FFF9EE', i === 4 ? '#FF6B6B' : '#D9B98C', 22);
          UI.text(ctx, s.name.split('· ')[1], r.x + r.w / 2, r.y + 40, { size: 30, color: i === 4 ? '#FF6B6B' : '#6B3F1C', outline: false });
          const ens = []; s.waves.forEach(w => w.spawns.forEach(g => { if (!ens.includes(g.enemy)) ens.push(g.enemy); }));
          ens.slice(0, 4).forEach((e, k) => A.fitImg(ctx, A.get(D.enemies[e].asset), r.x + 14 + (k % 2) * 142, r.y + 70 + Math.floor(k / 2) * 150, 138, 145, true));
          UI.text(ctx, `พลังแนะนำ ${s.recommendedPower}`, r.x + r.w / 2, r.y + 390, { size: 20, color: '#9A6A3A', outline: false });
          UI.text(ctx, `รางวัล: โดนัทกิจกรรม ${s.reward.eventDonut} + เพชร ${s.reward.gems}`, r.x + r.w / 2, r.y + 422, { size: 17, color: '#FF5E9A', outline: false, maxW: r.w - 16 });
          for (let k = 0; k < 3; k++) A.drawFit(ctx, rec && rec.stars[k] ? 'UI_ICON_STAR' : 'UI_ICON_STAR_BRONZE', r.x + 90 + k * 44, r.y + 440, 40, 40);
          UI.btn(ctx, { x: r.x + 30, y: r.y + 486, w: r.w - 60, h: 60, label: on ? 'เล่น' : 'ฝึกซ้อม', color: on ? 'pink' : 'gray', forcePill: true, size: 24 }, () => Scenes.prebattle(id, { practice: !on, back: () => E.setScene(Scenes.event, { id: ev.id }) }));
        });
      } else if (this.tab === 1) {
        RK.EventsSys.missions(ev.id).forEach((m, i) => {
          const y = 250 + i * 120; UI.box(ctx, 60, y, 1550, 105, m.claimed ? '#EFE6D6' : m.done ? '#FFF2C2' : '#FFF9EE', '#D9B98C', 18);
          UI.text(ctx, m.text, 90, y + 34, { size: 24, align: 'left', color: '#6B3F1C', outline: false });
          Scenes.progressBar(ctx, 90, y + 62, 520, 24, m.prog / m.goal); UI.text(ctx, `${m.prog}/${m.goal}`, 350, y + 74, { size: 17 });
          Object.keys(m.reward).forEach((k, j) => UI.item(ctx, k, m.reward[k], 860 + j * 92, y + 12, 80));
          UI.btn(ctx, { x: 1360, y: y + 14, w: 220, h: 76, label: m.claimed ? 'รับแล้ว ✓' : 'รับ', color: 'gray', forcePill: m.claimed, disabled: m.claimed || !m.done || !on, why: on ? 'ยังไม่สำเร็จ' : 'กิจกรรมยังไม่เริ่ม' }, () => UI.showRewards('ภารกิจกิจกรรม', RK.EventsSys.claimMission(ev.id, m.id)));
        });
      } else if (this.tab === 2) {
        RK.EventsSys.shopItems(ev.id).forEach((it, i) => {
          it.key = 'ev_' + i; const r = R(40 + (i % 4) * 402, 240 + Math.floor(i / 4) * 330, 388, 315), b = st.shop[it.key] || 0;
          Scenes.itemCard(ctx, it, r, !on ? 'ช่วงกิจกรรมเท่านั้น' : b >= it.limit ? 'ครบแล้ว' : null, () => Scenes.confirmBuy(it, ev.id), `จำกัด ${it.limit - b}/${it.limit}`);
        });
      } else {
        ev.enemies.concat([ev.boss]).forEach((id, i) => {
          const z = D.enemies[id], r = R(60 + (i % 4) * 400, 250 + Math.floor(i / 4) * 330, 380, 310);
          UI.box(ctx, r.x, r.y, r.w, r.h, '#FFF9EE', i === ev.enemies.length ? '#FF6B6B' : '#D9B98C', 22);
          A.fitImg(ctx, A.get(z.asset), r.x + 20, r.y + 14, 160, 200, true);
          UI.text(ctx, z.nameTH, r.x + 200, r.y + 50, { size: 22, align: 'left', color: '#6B3F1C', outline: false, maxW: 170 });
          UI.para(ctx, z.desc || '', r.x + 196, r.y + 90, 170, { size: 17 });
          UI.text(ctx, `HP ${z.hp} · ATK ${z.atk}`, r.x + r.w / 2, r.y + 260, { size: 18, color: '#9A6A3A', outline: false });
          UI.area(r, () => Scenes.zombieInfo(id));
        });
      }
    }
  });
})();
