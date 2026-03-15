
let intervalId = null;
let roundStartTime = null;
let roundDurationMs = 60000;
let totalRounds = null; // null = open mode (no end)
let currentRound = 0;

self.onmessage = (e) => {
  const { type, data } = e.data;

  switch (type) {
    case "START":
      totalRounds = data.totalRounds; // null for open mode
      roundDurationMs = data.roundDurationMs || 60000;
      currentRound = 1;
      startRound();
      break;

    case "STOP":
      clearInterval(intervalId);
      intervalId = null;
      self.postMessage({ type: "STOPPED", rounds: currentRound - 1 });
      break;
  }
};

function startRound() {
  roundStartTime = Date.now();

  self.postMessage({
    type: "ROUND_START",
    round: currentRound,
    totalRounds: totalRounds,
  });

  intervalId = setInterval(() => {
    const elapsed = Date.now() - roundStartTime;
    const remaining = roundDurationMs - elapsed;
    const secondsLeft = Math.ceil(remaining / 1000);

    if (remaining <= 0) {
      clearInterval(intervalId);

      if (totalRounds !== null && currentRound >= totalRounds) {
        self.postMessage({ type: "DONE", rounds: currentRound });
      } else {
        currentRound++;
        startRound();
      }
      return;
    }

    self.postMessage({
      type: "TICK",
      remaining: remaining,
      round: currentRound,
      totalRounds: totalRounds,
      secondsLeft: secondsLeft,
    });
  }, 250);
}
