// ===== Asset loader (images only; files listed in data/assets.js from the Asset Manifest) =====
(function () {
  const A = RK.Assets = {
    images: {}, failed: [],
    // Loads standalone images (data/assets.js -> assetFiles) and sprites packed in atlas sheets
    // (-> atlas / atlasSheets). Atlas sprites are cut into their own canvases, so the rest of the
    // game can treat every asset as a plain image with width/height.
    load(ids, onProgress) {
      const files = RK.Data.assetFiles || {}, atlas = RK.Data.atlas || {}, sheetsDef = RK.Data.atlasSheets || {};
      const list = ids.filter(id => !this.images[id]);
      const direct = list.filter(id => files[id] && !atlas[id]);
      const fromAtlas = list.filter(id => atlas[id]);
      list.filter(id => !files[id] && !atlas[id]).forEach(id => { this.failed.push(id); console.warn('Unknown asset id', id); });
      const sheetNames = [...new Set(fromAtlas.map(id => atlas[id][0]))];
      const jobs = direct.map(id => ({ id, src: files[id] })).concat(sheetNames.map(n => ({ sheet: n, src: sheetsDef[n] })));
      const sheetImgs = {};
      let done = 0;
      return new Promise(resolve => {
        const finish = () => {
          for (const id of fromAtlas) {
            const [n, x, y, w, h] = atlas[id], img = sheetImgs[n];
            if (!img) { this.failed.push(id); continue; }
            const c = document.createElement('canvas'); c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
            this.images[id] = c;
          }
          resolve();
        };
        if (!jobs.length) return finish();
        jobs.forEach(j => {
          const img = new Image();
          img.onload = () => { if (j.sheet) sheetImgs[j.sheet] = img; else this.images[j.id] = img; tick(); };
          img.onerror = () => { this.failed.push(j.id || j.sheet); console.warn('Asset failed', j.src); tick(); };
          img.src = j.src;
        });
        function tick() { done++; onProgress && onProgress(done / jobs.length); if (done === jobs.length) finish(); }
      });
    },
    // ---- recolours built with canvas blend modes (no pixel reads, no ctx.filter — works on iPad Safari) ----
    _cache: {},
    TINTS: { choco: ['#6B3A1E', 0.75], red: ['#E8434B', 0.6], green: ['#4FC45A', 0.7], blue: ['#3AA0F0', 0.7], cream: ['#FFE9B0', 0.6], fire: ['#FF6A1A', 0.7], pink: ['#FF7FB8', 0.6],
      ice: ['#9BE3FF', 0.75], purple: ['#A34FE8', 0.75], dark: ['#3A3A44', 0.6], gold: ['#FFC21A', 0.7], rainbow: ['#FF4FD8', 0.55] },
    recolor(id, color, amount, dark) {
      const key = id + '|' + color + '|' + amount + '|' + (dark || 0);
      if (this._cache[key]) return this._cache[key];
      const img = this.images[id]; if (!img) return null;
      const w = img.width, h = img.height, mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
      const out = mk(), o = out.getContext('2d'); o.drawImage(img, 0, 0);
      if (color) {
        const col = mk(), x = col.getContext('2d');
        x.drawImage(img, 0, 0); x.globalCompositeOperation = 'color'; x.fillStyle = color; x.fillRect(0, 0, w, h);
        x.globalCompositeOperation = 'destination-in'; x.drawImage(img, 0, 0);
        o.globalAlpha = amount; o.drawImage(col, 0, 0); o.globalAlpha = 1;
      }
      if (dark) { o.globalCompositeOperation = 'source-atop'; o.fillStyle = `rgba(0,0,0,${dark})`; o.fillRect(0, 0, w, h); }
      return (this._cache[key] = out);
    },
    skin(id, costume) { const c = costume && RK.Data.costumes[costume]; if (!c || !c.tint) return this.images[id]; return this.recolor(id, c.tint, c.amount, c.dark) || this.images[id]; },
    tinted(id, tint) { const t = tint && this.TINTS[tint]; if (!t) return this.images[id]; return this.recolor(id, t[0], t[1]) || this.images[id]; },
    silhouette(id) {
      const key = id + '|sil'; if (this._cache[key]) return this._cache[key];
      const img = this.images[id]; if (!img) return null;
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d');
      x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgba(60,40,30,0.55)'; x.fillRect(0, 0, c.width, c.height);
      return (this._cache[key] = c);
    },
    // draw any image/canvas fitted into a box
    fitImg(ctx, img, x, y, w, h, alignBottom) {
      if (!img) return null; const s = Math.min(w / img.width, h / img.height), dw = img.width * s, dh = img.height * s;
      const dx = x + (w - dw) / 2, dy = alignBottom ? y + h - dh : y + (h - dh) / 2; ctx.drawImage(img, dx, dy, dw, dh); return { x: dx, y: dy, w: dw, h: dh };
    },
    get(id) { return this.images[id]; },
    // Draw image fitted inside box (keeps aspect ratio — doc 22.2 "ไม่บีบภาพ")
    drawFit(ctx, id, x, y, w, h, alignBottom) {
      const img = this.images[id]; if (!img) return null;
      const s = Math.min(w / img.width, h / img.height);
      const dw = img.width * s, dh = img.height * s;
      const dx = x + (w - dw) / 2, dy = alignBottom ? y + h - dh : y + (h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      return { x: dx, y: dy, w: dw, h: dh };
    },
    // Draw sprite anchored at feet (bottom-centre) with given height
    drawAnchored(ctx, id, cx, footY, height) {
      const img = this.images[id]; if (!img) return;
      const s = height / img.height, dw = img.width * s;
      ctx.drawImage(img, cx - dw / 2, footY - height, dw, height);
    }
  };
  // Sprites (PNG / atlas) are loaded at start-up; full-screen JPG boards load in the background after the title shows
  A.allSprites = () => Object.keys(RK.Data.atlas || {}).concat(Object.keys(RK.Data.assetFiles).filter(id => /\.png$/i.test(RK.Data.assetFiles[id]) && !/Unassigned/.test(RK.Data.assetFiles[id])));
  A.allScreens = () => Object.keys(RK.Data.assetFiles).filter(id => /\.jpe?g$/i.test(RK.Data.assetFiles[id]) && !/Unassigned/.test(RK.Data.assetFiles[id]));
  A.BOOT_SCREENS = ['BG_TITLE', 'BG_LOBBY', 'BG_SELECT_TOWN', 'MAP_TOWN1'];
})();
