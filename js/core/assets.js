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
  // Everything Phase 1 needs at start-up
  A.PRELOAD = [
    'BG_TITLE', 'BG_LOBBY', 'BG_SELECT_TOWN', 'MAP_TOWN1', 'CUT_INTRO',
    'FACTORY_LV1', 'FACTORY_LV2', 'FACTORY_LV3', 'FACTORY_LV4', 'FACTORY_LV5',
    'FACTORY_ANIM_HEATING', 'FACTORY_ANIM_BAKING', 'FACTORY_ANIM_EJECT', 'FX_SPARKLE',
    'DONUT_NORMAL',
    'DEF_POT_SHIELD', 'DEF_SPRAY', 'DEF_CARDBOARD', 'DEF_FAN', 'DEF_MOP_CAT', 'DEF_LAUNDRY_PANDA',
    'ATK_DONUT_KUMA', 'ATK_DONUT_KORI', 'ATK_LADLE_TORI', 'ATK_ROLLINGPIN_CHEF', 'ATK_DONUT_CANNON', 'ATK_GOGGLE_CAT', 'ATK_UMBRELLA_PANDA', 'ATK_CHOCO_KUMA',
    'ZOM_NORMAL', 'ZOM_NURSE', 'ZOM_HEAVY', 'ZOM_CONE', 'ZOM_BUCKET', 'BOSS_GIANT_ZOMBIE_KUMA',
    'RZ_ROCK', 'RZ_BUILDER', 'RZ_CHEF', 'RZ_FARMER', 'RZ_TRASH', 'RZ_TOXIC',
    'PROJ_ROCK', 'PROJ_BRICK', 'PROJ_EGG', 'PROJ_TOMATO', 'PROJ_CAN', 'PROJ_POISON_BOTTLE',
    'UI_ICON_HEART', 'UI_ICON_COIN', 'UI_ICON_HOURGLASS', 'UI_ICON_LOCK', 'UI_ICON_STAR', 'UI_ICON_STAR_BRONZE', 'UI_ICON_SETTINGS',
    'UI_ICON_PLAY', 'UI_ICON_ARROW_LEFT', 'UI_ICON_ARROW_RIGHT', 'UI_ICON_CHECK',
    'UI_ICON_UPGRADE', 'UI_ICON_EXP',
    'UI_CARD_FRAME_EMPTY', 'UI_RIBBON_YELLOW', 'UI_RIBBON_BLUE', 'UI_RIBBON_RED',
    'UI_TOGGLE_ON', 'UI_TOGGLE_OFF',
    'BTN_START', 'BTN_RECEIVE', 'BTN_GO', 'BTN_UPGRADE', 'BTN_BUY', 'BTN_CANCEL',
    'UI_FX_HIT_SPLAT', 'UI_FX_CLOUD', 'UI_FX_TWINKLE', 'UI_FX_STAR_GLOW', 'UI_FX_BURST_LINES'
  ];
})();
