// ===== Boot =====
(function () {
  const E = RK.Engine;
  const Loading = {
    p: 0,
    render(ctx) {
      ctx.fillStyle = '#FFE9C7'; ctx.fillRect(0, 0, E.W, E.H);
      RK.UI.text(ctx, 'RILAKKUMA vs ZOMBIE KUMA', E.W / 2, 380, { size: 60, color: '#FFD93B' });
      ctx.fillStyle = '#8B5A2B'; RK.UI.roundRect(ctx, 436, 480, 800, 40, 20); ctx.fill();
      ctx.fillStyle = '#FF7FB0'; RK.UI.roundRect(ctx, 442, 486, Math.max(20, 788 * this.p), 28, 14); ctx.fill();
      RK.UI.text(ctx, `กำลังโหลด ${Math.round(this.p * 100)}%`, E.W / 2, 570, { size: 30, color: '#8B5A2B', outline: false });
    }
  };
  window.addEventListener('load', () => {
    RK.Save.load();
    RK.Music.applyVolume();
    E.init();
    E.setScene(Loading);
    const boot = Array.from(new Set(RK.Assets.allSprites().concat(RK.Assets.BOOT_SCREENS)));
    RK.Assets.load(boot, p => Loading.p = p).then(() => {
      if (RK.Assets.failed.length) RK.UI.toast('โหลดภาพไม่สำเร็จ ' + RK.Assets.failed.length + ' ไฟล์', 4);
      E.setScene(RK.Scenes.title);
      // remaining boards / screens stream in while the player is on the title screen
      RK.Assets.load(RK.Assets.allScreens()).then(() => { window.RK_ALL_LOADED = true; });
      window.RK_READY = true;
    });
  });
  // Playtime tracking
  setInterval(() => { if (RK.Save.data && !document.hidden) { RK.Save.data.stats.playTime += 10; RK.Save.saveSoon('playtime'); } }, 10000);
})();
