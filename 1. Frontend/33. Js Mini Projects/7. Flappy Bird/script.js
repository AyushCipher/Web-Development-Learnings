const block = document.getElementById("block");
const hole = document.getElementById("hole");
const character = document.getElementById("character");

let jumping = false;
let counter = 0;

hole.addEventListener('animationiteration', () => {
  hole.style.top = -(150 + Math.random() * 300) + "px";
  counter++;
});

setInterval(() => {
  const charTop = parseInt(getComputedStyle(character).top);

  if (!jumping) {
    character.style.top = (charTop + 3) + "px";
  }

  const blockLeft = parseInt(getComputedStyle(block).left);
  const holeTop = parseInt(getComputedStyle(hole).top);
  const cTop = -(500 - charTop);

  if (
    charTop > 480 ||
    (blockLeft < 20 && blockLeft > -50 && (cTop < holeTop || cTop > holeTop + 130))
  ) {
    alert("Game over. Score: " + (counter - 1));
    character.style.top = "100px";
    counter = 0;
  }
}, 10);

function jump() {
  if (jumping) return;
  jumping = true;

  let jumpCount = 0;
  const jumpInterval = setInterval(() => {
    const charTop = parseInt(getComputedStyle(character).top);

    if (charTop > 6 && jumpCount < 15) {
      character.style.top = (charTop - 5) + "px";
    }

    if (++jumpCount > 20) {
      clearInterval(jumpInterval);
      jumping = false;
    }
  }, 10);
}
