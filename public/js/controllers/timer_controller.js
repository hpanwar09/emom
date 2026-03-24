import { Controller } from "@hotwired/stimulus";

const CLOCK = "text-7xl sm:text-8xl font-black tabular tracking-tight";

export default class extends Controller {
  static targets = [
    "configScreen", "countdownScreen", "timerScreen", "summaryScreen",
    "countdownNumber", "timerDisplay",
    "currentRound", "totalRounds", "repsDone",
    "summaryHeadline", "summaryReps", "summaryDate",
  ];

  connect() {
    this.worker = null;
    this.config = {};
    this.lastBeepSecond = null;
  }

  startWorkout(e) {
    this.config = e.detail;
    this.runCountdown();
  }

  showScreen(name) {
    ["config", "countdown", "timer", "summary"].forEach((s) => {
      const el = this[`${s}ScreenTarget`];
      if (s === name) {
        el.classList.remove("hidden");
        el.offsetHeight;
        el.classList.add("enter");
      } else {
        el.classList.add("hidden");
        el.classList.remove("enter");
      }
    });
  }

  runCountdown() {
    this.showScreen("countdown");
    let count = 3;
    const el = this.countdownNumberTarget;
    el.textContent = count;
    el.className = "text-8xl sm:text-9xl font-black tabular text-green";
    AudioEngine.beep("countdown");

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        el.textContent = count;
        el.classList.add("pop-in");
        setTimeout(() => el.classList.remove("pop-in"), 200);
        AudioEngine.beep("countdown");
      } else {
        clearInterval(interval);
        el.textContent = "GO";
        el.className = "text-8xl sm:text-9xl font-black tabular text-orange";
        AudioEngine.goBeep();
        setTimeout(() => this.runTimer(), 800);
      }
    }, 1000);
  }

  runTimer() {
    this.showScreen("timer");
    this.lastBeepSecond = null;

    const { reps, duration } = this.config;
    this.repsDoneTarget.textContent = "0";
    this.totalRoundsTarget.textContent = duration;

    this.worker = new Worker("/js/timer_worker.js");

    this.worker.onmessage = (e) => {
      const msg = e.data;
      switch (msg.type) {
        case "ROUND_START": this.handleRoundStart(msg); break;
        case "TICK":        this.handleTick(msg);       break;
        case "DONE":        this.finishWorkout(msg.rounds); break;
        case "STOPPED":     this.finishWorkout(msg.rounds); break;
      }
    };

    this.worker.postMessage({
      type: "START",
      data: { totalRounds: duration, roundDurationMs: 60000 },
    });
  }

  handleRoundStart(msg) {
    this.currentRoundTarget.textContent = msg.round;
    this.lastBeepSecond = null;

    // count reps from COMPLETED rounds (previous round just ended)
    const repsDone = (msg.round - 1) * this.config.reps;
    this.repsDoneTarget.textContent = repsDone;

    if (msg.round > 1) AudioEngine.beep("go");
  }

  handleTick(msg) {
    const secs = msg.secondsLeft;
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    this.timerDisplayTarget.textContent = `${min}:${String(sec).padStart(2, "0")}`;

    if (secs <= 3) this.timerDisplayTarget.className = `${CLOCK} text-red`;
    else if (secs <= 10)
      this.timerDisplayTarget.className = `${CLOCK} text-orange`;
    else this.timerDisplayTarget.className = `${CLOCK} text-green`;

    if (secs <= 3 && secs > 0 && secs !== this.lastBeepSecond) {
      AudioEngine.beep("countdown");
      this.lastBeepSecond = secs;
    }
  }

  stopWorkout() {
    // current round's reps are already done (EMOM = reps at top of minute)
    this.finishWorkout(parseInt(this.currentRoundTarget.textContent) || 1);
  }

  finishWorkout(rounds) {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    AudioEngine.victoryBeep();

    this.timerDisplayTarget.className = `${CLOCK} text-green`;
    this.timerDisplayTarget.textContent = "0:00";

    const { exercise, reps } = this.config;
    const totalReps = reps * rounds;

    setTimeout(() => {
      this.summaryHeadlineTarget.textContent = `${reps} reps / minute * ${rounds} ${rounds === 1 ? "minute" : "minutes"}`;
      this.summaryRepsTarget.textContent = totalReps;
      this.summaryDateTarget.textContent = new Date().toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        },
      );
      this.showScreen("summary");
    }, 1500);
  }

  downloadCard() {
    html2canvas(document.getElementById("share-card"), {
      backgroundColor: "#111",
      scale: 3,
      useCORS: true,
    }).then((canvas) => {
      const a = document.createElement("a");
      a.download = `emom-${new Date().toISOString().slice(0, 10)}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    });
  }

  restart() {
    const configEl = this.configScreenTarget;
    const exercise = configEl.querySelector('[data-config-target="exercise"]');
    if (exercise) exercise.value = '';
    const reps = configEl.querySelector('#reps');
    if (reps) reps.value = '5';
    const rounds = configEl.querySelector('#rounds');
    if (rounds) rounds.value = '10';
    this.showScreen("config");
  }
}
