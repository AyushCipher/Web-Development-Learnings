const cards = document.querySelectorAll('.card');
const randomBtn = document.getElementById('randomBtn');
const dots = document.querySelectorAll('.dot');
let index = 0;

function showSlide(i) {
  cards.forEach(card => card.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active-dot'));

  cards[i].classList.add('active');
  dots[i].classList.add('active-dot');
  index = i;
}

function autoSlide() {
  index = (index + 1) % cards.length;
  showSlide(index);
}

setInterval(autoSlide, 5000);

randomBtn.addEventListener('click', () => {
  const randomIndex = Math.floor(Math.random() * cards.length);
  showSlide(randomIndex);
});

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const i = parseInt(dot.getAttribute('data-index'));
    showSlide(i);
  });
});
