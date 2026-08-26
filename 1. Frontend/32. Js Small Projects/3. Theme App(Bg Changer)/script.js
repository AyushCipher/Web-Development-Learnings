const colors = [
  "#f87171", // red
  "#60a5fa", // blue
  "#34d399", // green
  "#fbbf24", // yellow
  "#c084fc", // purple
  "#f472b6", // pink
  "#2dd4bf", // teal
];

let index = 0;
const button = document.getElementById("changeColorBtn");

button.addEventListener("click", () => {
  document.body.style.backgroundColor = colors[index];
  index = (index + 1) % colors.length;
});
