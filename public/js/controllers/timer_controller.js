import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "configScreen",
    "countdownScreen",
    "timerScreen",
    "summaryScreen",
    "countdownNumber",
    "timerDisplay",
    "currentRound",
    "totalRounds",
    "repsDone",
    "repsTarget",
    "progressBar",
    "summaryExercise",
    "summaryDuration",
    "summaryRounds",
    "summaryReps",
    "summaryDetail",
    "summaryDate",
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
      this[`${s}ScreenTarget`].classList.toggle("hidden", s !== name);
    });
  }

  runCountdown() {
    this.showScreen("countdown");
    let count = 3;
    const el = this.countdownNumberTarget;
    el.textContent = count;
    el.className =
      "font-clock text-[14rem] leading-none text-accent-green glow-green";
    AudioEngine.beep("countdown");

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        el.textContent = count;
        AudioEngine.beep("countdown");
      } else {
        clearInterval(interval);
        el.textContent = "GO!";
        el.className =
          "font-clock text-[14rem] leading-none text-accent-orange glow-orange";
        AudioEngine.goBeep();
        setTimeout(() => this.runTimer(), 800);
      }
    }, 1000);
  }

  runTimer() {
    this.showScreen("timer");
    this.lastBeepSecond = null;

    const { reps, duration, target } = this.config;
    const plannedTarget = target || (duration ? duration * reps : null);

    this.repsDoneTarget.textContent = "0";
    this.totalRoundsTarget.textContent = duration;
    this.repsTargetTarget.textContent = plannedTarget;
    this.progressBarTarget.style.width = "0%";

    this.worker = new Worker("/js/timer_worker.js");

    this.worker.onmessage = (e) => {
      const msg = e.data;

      switch (msg.type) {
        case "ROUND_START":
          this.handleRoundStart(msg);
          break;
        case "TICK":
          this.handleTick(msg);
          break;
        case "DONE":
          this.finishWorkout(msg.rounds);
          break;
      }
    };

    this.worker.postMessage({
      type: "START",
      data: {
        totalRounds: duration,
        roundDurationMs: 60000,
      },
    });
  }

  handleRoundStart(msg) {
    this.currentRoundTarget.textContent = msg.round;
    this.lastBeepSecond = null;

    const { reps, duration, target } = this.config;
    const repsDone = (msg.round - 1) * reps;
    const plannedTarget = target || (duration ? duration * reps : null);

    this.repsDoneTarget.textContent = repsDone;

    if (plannedTarget) {
      this.progressBarTarget.style.width = `${
        (repsDone / plannedTarget) * 100
      }%`;
    }

    if (target && repsDone >= target) {
      this.worker.postMessage({ type: "STOP" });
      return;
    }

    if (msg.round > 1) AudioEngine.beep("go");
  }

  handleTick(msg) {
    const secs = msg.secondsLeft;
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    this.timerDisplayTarget.textContent = `${min}:${String(sec).padStart(
      2,
      "0"
    )}`;

    const display = this.timerDisplayTarget;
    if (secs <= 3) {
      display.className =
        "font-clock text-[14rem] leading-none text-accent-red glow-red tabular-nums";
    } else if (secs <= 10) {
      display.className =
        "font-clock text-[14rem] leading-none text-accent-orange glow-orange tabular-nums";
    } else {
      display.className =
        "font-clock text-[14rem] leading-none text-accent-green glow-green tabular-nums";
    }

    if (secs <= 3 && secs > 0 && secs !== this.lastBeepSecond) {
      AudioEngine.beep("countdown");
      this.lastBeepSecond = secs;
    }
  }

  stopWorkout() {
    const currentRound = parseInt(this.currentRoundTarget.textContent) || 1;
    this.finishWorkout(currentRound - 1);
  }

  finishWorkout(rounds) {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    AudioEngine.victoryBeep();

    this.timerDisplayTarget.className =
      "font-clock text-[14rem] leading-none text-accent-green glow-green tabular-nums";
    this.timerDisplayTarget.textContent = "0:00";

    const { exercise, reps } = this.config;
    const totalReps = reps * rounds;

    setTimeout(() => {
      this.summaryExerciseTarget.textContent = exercise;
      this.summaryRoundsTarget.textContent = rounds;
      this.summaryRepsTarget.textContent = totalReps;
      this.summaryDurationTarget.textContent = `${rounds}:00`;
      this.summaryDetailTarget.textContent = `${reps} reps/min`;
      this.summaryDateTarget.textContent = new Date().toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      );
      this.showScreen("summary");
    }, 2000);
  }

  downloadCard() {
    const card = document.getElementById("share-card");
    html2canvas(card, {
      backgroundColor: "#0a0a12",
      scale: 3,
      useCORS: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `emom-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  restart() {
    this.showScreen("config");
  }
}
