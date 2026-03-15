import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "exercise",
    "duration",
    "target",
    "reps",
    "totalPreview",
    "soundToggle",
    "soundKnob",
    "durationGroup",
    "targetGroup",
  ];

  static values = {
    soundEnabled: { type: Boolean, default: true },
  };

  connect() {
    this.updatePreview();
  }

  setMode(e) {
    const mode = e.currentTarget.dataset.mode;

    this.element.querySelectorAll(".mode-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    this.durationGroupTarget.classList.toggle("hidden", mode === "target");
    this.targetGroupTarget.classList.toggle("hidden", mode !== "target");

    this.element.dataset.mode = mode;
    this.updatePreview();
  }

  increment(e) {
    const target = this.element.querySelector(`#${e.params.field}`);
    const max = parseInt(target.max || "9999");
    const val = parseInt(target.value) || 0;
    if (val < max) target.value = val + 1;
    this.updatePreview();
  }

  decrement(e) {
    const target = this.element.querySelector(`#${e.params.field}`);
    const min = parseInt(target.min || "1");
    const val = parseInt(target.value) || 0;
    if (val > min) target.value = val - 1;
    this.updatePreview();
  }

  updatePreview() {
    const mode = this.element.dataset.mode || "duration";
    const reps = parseInt(this.repsTarget.value) || 0;

    let total, duration;
    if (mode === "target") {
      total = parseInt(this.targetTarget.value) || 0;
      duration = reps > 0 ? Math.ceil(total / reps) : 0;
    } else {
      duration = parseInt(this.durationTarget.value) || 0;
      total = duration * reps;
    }

    const previewEl = this.totalPreviewTarget;
    previewEl.innerHTML = `<span class="text-gray-500 text-sm font-bold">total</span>
      <p class="text-5xl font-extrabold text-accent-green mt-1">${total} <span class="text-gray-500 text-xl">reps</span></p>
      <p class="text-gray-600 text-sm mt-1">${duration} min × ${reps} reps/min</p>`;
  }

  toggleSound() {
    this.soundEnabledValue = AudioEngine.toggle();
    const svg = this.soundEnabledValue
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
    this.soundKnobTarget.innerHTML = svg;
    this.soundToggleTarget.classList.toggle("border-accent-green", this.soundEnabledValue);
    this.soundToggleTarget.classList.toggle("text-accent-green", this.soundEnabledValue);
    this.soundToggleTarget.classList.toggle("text-gray-600", !this.soundEnabledValue);
  }

  start() {
    AudioEngine.unlock();

    const mode = this.element.dataset.mode || "duration";
    const reps = parseInt(this.repsTarget.value) || 5;
    const exercise = this.exerciseTarget.value.trim() || "Workout";

    let duration = null;
    let target = null;

    if (mode === "duration") {
      duration = parseInt(this.durationTarget.value) || 10;
    } else if (mode === "target") {
      target = parseInt(this.targetTarget.value) || 100;
      duration = Math.ceil(target / reps);
    }

    this.dispatch("startWorkout", {
      detail: { exercise, reps, duration, target, mode },
    });
  }
}
