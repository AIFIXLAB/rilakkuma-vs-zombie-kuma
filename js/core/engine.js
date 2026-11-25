// ===== Engine: canvas, scaling, fixed-step loop, input, scene manager =====
(function () {
  const C = RK.Data.config;
  const W = C.screen.width, H = C.screen.height;

  const Engine = RK.Engine = {
    W, H, canvas: null, ctx: null, scale: 1, offX: 0, offY: 0,
    scene: null, time: 0, realTime: 0, paused: false, manualStepping: false,
    pointer: { x: 0, y: 0, down: false },

    init() {
      const cv = this.canvas = document.getElementById('game');
      this.ctx = cv.getContext('2d');
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 200));
      this.resize();
      const opts = { passive: false };
      cv.addEventListener('pointerdown', e => { e.preventDefault(); this._pointer(e, 'down'); }, opts);
      cv.addEventListener('pointermove', e => { this._pointer(e, 'move'); }, opts);
      window.addEventListener('pointerup', e => { this._pointer(e, 'up'); }, opts);
      cv.addEventListener('contextmenu', e => e.preventDefault());
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.scene && this.scene.onHide) this.scene.onHide(); // Auto Pause
      });
      this._last = performance.now();
      this._acc = 0;
      requestAnimationFrame(t => this._frame(t));
    },

    resize() {
      const q = (RK.Save && RK.Save.data && RK.Save.data.settings.graphics) || 'high';
      const dpr = q === 'low' ? 1 : q === 'medium' ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2);
      const vw = window.innerWidth, vh = window.innerHeight;
      this.scale = Math.min(vw / W, vh / H);
      const cssW = Math.round(W * this.scale), cssH = Math.round(H * this.scale);
      this.offX = Math.floor((vw - cssW) / 2); this.offY = Math.floor((vh - cssH) / 2);
      const cv = this.canvas;
      cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px';
      cv.style.left = this.offX + 'px'; cv.style.top = this.offY + 'px';
      cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
      this.pixelScale = cv.width / W;
    },

    toLogical(e) {
      const r = this.canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    },

    _pointer(e, type) {
      const p = this.toLogical(e);
      this.pointer.x = p.x; this.pointer.y = p.y;
      if (type === 'down') { this.pointer.down = true; RK.Audio.unlock(); }
      if (type === 'up') this.pointer.down = false;
      if (!this.scene) return;
      if (type === 'down') { this.tap(p.x, p.y); return; }
      if (type === 'move' && this.scene.onMove) this.scene.onMove(p.x, p.y);
      if (type === 'up' && this.scene.onRelease) this.scene.onRelease(p.x, p.y);
    },

    // Programmatic tap (used by automated tests): same path as a real touch
    tap(x, y) {
      this.render();                                   // make sure hit areas match what is on screen
      if (RK.UI.modal) { RK.UI.modalTap(x, y); return; }
      if (this.scene && this.scene.onTap) this.scene.onTap(x, y, null); else RK.UI.tapAreas(x, y);
    },

    setScene(scene, args) {
      if (this.scene && this.scene.exit) this.scene.exit();
      RK.UI.closeModal();
      this.scene = scene;
      if (scene.enter) scene.enter(args || {});
    },

    // advance simulation by dt seconds in fixed steps (used by loop and by tests)
    step(dt) {
      const fs = C.fixedStep;
      this._acc += dt;
      let n = 0;
      while (this._acc >= fs && n < 600) {
        this._acc -= fs; n++;
        this.time += fs;
        if (this.scene && this.scene.update) this.scene.update(fs);
        RK.UI.update(fs);
      }
    },

    _frame(t) {
      const dt = Math.min(0.1, (t - this._last) / 1000);
      this._last = t; this.realTime += dt;
      if (!this.manualStepping) this.step(dt);
      this.render();
      requestAnimationFrame(tt => this._frame(tt));
    },

    render() {
      const ctx = this.ctx;
      ctx.setTransform(this.pixelScale, 0, 0, this.pixelScale, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(0, 0, W, H);
      RK.UI.beginFrame();
      if (this.scene && this.scene.render) this.scene.render(ctx);
      RK.UI.render(ctx);
    }
  };

  // Deterministic RNG (mulberry32) so test runs are reproducible
  RK.RNG = {
    seed(s) { this._s = s >>> 0; },
    next() { let t = this._s += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; },
    range(a, b) { return a + (b - a) * this.next(); },
    int(a, b) { return Math.floor(this.range(a, b + 1)); },
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  };
  RK.RNG.seed(Date.now());

  RK.util = {
    clamp: (v, a, b) => v < a ? a : v > b ? b : v,
    lerp: (a, b, t) => a + (b - a) * t,
    inRect: (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h,
    rect: (x, y, w, h) => ({ x, y, w, h })
  };
})();
