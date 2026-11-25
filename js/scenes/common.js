// ===== Shared screen frame for menu scenes =====
(function () {
  const UI = RK.UI, A = RK.Assets, E = RK.Engine;
  const Scenes = RK.Scenes = RK.Scenes || {};
  const R = (x, y, w, h) => ({ x, y, w, h });
  Scenes.R = R;
  // blurred backdrop made by down/up-scaling a supplied screen (no filter API needed)
  Scenes.blurBg = function (id) {
    const key = 'blur_' + id; if (A._cache[key]) return A._cache[key];
    const img = A.get(id); if (!img) return null;
    const s = document.createElement('canvas'); s.width = 84; s.height = 47; const sx = s.getContext('2d'); sx.imageSmoothingEnabled = true; sx.drawImage(img, 0, 0, 84, 47);
    const s2 = document.createElement('canvas'); s2.width = 418; s2.height = 235; const x2 = s2.getContext('2d'); x2.imageSmoothingEnabled = true; x2.drawImage(s, 0, 0, 418, 235);
    return (A._cache[key] = s2);
  };
  // frame(ctx, scene, { title, bg, back, cur:[...] })
  Scenes.frame = function (ctx, o) {
    const bg = Scenes.blurBg(o.bg || 'BG_LOBBY');
    if (bg) ctx.drawImage(bg, 0, 0, E.W, E.H); else { ctx.fillStyle = '#FFE9C7'; ctx.fillRect(0, 0, E.W, E.H); }
    ctx.fillStyle = 'rgba(255,240,220,0.35)'; ctx.fillRect(0, 0, E.W, E.H);
    if (o.title) { const img = A.get('UI_RIBBON_YELLOW'); if (img) A.drawFit(ctx, 'UI_RIBBON_YELLOW', 200, 6, 560, 92); UI.text(ctx, o.title, 480, 48, { size: 36, maxW: 440 }); }
    UI.btn(ctx, { x: 14, y: 14, w: 160, h: 76, label: 'กลับ', icon: 'UI_ICON_ARROW_LEFT', color: 'gray', forcePill: true, size: 26 }, o.back || (() => E.setScene(Scenes.lobby)));
    UI.currencyBar(ctx, o.cur || ['gold', 'gems', 'tickets']);
  };
  // generic scene factory: def.draw(ctx) registers areas; taps go to UI areas
  Scenes.make = function (def) {
    return Object.assign({ page: 0, tab: 0, t: 0, enter(a) { this.args = a || {}; this.page = 0; this.t = 0; if (this.init) this.init(this.args); },
      update(dt) { this.t += dt; }, render(ctx) { this.draw(ctx); }, onTap(x, y) { UI.tapAreas(x, y); } }, def);
  };
  Scenes.progressBar = function (ctx, x, y, w, h, k, color) {
    UI.box(ctx, x, y, w, h, '#E8D7BE', null, h / 2);
    if (k > 0) { ctx.fillStyle = color || '#8BE05F'; UI.roundRect(ctx, x + 2, y + 2, Math.max(h - 4, (w - 4) * Math.min(1, k)), h - 4, (h - 4) / 2); ctx.fill(); }
  };
  Scenes.costText = function (cost) {
    const n = { gold: 'ทอง', gems: 'เพชร', cookie: 'คุกกี้', honey: 'น้ำผึ้ง', recipe: 'ตำรา', iron: 'เหล็ก', crystal: 'คริสตัล', rainbow: 'น้ำตาลรุ้ง', frag: 'เศษ' };
    return Object.keys(cost).filter(k => cost[k]).map(k => `${n[k] || k} ${cost[k].toLocaleString()}`).join(' · ');
  };
  // red dot helper
  Scenes.dot = function (ctx, x, y, n) { if (!n) return; ctx.fillStyle = '#FF3B3B'; ctx.beginPath(); ctx.arc(x, y, 17, 0, Math.PI * 2); ctx.fill(); UI.text(ctx, n > 9 ? '9+' : String(n), x, y, { size: 17, outline: false }); };
})();
