// ===== Generative Music (Web Audio) =====
// Endless, always-new soundtrack in a quirky "spooky garden" style: oom-pah bass, marimba/bell lead,
// pizzicato off-beat stabs, march drums. Every section's melody is composed on the fly from motifs
// (A A' B A'' forms), progressions and scales; after a few sections a brand-new song starts in a new
// key / tempo / mode. Nothing is sampled or copied — all notes are generated, all sounds are synthesised.
// Uses Math.random (NOT RK.RNG) so gameplay stays deterministic.
(function () {
  const SCALES = {
    major: [0, 2, 4, 5, 7, 9, 11], lydian: [0, 2, 4, 6, 7, 9, 11], mixo: [0, 2, 4, 5, 7, 9, 10],
    minor: [0, 2, 3, 5, 7, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11], dorian: [0, 2, 3, 5, 7, 9, 10]
  };
  const MOODS = {
    menu:   { bpm: [88, 100],  scales: ['major', 'lydian', 'mixo'], roots: [60, 62, 65, 67], lead: 'bell',    spooky: 0.04, drumsMax: 1, int: 1,
              progs: [[0, 3, 4, 0], [0, 5, 3, 4], [0, 1, 4, 0], [0, 3, 1, 4], [0, 4, 5, 3], [3, 4, 0, 0]] },
    battle: { bpm: [104, 116], scales: ['minor', 'harm', 'dorian', 'harm'], roots: [57, 59, 62, 64], lead: 'marimba', spooky: 0.18, drumsMax: 3, int: 1,
              progs: [[0, 3, 4, 0], [0, 5, 3, 4], [0, 6, 5, 4], [0, 3, 0, 4], [5, 3, 0, 4], [0, 0, 5, 4], [0, 1, 4, 4]] },
    final:  { bpm: [124, 134], scales: ['harm', 'minor'], roots: [57, 60, 62], lead: 'marimba', spooky: 0.28, drumsMax: 3, int: 3, pad: true,
              progs: [[0, 5, 1, 4], [0, 3, 4, 4], [0, 6, 5, 4], [5, 1, 4, 0]] }
  };
  const RHYTHMS = [
    [1, 1, 1, 1], [0.5, 0.5, 1, 0.5, 0.5, 1], [1.5, 0.5, 1, 1], [0.5, 0.5, 0.5, 0.5, 2], [1, 0.5, 0.5, 1, -1],
    [0.75, 0.25, 0.75, 0.25, 1, 1], [0.5, -0.5, 0.5, 0.5, 1, 1], [2, 1, 1], [0.5, 0.5, 1, -0.5, 0.5, 1],
    [0.25, 0.25, 0.5, 1, 1, 1], [1, -0.5, 0.5, 1, 1], [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1]
  ];
  const R = () => Math.random(), pick = a => a[Math.floor(R() * a.length)], rint = (a, b) => a + Math.floor(R() * (b - a + 1));

  // ---------------- Composer: produces one bar of events at a time ----------------
  class Composer {
    constructor(moodName) { this.moodName = moodName; this.m = MOODS[moodName]; this.intensity = this.m.int; this.newSong(); }
    newSong() {
      const m = this.m;
      this.bpm = rint(m.bpm[0], m.bpm[1]); this.scaleName = pick(m.scales); this.scale = SCALES[this.scaleName];
      this.root = pick(m.roots); this.songSections = rint(3, 5); this.sectionNo = 0; this.songId = (this.songId || 0) + 1;
      this.motifA = null; this.newSection();
    }
    newSection() {
      this.prog = pick(this.m.progs); this.form = pick(['AABA', 'ABAB', 'AABA', 'ABAC', 'AAAB']);
      if (!this.motifA || R() < 0.55) this.motifA = this.makeMotif(this.prog[0], this.prog[1], 0);
      this.motifB = this.makeMotif(this.prog[2], this.prog[3], 2); this.motifC = this.makeMotif(this.prog[0], this.prog[1], 1);
      this.bassStyle = pick(['oompah', 'oompah', 'march', 'walk']); this.counter = R() < 0.5; this.bar = 0;
    }
    deg2midi(deg) { const o = Math.floor(deg / 7), i = ((deg % 7) + 7) % 7; return this.root + 12 * o + this.scale[i]; }
    chordTones(d) { return [d, d + 2, d + 4]; }
    makeMotif(c1, c2, lift) {
      const notes = []; let cur = 7 + c1 + rint(0, 2) * 2 - 2 + lift;
      for (let b = 0; b < 2; b++) {
        const chord = b ? c2 : c1; let t = 0;
        for (const d of pick(RHYTHMS)) {
          const dur = Math.abs(d);
          if (d > 0) {
            if (t % 2 === 0) { // strong beat -> nearest chord tone (any octave)
              const cands = []; for (const ct of this.chordTones(chord)) for (const o of [0, 7, 14]) cands.push(ct + o);
              cands.sort((a, b2) => Math.abs(a - cur) - Math.abs(b2 - cur)); cur = R() < 0.75 ? cands[0] : cands[1];
            } else cur += R() < 0.7 ? pick([-1, 1]) : pick([-3, -2, 2, 3]);
            cur = Math.max(3 + lift, Math.min(13 + lift, cur));
            notes.push({ t: b * 4 + t, dur, deg: cur, chrom: R() < this.m.spooky && dur >= 0.5 });
          }
          t += dur;
        }
      }
      return notes;
    }
    // returns {events, beats}
    nextBar() {
      const ev = [], i = this.bar, phrase = Math.floor(i / 2), half = i % 2, chord = this.prog[i % 4], int = this.intensity, m = this.m;
      const letter = this.form[phrase];
      let motif = letter === 'A' ? this.motifA : letter === 'B' ? this.motifB : this.motifC;
      const shift = letter === 'A' ? this.prog[(phrase * 2) % 4] - this.prog[0] : 0;     // A' follows the chords
      const last = phrase === 3;
      // ---- lead melody ----
      motif.filter(n => n.t >= half * 4 && n.t < half * 4 + 4).forEach((n, k, arr) => {
        let deg = n.deg + shift, dur = n.dur;
        if (last && half === 1 && k === arr.length - 1) { deg = 7; dur = Math.max(dur, 1); }   // resolve to tonic
        const midi = this.deg2midi(deg), t = n.t - half * 4;
        if (n.chrom && t >= 0.25) ev.push({ t: t - 0.125, dur: 0.125, inst: m.lead, midi: midi - 1, vel: 0.35 });  // spooky grace note
        ev.push({ t, dur, inst: m.lead, midi, vel: t % 1 === 0 ? 0.75 : 0.6 });
      });
      // ---- bass ----
      const rootM = this.deg2midi(chord) - 24, fifth = this.deg2midi(chord + 4) - 24, nextRoot = this.deg2midi(this.prog[(i + 1) % 4]) - 24;
      if (int === 0) { ev.push({ t: 0, dur: 1.5, inst: 'bass', midi: rootM, vel: 0.8 }); ev.push({ t: 2, dur: 1.5, inst: 'bass', midi: fifth, vel: 0.65 }); }
      else if (this.bassStyle === 'walk' && int >= 2) {
        [rootM, this.deg2midi(chord + 1) - 24, fifth, nextRoot + (nextRoot > fifth ? -1 : 1)].forEach((n, k) => ev.push({ t: k, dur: 0.8, inst: 'bass', midi: n, vel: 0.8 }));
      } else {
        ev.push({ t: 0, dur: 0.45, inst: 'bass', midi: rootM, vel: 0.9 }); ev.push({ t: 2, dur: 0.45, inst: 'bass', midi: this.bassStyle === 'march' ? rootM + 12 : fifth, vel: 0.75 });
        if (int >= 2) ev.push({ t: 3.5, dur: 0.4, inst: 'bass', midi: nextRoot + (R() < 0.5 ? -1 : 2), vel: 0.55 });
      }
      // ---- oom-PAH off-beat stabs ----
      if (int >= 1) for (const t of [1, 3]) this.chordTones(chord).forEach(d => ev.push({ t, dur: 0.2, inst: 'pizz', midi: this.deg2midi(d), vel: 0.3 }));
      // ---- counter arpeggio ----
      if (int >= 2 && this.counter) this.chordTones(chord).concat([chord + 7, chord + 4, chord + 2, chord + 7, chord + 4])
        .forEach((d, k) => ev.push({ t: k * 0.5, dur: 0.25, inst: 'pizz', midi: this.deg2midi(d) + 12, vel: 0.18 }));
      // ---- pad ----
      if (m.pad || int >= 3) this.chordTones(chord).forEach(d => ev.push({ t: 0, dur: 4, inst: 'pad', midi: this.deg2midi(d), vel: 0.16 }));
      // ---- drums ----
      const dr = Math.min(int, m.drumsMax);
      if (dr >= 1) for (let k = 0; k < 8; k++) ev.push({ t: k * 0.5, dur: 0.05, inst: this.moodName === 'menu' ? 'shaker' : 'hat', vel: k % 2 ? 0.22 : 0.34 });
      if (dr >= 1 && this.moodName !== 'menu') { ev.push({ t: 0, inst: 'kick', vel: 0.9 }); ev.push({ t: 2, inst: 'kick', vel: 0.75 }); }
      if (dr >= 2) { ev.push({ t: 1, inst: 'snare', vel: 0.55 }); ev.push({ t: 3, inst: 'snare', vel: 0.6 }); }
      if (dr >= 3) { ev.push({ t: 2.5, inst: 'kick', vel: 0.55 }); if (i === 7) for (let k = 0; k < 8; k++) ev.push({ t: 2 + k * 0.25, inst: 'snare', vel: 0.25 + k * 0.06 }); }
      // ---- spooky creep at the end of a battle section ----
      if (i === 7 && this.moodName !== 'menu' && R() < 0.6) { const top = this.deg2midi(7) + 12; [0, -1, -2, -6].forEach((o, k) => ev.push({ t: 2 + k * 0.5, dur: 0.4, inst: 'pizz', midi: top + o, vel: 0.28 })); }
      // advance
      this.bar++;
      if (this.bar >= 8) { this.sectionNo++; if (this.sectionNo >= this.songSections) this.newSong(); else this.newSection(); }
      return { events: ev, beats: 4 };
    }
  }

  // ---------------- Synth voices ----------------
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function env(ctx, g, time, a, peak, decay, hold) {
    g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), time + a);
    if (hold) g.gain.setValueAtTime(peak, time + a + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, time + a + (hold || 0) + decay);
    return time + a + (hold || 0) + decay + 0.05;
  }
  function osc(ctx, type, f, time, end, dest, detune) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, time); if (detune) o.detune.value = detune;
    o.connect(dest); o.start(time); o.stop(end); return o;
  }
  function voice(G, e, time, spb) {
    const ctx = G.ctx, out = G.bus, v = e.vel || 0.5, f = e.midi != null ? mtof(e.midi) : 0;
    const g = ctx.createGain(); g.connect(out);
    switch (e.inst) {
      case 'marimba': { const end = env(ctx, g, time, 0.004, 0.32 * v, 0.55); osc(ctx, 'sine', f, time, end, g);
        const g2 = ctx.createGain(); g2.connect(out); const e2 = env(ctx, g2, time, 0.002, 0.07 * v, 0.12); osc(ctx, 'sine', f * 4, time, e2, g2); G.send(g, 0.25); break; }
      case 'bell': { const end = env(ctx, g, time, 0.003, 0.26 * v, 0.9); osc(ctx, 'sine', f, time, end, g);
        const g2 = ctx.createGain(); g2.connect(out); const e2 = env(ctx, g2, time, 0.002, 0.08 * v, 0.35); osc(ctx, 'sine', f * 2.76, time, e2, g2); G.send(g, 0.35); break; }
      case 'pizz': { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.connect(g);
        const end = env(ctx, g, time, 0.003, 0.3 * v, 0.16); osc(ctx, 'triangle', f, time, end, lp); G.send(g, 0.2); break; }
      case 'bass': { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, time); lp.frequency.exponentialRampToValueAtTime(260, time + 0.25); lp.Q.value = 4; lp.connect(g);
        const end = env(ctx, g, time, 0.012, 0.42 * v, Math.max(0.12, e.dur * spb * 0.8)); osc(ctx, 'sawtooth', f, time, end, lp); osc(ctx, 'square', f / 2, time, end, lp); break; }
      case 'pad': { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(g);
        const len = e.dur * spb; const end = env(ctx, g, time, 0.25, 0.12 * v, 0.6, Math.max(0, len - 0.85));
        osc(ctx, 'sawtooth', f, time, end, lp, -9); osc(ctx, 'sawtooth', f, time, end, lp, 9); G.send(g, 0.4); break; }
      case 'kick': { const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(130, time); o.frequency.exponentialRampToValueAtTime(42, time + 0.14);
        const end = env(ctx, g, time, 0.002, 0.9 * v, 0.22); o.connect(g); o.start(time); o.stop(end); break; }
      case 'snare': case 'hat': case 'shaker': {
        const s = ctx.createBufferSource(); s.buffer = G.noise; const fl = ctx.createBiquadFilter();
        if (e.inst === 'snare') { fl.type = 'bandpass'; fl.frequency.value = 1900; fl.Q.value = 0.8; }
        else { fl.type = 'highpass'; fl.frequency.value = e.inst === 'hat' ? 7500 : 5000; }
        s.connect(fl); fl.connect(g);
        const end = env(ctx, g, time, e.inst === 'shaker' ? 0.015 : 0.001, (e.inst === 'snare' ? 0.5 : 0.16) * v, e.inst === 'snare' ? 0.14 : 0.045);
        s.start(time, Math.random() * 0.5); s.stop(end);
        if (e.inst === 'snare') { const g2 = ctx.createGain(); g2.connect(out); const e2 = env(ctx, g2, time, 0.001, 0.25 * v, 0.07); osc(ctx, 'triangle', 190, time, e2, g2); G.send(g, 0.15); }
        break; }
    }
  }
  // Build mix graph on any (real or offline) context
  function buildGraph(ctx) {
    const master = ctx.createGain(), bus = ctx.createGain(), duckLP = ctx.createBiquadFilter();
    duckLP.type = 'lowpass'; duckLP.frequency.value = 18000;
    bus.connect(duckLP); duckLP.connect(master); master.connect(ctx.destination);
    // light slap-back "room"
    const d = ctx.createDelay(1), fb = ctx.createGain(), dl = ctx.createBiquadFilter(), wet = ctx.createGain();
    d.delayTime.value = 0.19; fb.gain.value = 0.28; dl.type = 'lowpass'; dl.frequency.value = 2500; wet.gain.value = 0.5;
    d.connect(dl); dl.connect(fb); fb.connect(d); dl.connect(wet); wet.connect(duckLP);
    const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const ch = noise.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
    // compressor to keep things tidy
    master.disconnect(); const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; master.connect(comp); comp.connect(ctx.destination);
    return { ctx, master, bus, duckLP, noise, send(node, amt) { const s = ctx.createGain(); s.gain.value = amt; node.connect(s); s.connect(d); } };
  }
  function scheduleBar(G, comp, time) {
    const spb = 60 / comp.bpm, bar = comp.nextBar();
    bar.events.forEach(e => voice(G, e, time + e.t * spb, spb));
    return time + bar.beats * spb;
  }
  // Short generated jingles
  function jingleEvents(type) {
    const root = pick([60, 62, 65]);
    if (type === 'victory') {
      const sc = SCALES.major, step = pick([[0, 2, 4, 7], [0, 4, 2, 4, 7], [4, 2, 0, 4, 7], [0, 2, 4, 5, 7]]);
      const ev = step.map((d, k) => ({ t: k * 0.25, dur: 0.25, inst: 'bell', midi: root + 12 * Math.floor(d / 7) + sc[d % 7] + 12, vel: 0.8 }));
      const end = step.length * 0.25 + 0.25;
      [0, 4, 7].forEach(s => ev.push({ t: end, dur: 2, inst: 'pad', midi: root + s + 12, vel: 0.5 }));
      [0, 4, 7, 12].forEach(s => ev.push({ t: end, dur: 0.3, inst: 'marimba', midi: root + s + 12, vel: 0.7 }));
      ev.push({ t: end, inst: 'kick', vel: 0.8 }); ev.push({ t: end, inst: 'snare', vel: 0.5 });
      return { events: ev, bpm: 120 };
    }
    const ev = [0, -1, -2, -3, -6].map((o, k) => ({ t: k * 0.5, dur: 0.5, inst: 'marimba', midi: root + 7 + o, vel: 0.7 }));
    ev.push({ t: 2.5, dur: 1.5, inst: 'bass', midi: root - 24, vel: 0.9 }); [0, 3, 6].forEach(s => ev.push({ t: 2.5, dur: 2, inst: 'pad', midi: root + s, vel: 0.4 }));
    return { events: ev, bpm: 100 };
  }

  // ---------------- Public music player ----------------
  const Music = RK.Music = {
    ctx: null, G: null, comp: null, mood: null, wanted: null, timer: null, volume: 0.8, enabled: true, ducked: false,
    ensure() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      try { this.ctx = new AC(); this.G = buildGraph(this.ctx); this.applyVolume(); } catch (e) { this.ctx = null; return false; }
      return true;
    },
    unlock() {     // must run inside a user gesture (iOS)
      if (!this.ensure()) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => { });
      if (this.wanted && !this.mood) this.start(this.wanted);
    },
    start(mood) {
      this.wanted = mood;
      if (!this.enabled || !this.ctx) return;               // will start after first tap
      if (this.mood === mood && this.timer) return;
      this.mood = mood; this.comp = new Composer(mood);
      this.nextTime = Math.max(this.nextTime || 0, this.ctx.currentTime + 0.08);
      if (!this.timer) this.timer = setInterval(() => this.tick(), 25);
    },
    tick() {
      if (!this.ctx || !this.comp || this.ctx.state !== 'running') return;
      if (this.nextTime < this.ctx.currentTime) this.nextTime = this.ctx.currentTime + 0.05;
      while (this.nextTime < this.ctx.currentTime + 0.35) this.nextTime = scheduleBar(this.G, this.comp, this.nextTime);
    },
    stop() { clearInterval(this.timer); this.timer = null; this.mood = null; this.comp = null; },
    setIntensity(n) { if (this.comp) this.comp.intensity = Math.max(0, Math.min(3, n)); },
    jingle(type) {
      this.stop(); this.wanted = null;
      if (!this.enabled || !this.ensure() || this.ctx.state !== 'running') return;
      const j = jingleEvents(type), spb = 60 / j.bpm, t0 = this.ctx.currentTime + 0.05;
      j.events.forEach(e => voice(this.G, e, t0 + e.t * spb, spb));
    },
    duck(on) {
      if (!this.G || this.ducked === on) return; this.ducked = on; const t = this.ctx.currentTime;
      this.G.bus.gain.setTargetAtTime(on ? 0.4 : 1, t, 0.15); this.G.duckLP.frequency.setTargetAtTime(on ? 900 : 18000, t, 0.15);
    },
    applyVolume() {
      const s = RK.Save && RK.Save.data && RK.Save.data.settings;
      if (s) { this.volume = s.music; this.enabled = s.musicOn !== false; }
      if (this.G) this.G.master.gain.setTargetAtTime(this.enabled ? this.volume * 0.7 : 0, this.ctx.currentTime, 0.05);
      if (!this.enabled) this.stop(); else if (this.wanted && !this.mood) this.start(this.wanted);
    },
    suspend(on) { if (!this.ctx) return; if (on) this.ctx.suspend().catch(() => { }); else this.ctx.resume().catch(() => { }); },
    info() { return this.comp ? { mood: this.mood, song: this.comp.songId, bpm: this.comp.bpm, key: this.comp.root, scale: this.comp.scaleName, section: this.comp.sectionNo, intensity: this.comp.intensity } : null; },
    // Render to an AudioBuffer (used for previews/tests). plan = [{mood, seconds, intensity}]
    async renderOffline(plan, sampleRate) {
      sampleRate = sampleRate || 44100; const total = plan.reduce((s, p) => s + p.seconds, 0) + 2;
      const ctx = new OfflineAudioContext(2, Math.ceil(total * sampleRate), sampleRate); const G = buildGraph(ctx); G.master.gain.value = 0.7;
      let t = 0.05;
      for (const p of plan) {
        if (p.jingle) { const j = jingleEvents(p.jingle), spb = 60 / j.bpm; j.events.forEach(e => voice(G, e, t + e.t * spb, spb)); t += p.seconds; continue; }
        const c = new Composer(p.mood); if (p.intensity != null) c.intensity = p.intensity;
        const end = t + p.seconds; while (t < end) { if (p.ramp) c.intensity = Math.min(3, Math.floor((t - (end - p.seconds)) / p.seconds * 4)); t = scheduleBar(G, c, t); }
      }
      return ctx.startRendering();
    },
    _Composer: Composer
  };
  document.addEventListener('visibilitychange', () => Music.suspend(document.hidden));
})();
