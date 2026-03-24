import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["exercise", "exerciseError", "reps", "rounds", "soundToggle", "soundKnob"];
  static values = { soundEnabled: { type: Boolean, default: true } };

  increment(e) {
    const input = this.element.querySelector(`#${e.params.field}`);
    const max = parseInt(input.max || "100");
    const val = parseInt(input.value) || 0;
    if (val < max) input.value = val + 1;
  }

  decrement(e) {
    const input = this.element.querySelector(`#${e.params.field}`);
    const min = parseInt(input.min || "1");
    const val = parseInt(input.value) || 0;
    if (val > min) input.value = val - 1;
  }

  // clamp on blur/manual input
  validate(e) {
    const input = e.target;
    const min = parseInt(input.min || "1");
    const max = parseInt(input.max || "100");
    let val = parseInt(input.value);
    if (isNaN(val) || val < min) val = min;
    if (val > max) val = max;
    input.value = val;
  }

  toggleSound() {
    this.soundEnabledValue = AudioEngine.toggle();
    const svg = this.soundEnabledValue
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
    this.soundKnobTarget.innerHTML = svg;
    this.soundToggleTarget.classList.toggle("border-green", this.soundEnabledValue);
    this.soundToggleTarget.classList.toggle("text-green", this.soundEnabledValue);
    this.soundToggleTarget.classList.toggle("text-muted", !this.soundEnabledValue);
  }

  start() {
    const exercise = this.exerciseTarget.value.trim();
    if (!exercise) {
      this.exerciseErrorTarget.classList.remove("hidden");
      this.exerciseTarget.style.borderBottomColor = "#ef4444";
      this.exerciseTarget.focus();
      return;
    }
    this.exerciseErrorTarget.classList.add("hidden");
    this.exerciseTarget.style.borderBottomColor = "";

    AudioEngine.unlock();
    const reps = parseInt(this.repsTarget.value) || 5;
    const rounds = parseInt(this.roundsTarget.value) || 10;

    this.dispatch("startWorkout", {
      detail: { exercise, reps, duration: rounds, target: reps * rounds, mode: "rounds" },
    });
}
}
