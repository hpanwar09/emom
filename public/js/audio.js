const AudioEngine = (() => {
  let ctx = null;
  let enabled = true;

  function getContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function unlock() {
    const c = getContext();
    if (c.state === "suspended") c.resume();
  }

  function beep(type = "tick") {
    if (!enabled) return;
    const c = getContext();
    if (c.state === "suspended") return;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    const presets = {
      countdown: { freq: 880, dur: 0.15, vol: 0.6, wave: "sine" },
      go: { freq: 1047, dur: 0.3, vol: 0.8, wave: "sine" },
      roundEnd: { freq: 440, dur: 0.2, vol: 0.5, wave: "triangle" },
      victory: { freq: 784, dur: 0.5, vol: 0.9, wave: "sine" },
    };

    const p = presets[type] || presets.countdown;
    const now = c.currentTime;

    osc.type = p.wave;
    osc.frequency.setValueAtTime(p.freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(p.vol, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.dur);
    osc.start(now);
    osc.stop(now + p.dur + 0.01);
  }

  function goBeep() {
    beep("go");
    setTimeout(() => beep("go"), 150);
  }

  function victoryBeep() {
    if (!enabled) return;
    [523, 659, 784].forEach((freq, i) => {
      setTimeout(() => {
        const c = getContext();
        if (c.state === "suspended") return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.connect(gain);
        gain.connect(c.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, c.currentTime);
        gain.gain.setValueAtTime(0, c.currentTime);
        gain.gain.linearRampToValueAtTime(0.7, c.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 0.5);
      }, i * 200);
    });
  }

  function toggle() {
    enabled = !enabled;
    return enabled;
  }

  function isEnabled() {
    return enabled;
  }

  return { unlock, beep, goBeep, victoryBeep, toggle, isEnabled };
})();

window.AudioEngine = AudioEngine;
