// ===== UI toolkit: text, panels, buttons, immediate-mode hit areas, tabs, pager, toasts, modals, reward popup, text input =====
// Menus are "immediate mode": each frame a screen draws itself and registers tap areas with UI.btn()/UI.area().
// Panels and plain pill buttons are drawn in code using colours sampled from the supplied UI kit; where a supplied
// button image matches the label (เริ่มเกม / รับ / ไปทำ / อัปเกรด / ซื้อ / ยกเลิก) the image itself is used.
(function () {
  const FONT = '"Thonburi","Noto Sans Thai","Loma","Kanit",system-ui,sans-serif';
  const PILL = {
    green: ['#8BE05F', '#3E9A2B'], yellow: ['#FFD93B', '#C58F0C'], blue: ['#5CC0F7', '#2477B8'], purple: ['#B98BF2', '#6B3F8B'],
    pink: ['#FF86B6', '#C94B82'], red: ['#FF6464', '#B92F2F'], gray: ['#C8C8D2', '#7C7C8A'], brown: ['#C98A4B', '#6B3F1C']
  };
  const BTN_IMG = { 'เริ่มเกม': 'BTN_START', 'รับ': 'BTN_RECEIVE', 'ไปทำ': 'BTN_GO', 'อัปเกรด': 'BTN_UPGRADE', 'ซื้อ': 'BTN_BUY', 'ยกเลิก': 'BTN_CANCEL' };
  const RAR = { Common: '#9AA5B1', Rare: '#3A9BEA', Epic: '#A54FE0', Legend: '#F0A81A' };

  const UI = RK.UI = {
    FONT, PILL, RAR, modal: null, toasts: [], _areas: [], popupQueue: [],
    beginFrame() { this._areas = []; if (this.modal) this.modal._areas = []; },
    font(size, weight) { return `${weight || 'bold'} ${size}px ${FONT}`; },
    text(ctx, str, x, y, o) {
      o = o || {}; str = String(str);
      ctx.font = UI.font(o.size || 28, o.weight);
      ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.baseline || 'middle';
      if (o.maxW) { let s = o.size || 28; while (s > 12 && ctx.measureText(str).width > o.maxW) { s -= 1; ctx.font = UI.font(s, o.weight); } }
      if (o.outline !== false) { ctx.lineJoin = 'round'; ctx.lineWidth = o.outlineWidth || Math.max(3, (o.size || 28) / 5); ctx.strokeStyle = o.outlineColor || '#5A3212'; ctx.strokeText(str, x, y); }
      ctx.fillStyle = o.color || '#FFFFFF'; ctx.fillText(str, x, y);
    },
    // wrapped paragraph text; returns height used
    para(ctx, str, x, y, maxW, o) {
      o = o || {}; const size = o.size || 22; ctx.font = UI.font(size, o.weight || 'normal');
      const words = String(str).split(/(\s+)/), lines = []; let cur = '';
      const chars = str.includes(' ') ? words : Array.from(str);
      for (const w of chars) { const t = cur + w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w.trimStart(); } else cur = t; }
      if (cur) lines.push(cur);
      lines.forEach((l, i) => UI.text(ctx, l, x, y + i * (size + 8), Object.assign({ align: 'left', outline: false, color: '#6B3F1C', size, weight: o.weight || 'normal' }, o)));
      return lines.length * (size + 8);
    },
    roundRect(ctx, x, y, w, h, r) {
      r = Math.max(0, Math.min(r, w / 2, h / 2));
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    },
    panel(ctx, x, y, w, h, o) {
      o = o || {};
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
      UI.roundRect(ctx, x, y, w, h, o.r || 26); ctx.fillStyle = o.border || '#8B5A2B'; ctx.fill();
      ctx.shadowColor = 'transparent';
      UI.roundRect(ctx, x + 7, y + 7, w - 14, h - 14, (o.r || 26) - 6); ctx.fillStyle = o.fill || '#FFF4DE'; ctx.fill();
      ctx.restore();
      if (o.title) {
        const rw = Math.min(w - 60, 560), ry = y - 34;
        const img = RK.Assets.get(o.ribbon || 'UI_RIBBON_YELLOW');
        if (img) { const s = Math.min(rw / img.width, 92 / img.height); ctx.drawImage(img, x + w / 2 - img.width * s / 2, ry, img.width * s, img.height * s); }
        UI.text(ctx, o.title, x + w / 2, ry + 40, { size: 32, maxW: rw - 80 });
      }
    },
    box(ctx, x, y, w, h, fill, stroke, r) { UI.roundRect(ctx, x, y, w, h, r == null ? 16 : r); ctx.fillStyle = fill || '#FFF9EE'; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); } },
    button(ctx, b) {
      const pressed = b.pressed ? 4 : 0;
      ctx.save();
      if (b.disabled) ctx.globalAlpha = 0.5;
      const imgId = b.img || (!b.forcePill && BTN_IMG[b.label]);
      if (imgId && RK.Assets.get(imgId)) RK.Assets.drawFit(ctx, imgId, b.x, b.y + pressed, b.w, b.h);
      else {
        const c = PILL[b.color || 'yellow'];
        UI.roundRect(ctx, b.x, b.y + 6, b.w, b.h - 6, (b.h - 6) / 2); ctx.fillStyle = c[1]; ctx.fill();
        UI.roundRect(ctx, b.x, b.y + pressed, b.w, b.h - 8, (b.h - 8) / 2); ctx.fillStyle = c[0]; ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; UI.roundRect(ctx, b.x + 14, b.y + 5 + pressed, b.w - 28, (b.h - 8) * 0.32, 10); ctx.fill();
        let tx = b.x + b.w / 2;
        if (b.icon && RK.Assets.get(b.icon)) { const ih = b.h * 0.62; RK.Assets.drawFit(ctx, b.icon, b.x + 12, b.y + (b.h - 8 - ih) / 2 + pressed, ih, ih); tx += ih / 2; }
        UI.text(ctx, b.label, tx, b.y + (b.h - 8) / 2 + pressed + 1, { size: b.size || Math.round(b.h * 0.4), outlineColor: c[1], maxW: b.w - (b.icon ? b.h : 0) - 20 });
      }
      if (b.badge) { ctx.fillStyle = '#FF3B3B'; ctx.beginPath(); ctx.arc(b.x + b.w - 8, b.y + 8, 16, 0, Math.PI * 2); ctx.fill(); UI.text(ctx, b.badge > 9 ? '9+' : String(b.badge), b.x + b.w - 8, b.y + 8, { size: 16, outline: false }); }
      ctx.restore();
      return b;
    },
    hit(b, x, y) { return b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; },
    // ---- immediate-mode hit areas ----
    area(r, fn) { (this.modal && this.modal._drawing ? this.modal._areas : this._areas).push({ r, fn }); },
    btn(ctx, b, fn) { UI.button(ctx, b); if (!b.disabled || b.tapDisabled) UI.area(b, () => { RK.Audio.play('buttonClick'); fn && fn(); }); else UI.area(b, () => b.why && UI.toast(b.why)); return b; },
    tapAreas(x, y, list) { list = list || this._areas; for (let i = list.length - 1; i >= 0; i--) if (UI.hit(list[i].r, x, y)) { list[i].fn(x, y); return true; } return false; },
    // tabs: returns rects; onChange(i)
    tabs(ctx, labels, active, x, y, w, h, onChange, badges) {
      const n = labels.length, tw = (w - (n - 1) * 8) / n;
      labels.forEach((l, i) => { const r = { x: x + i * (tw + 8), y, w: tw, h, label: l, color: i === active ? 'pink' : 'gray', forcePill: true, size: Math.min(24, h * 0.42), badge: badges && badges[i] }; UI.btn(ctx, r, () => onChange(i)); });
    },
    pager(ctx, page, pages, cx, y, onChange) {
      if (pages <= 1) return;
      UI.btn(ctx, { x: cx - 170, y, w: 90, h: 70, label: '◀', color: 'blue', forcePill: true, disabled: page <= 0 }, () => onChange(page - 1));
      UI.text(ctx, `${page + 1} / ${pages}`, cx, y + 32, { size: 26, color: '#6B3F1C', outline: false });
      UI.btn(ctx, { x: cx + 80, y, w: 90, h: 70, label: '▶', color: 'blue', forcePill: true, disabled: page >= pages - 1 }, () => onChange(page + 1));
    },
    rarityFrame(ctx, x, y, w, h, rarity) { UI.box(ctx, x, y, w, h, '#FFF9EE', RAR[rarity] || '#D9B98C', 18); ctx.fillStyle = RAR[rarity] || '#D9B98C'; UI.roundRect(ctx, x + 4, y + h - 26, w - 8, 22, 10); ctx.fill(); UI.text(ctx, rarity || '', x + w / 2, y + h - 15, { size: 14, outline: false }); },
    // item icon box for reward keys
    item(ctx, key, qty, x, y, s, o) {
      const inf = RK.Eco.info(key); o = o || {};
      UI.box(ctx, x, y, s, s, '#FFF9EE', '#D9B98C', 14);
      const img = inf.costume ? RK.Assets.skin(o.charAsset || 'ATK_DONUT_KUMA', inf.costume) : RK.Assets.tinted(inf.icon, inf.tint);
      RK.Assets.fitImg(ctx, img, x + 8, y + 6, s - 16, s - 24);
      if (qty != null) UI.text(ctx, '×' + RK.Eco.fmt(qty), x + s / 2, y + s - 12, { size: Math.max(14, s * 0.18) });
    },
    currencyBar(ctx, keys, xRight) {
      let x = xRight || 1650;
      for (const k of keys.slice().reverse()) {
        const inf = RK.Eco.info(k), v = k === 'eventDonut' ? RK.Eco.get('eventDonut') : (RK.Save.data.cur[k] != null ? RK.Save.data.cur[k] : RK.Save.data.mats[k] || 0);
        const w = 200; x -= w + 10;
        UI.box(ctx, x, 18, w, 56, 'rgba(255,249,238,0.95)', '#8B5A2B', 28);
        RK.Assets.fitImg(ctx, RK.Assets.tinted(inf.icon, inf.tint), x + 6, 22, 48, 48);
        UI.text(ctx, RK.Eco.fmt(v), x + 125, 47, { size: 24, color: '#5A3212', outline: false });
      }
    },
    toast(msg, secs) { if (this.mute) return; this.toasts.push({ msg, t: secs || 2, max: secs || 2 }); if (this.toasts.length > 3) this.toasts.shift(); },

    // ---- Modal dialog: { title, lines[], buttons:[{label, color, action}], w, h, draw(ctx, box) } ----
    openModal(m) { m.w = m.w || 760; m.h = m.h || 420; m._areas = []; this.modal = m; },
    closeModal() { this.modal = null; this.closeInput(); },
    modalTap(x, y) {
      const m = this.modal; if (!m) return;
      for (const b of (m._btns || [])) if (UI.hit(b, x, y)) { if (b.disabled) { b.why && UI.toast(b.why); return; } RK.Audio.play('buttonClick'); const a = b.action; if (!b.keepOpen) this.closeModal(); a && a(); return; }
      if (UI.tapAreas(x, y, m._areas)) return;
      if (m.onTap) m.onTap(x, y);
    },
    update(dt) { for (const t of this.toasts) t.t -= dt; this.toasts = this.toasts.filter(t => t.t > 0); if (!this.modal && this.popupQueue.length) this.openModal(this.popupQueue.shift()); },
    render(ctx) {
      const W = RK.Engine.W, H = RK.Engine.H, m = this.modal;
      if (m) {
        ctx.fillStyle = 'rgba(40,20,10,0.55)'; ctx.fillRect(0, 0, W, H);
        const x = (W - m.w) / 2, y = (H - m.h) / 2 + 20;
        UI.panel(ctx, x, y, m.w, m.h, { title: m.title, ribbon: m.ribbon });
        let ly = y + 80;
        (m.lines || []).forEach(l => { const o = typeof l === 'string' ? { t: l } : l; UI.text(ctx, o.t, x + m.w / 2, ly, { size: o.size || 28, color: o.color || '#6B3F1C', outline: false, maxW: m.w - 80 }); ly += (o.size || 28) + 16; });
        m._areas = []; m._drawing = true;
        if (m.draw) m.draw(ctx, { x, y, w: m.w, h: m.h });
        m._drawing = false;
        if (!m.customButtons) {
          const bs = m.buttons || [], bw = m.btnW || 240, bh = 74, gap = 30;
          const tw = bs.length * bw + (bs.length - 1) * gap;
          m._btns = bs.map((b, i) => Object.assign({}, b, { x: x + (m.w - tw) / 2 + i * (bw + gap), y: y + m.h - bh - 30, w: bw, h: bh }));
        }
        (m._btns || []).forEach(b => { if (!b.invisible) UI.button(ctx, b); });
        if (this._input) this.placeInput(x, y);
      }
      let ty = 120;
      for (const t of this.toasts) {
        ctx.save(); ctx.globalAlpha = Math.min(1, t.t / 0.3);
        ctx.font = UI.font(30); const w = Math.min(1500, ctx.measureText(t.msg).width + 70);
        UI.roundRect(ctx, W / 2 - w / 2, ty, w, 60, 30); ctx.fillStyle = 'rgba(90,50,18,0.9)'; ctx.fill();
        UI.text(ctx, t.msg, W / 2, ty + 31, { size: 28, outline: false, color: '#FFF4DE', maxW: w - 40 });
        ctx.restore(); ty += 72;
      }
    },
    confirm(title, lines, onYes, yesLabel) {
      this.openModal({ title, lines, buttons: [{ label: 'ยกเลิก', action: null }, { label: yesLabel || 'ตกลง', color: 'green', action: onYes, forcePill: !BTN_IMG[yesLabel] }] });
    },
    // Reward popup (queued so several can follow each other)
    showRewards(title, got, extraLines) {
      if (!got || !got.length) return;
      const m = { title: title || 'ได้รับรางวัล!', w: Math.min(1400, Math.max(700, got.length * 120 + 120)), h: 420 + (got.length > 10 ? 120 : 0), lines: extraLines || [],
        draw(ctx, b) {
          const per = 10, rows = Math.ceil(got.length / per);
          for (let r = 0; r < rows; r++) RK.BattleView.drawRewards(ctx, got.slice(r * per, r * per + per), b.x + b.w / 2, b.y + 100 + (extraLines ? 40 : 0) + r * 120, per);
          got.slice(0, 20).forEach((g, i) => { });
          const names = got.slice(0, 4).map(g => g.name + (g.note ? ` (${g.note})` : '')).join(' · ');
          UI.text(ctx, names + (got.length > 4 ? ' …' : ''), b.x + b.w / 2, b.y + b.h - 140, { size: 20, color: '#8B5A2B', outline: false, maxW: b.w - 60 });
        }, buttons: [{ label: 'รับ', action: null }] };
      if (this.modal) this.popupQueue.push(m); else this.openModal(m);
    },
    // ---- DOM text input over the canvas (keyboard on iPad) ----
    textInput(opts, cb) {
      this.openModal({ title: opts.title, w: 820, h: 400, lines: opts.lines || [], customButtons: true,
        draw(ctx, b) {
          UI.box(ctx, b.x + 60, b.y + 150, b.w - 120, 70, '#fff', '#8B5A2B', 16);
          UI.modal._btns = [{ label: 'ยกเลิก', color: 'gray', forcePill: true, x: b.x + 100, y: b.y + b.h - 110, w: 260, h: 74 },
            { label: 'ตกลง', color: 'green', forcePill: true, x: b.x + b.w - 360, y: b.y + b.h - 110, w: 260, h: 74, action: () => cb(UI._input ? UI._input.value : '') }];
        } });
      const inp = document.createElement('input'); inp.type = 'text'; inp.value = opts.value || ''; inp.maxLength = opts.max || 40; inp.placeholder = opts.placeholder || '';
      inp.style.cssText = 'position:absolute;z-index:5;border:none;outline:none;background:transparent;font:bold 30px Thonburi,sans-serif;color:#5A3212;';
      if (opts.mono) inp.style.fontFamily = 'monospace';
      document.body.appendChild(inp); this._input = inp; setTimeout(() => { try { inp.focus(); } catch (e) { } }, 50);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const v = inp.value; UI.closeModal(); cb(v); } });
    },
    placeInput(mx, my) {
      const E = RK.Engine, r = E.canvas.getBoundingClientRect(), s = r.width / E.W, inp = this._input;
      inp.style.left = (r.left + (mx + 75) * s) + 'px'; inp.style.top = (r.top + (my + 155) * s) + 'px';
      inp.style.width = ((this.modal.w - 150) * s) + 'px'; inp.style.height = (60 * s) + 'px'; inp.style.fontSize = Math.max(14, 30 * s) + 'px';
    },
    closeInput() { if (this._input) { this._input.remove(); this._input = null; } }
  };
})();
