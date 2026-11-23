// ===== Audio System (doc PART 24) =====
// No audio files were supplied with the assets. Music (BGM + victory/defeat jingles) is generated live by
// js/core/music.js; sound effects below are wired but silent until files are added.
// To add sound: put files in Assets/Audio/ and fill the map, e.g. donutCollect: 'Assets/Audio/donut.mp3'.
(function () {
  const SOUND_FILES = {
    bgmMenu: null, bgmBattle: null, buttonClick: null, donutCollect: null, factoryProduce: null, unitPlace: null,
    attack: null, projectile: null, hit: null, zombie: null, bossWarning: null, waveWarning: null,
    victory: null, defeat: null, skill: null, upgrade: null, gacha: null
  };
  const MUSIC = ['bgmMenu', 'bgmBattle'];
  RK.Audio = {
    cache: {}, music: null, log: [],
    unlock() { /* iOS requires a user gesture before playing audio; called on every touch */ this.unlocked = true; RK.Music && RK.Music.unlock(); },
    play(name) {
      this.log.push(name); if (this.log.length > 50) this.log.shift();
      // Music is generated live by RK.Music (js/core/music.js) unless a file is supplied below
      if (!SOUND_FILES[name] && RK.Music) {
        if (name === 'bgmMenu') return RK.Music.start('menu');
        if (name === 'bgmBattle') return RK.Music.start('battle');
        if (name === 'victory' || name === 'defeat') return RK.Music.jingle(name);
      }
      const f = SOUND_FILES[name]; if (!f || !this.unlocked) return;
      const s = RK.Save.data.settings;
      try {
        const a = this.cache[name] || (this.cache[name] = new Audio(f));
        if (MUSIC.includes(name)) { if (this.music && this.music !== a) this.music.pause(); this.music = a; a.loop = true; a.volume = s.music; }
        else { a.currentTime = 0; a.volume = s.sfx; }
        a.play().catch(() => { });
      } catch (e) { }
    },
    stopMusic() { if (this.music) this.music.pause(); RK.Music && RK.Music.stop(); },
    hasFiles() { return Object.values(SOUND_FILES).some(Boolean); }
  };
})();
