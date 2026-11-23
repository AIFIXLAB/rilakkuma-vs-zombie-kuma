// ===== UI helpers: text, buttons, panels, toasts, modal dialogs =====
// Panels and plain pill buttons are drawn in code using colours sampled from the supplied UI kit,
// because the kit has no stretchable (9-slice) panel. Where a supplied button image matches the label
// (เริ่มเกม / รับ / ไปทำ / อัปเกรด / ซื้อ / ยกเลิก) the image itself is used.
(function () {
  const FONT = '"Thonburi","Noto Sans Thai","Loma","Kanit",system-ui,sans-serif';
  const PILL = {
    green: ['#8BE05F', '#3E9A2B'], yellow: ['#FFD93B', '#C58F0C'], blue: ['#5CC0F7', '#2477B8'],
    pink: ['#FF86B6', '#C94B82'], red: ['#FF6464', '#B92F2F'], gray: ['#C8C8D2', '#7C7C8A'], brown: ['#C98A4B', '#6B3F1C']
  };
  const BTN_IMG = { 'เริ่มเกม': 'BTN_START', 'รับ': 'BTN_RECEIVE', 'ไปทำ': 'BTN_GO', 'อัปเกรด': 'BTN_UPGRADE', 'ซื้อ': 'BTN_BUY', 'ยกเลิก': 'BTN_CANCEL' };

  const UI = RK.UI = {
    FONT, PILL, modal: null, toasts: [],
    font(size, weight) { return `${weight || 'bold'} ${size}px ${FONT}`; },
    text(ctx, str, x, y, o) {
      o = o || {};
      ctx.font = UI.font(o.size || 28, o.weight);
      ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.baseline || 'middle';
      if (o.outline !== false) {
        ctx.lineJoin = 'round'; ctx.lineWidth = o.outlineWidth || Math.max(3, (o.size || 28) / 5);
        ctx.strokeStyle = o.outlineColor || '#5A3212'; ctx.strokeText(str, x, y);
      }
      ctx.fillStyle = o.color || '#FFFFFF'; ctx.fillText(str, x, y);
    },
    roundRect(ctx, x, y, w, h, r) {
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
        const rw = Math.min(w - 60, 520), ry = y - 34;
        const img = RK.Assets.get(o.ribbon || 'UI_RIBBON_YELLOW');
        if (img) { const s = Math.min(rw / img.width, 92 / img.height); ctx.drawImage(img, x + w / 2 - img.width * s / 2, ry, img.width * s, img.height * s); }
        UI.text(ctx, o.title, x + w / 2, ry + 40, { size: 34 });
      }
    },
    // Button: returns rect. If label has a matching kit image, use the image.
    button(ctx, b) {
      const pressed = b.pressed ? 4 : 0;
      ctx.save();
      if (b.disabled) ctx.globalAlpha = 0.55;
      const imgId = b.img || (!b.forcePill && BTN_IMG[b.label]);
      if (imgId && RK.Assets.get(imgId)) {
        RK.Assets.drawFit(ctx, imgId, b.x, b.y + pressed, b.w, b.h);
      } else {
        const c = PILL[b.color || 'yellow'];
        UI.roundRect(ctx, b.x, b.y + 6, b.w, b.h - 6, (b.h - 6) / 2); ctx.fillStyle = c[1]; ctx.fill();
        UI.roundRect(ctx, b.x, b.y + pressed, b.w, b.h - 8, (b.h - 8) / 2); ctx.fillStyle = c[0]; ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; UI.roundRect(ctx, b.x + 14, b.y + 5 + pressed, b.w - 28, (b.h - 8) * 0.32, 10); ctx.fill();
        let tx = b.x + b.w / 2;
        if (b.icon && RK.Assets.get(b.icon)) { const ih = b.h * 0.62; RK.Assets.drawFit(ctx, b.icon, b.x + 14, b.y + (b.h - 8 - ih) / 2 + pressed, ih, ih); tx += ih / 2; }
        UI.text(ctx, b.label, tx, b.y + (b.h - 8) / 2 + pressed + 1, { size: b.size || Math.round(b.h * 0.42), outlineColor: c[1] });
      }
      if (b.disabled && b.lock) { const s = b.h * 0.7; RK.Assets.drawFit(ctx, 'UI_ICON_LOCK', b.x + b.w - s * 0.8, b.y - s * 0.25, s, s); }
      ctx.restore();
      return b;
    },
    hit(b, x, y) { return b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h; },

    toast(msg, secs) { this.toasts.push({ msg, t: secs || 2, max: secs || 2 }); if (this.toasts.length > 3) this.toasts.shift(); },

    // ---- Modal dialog: { title, lines[], buttons:[{label, color, action}], w, h, draw(ctx, box) } ----
    openModal(m) { m.w = m.w || 760; m.h = m.h || 420; this.modal = m; },
    closeModal() { this.modal = null; },
    modalTap(x, y) {
      const m = this.modal; if (!m) return;
      for (const b of (m._btns || [])) if (UI.hit(b, x, y) && !b.disabled) { RK.Audio.play('buttonClick'); const a = b.action; if (!b.keepOpen) this.closeModal(); a && a(); return; }
      if (m.onTap) m.onTap(x, y);
    },
    update(dt) { for (const t of this.toasts) t.t -= dt; this.toasts = this.toasts.filter(t => t.t > 0); },
    render(ctx) {
      const W = RK.Engine.W, H = RK.Engine.H;
      const m = this.modal;
      if (m) {
        ctx.fillStyle = 'rgba(40,20,10,0.55)'; ctx.fillRect(0, 0, W, H);
        const x = (W - m.w) / 2, y = (H - m.h) / 2 + 20;
        UI.panel(ctx, x, y, m.w, m.h, { title: m.title, ribbon: m.ribbon });
        let ly = y + 80;
        (m.lines || []).forEach(l => { const o = typeof l === 'string' ? { t: l } : l; UI.text(ctx, o.t, x + m.w / 2, ly, { size: o.size || 28, color: o.color || '#6B3F1C', outline: false }); ly += (o.size || 28) + 16; });
        if (m.draw) m.draw(ctx, { x, y, w: m.w, h: m.h });
        if (!m.customButtons) {
          const bs = m.buttons || [], bw = m.btnW || 240, bh = 74, gap = 30;
          const tw = bs.length * bw + (bs.length - 1) * gap;
          m._btns = bs.map((b, i) => Object.assign({}, b, { x: x + (m.w - tw) / 2 + i * (bw + gap), y: y + m.h - bh - 30, w: bw, h: bh }));
        }
        (m._btns || []).forEach(b => { if (!b.invisible) UI.button(ctx, b); });
      }
      let ty = 120;
      for (const t of this.toasts) {
        ctx.save(); ctx.globalAlpha = Math.min(1, t.t / 0.3);
        ctx.font = UI.font(30); const w = ctx.measureText(t.msg).width + 70;
        UI.roundRect(ctx, W / 2 - w / 2, ty, w, 60, 30); ctx.fillStyle = 'rgba(90,50,18,0.88)'; ctx.fill();
        UI.text(ctx, t.msg, W / 2, ty + 31, { size: 30, outline: false, color: '#FFF4DE' });
        ctx.restore(); ty += 72;
      }
    },
    confirm(title, lines, onYes, yesLabel) {
      this.openModal({ title, lines, buttons: [{ label: 'ยกเลิก', action: null }, { label: yesLabel || 'ตกลง', color: 'green', action: onYes, forcePill: !yesLabel }] });
    }
  };
})();
