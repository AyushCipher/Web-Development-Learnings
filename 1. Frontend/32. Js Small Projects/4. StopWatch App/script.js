let milliseconds = 0;
let interval = null;

const display = document.getElementById("display");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

function updateTime() {
  let totalSeconds = Math.floor(milliseconds / 100);
  let mins = Math.floor(totalSeconds / 60);
  let secs = totalSeconds % 60;
  let ms = milliseconds % 100;

  display.textContent =
    (mins < 10 ? "0" : "") + mins + ":" +
    (secs < 10 ? "0" : "") + secs + ":" +
    (ms < 10 ? "0" : "") + ms;
}

function startTimer() {
  if (interval) return;
  interval = setInterval(() => {
    milliseconds++;
    updateTime();
  }, 10); // update every 10ms
}

function stopTimer() {
  clearInterval(interval);
  interval = null;
}

function resetTimer() {
  stopTimer();
  milliseconds = 0;
  updateTime();
}

startBtn.addEventListener("click", startTimer);
stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);
