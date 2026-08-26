const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const settings = document.querySelector('.settings');
const quiz = document.querySelector('.quiz');
const result = document.querySelector('.result');
const questionEl = document.getElementById('question');
const answerButtons = document.getElementById('answer-buttons');
const timerEl = document.getElementById('time');
const scoreEl = document.getElementById('score');
const progress = document.getElementById('progress');

let questions = [], currentQuestion = 0, score = 0, timer, timeLeft = 15;


// {
//   "response_code": 0,
//   "results": [
//     {
//       "category": "Science & Nature",
//       "type": "multiple",
//       "difficulty": "medium",
//       "question": "What is the chemical symbol for gold?",
//       "correct_answer": "Au",
//       "incorrect_answers": ["Ag", "Gd", "Ga"]
//     },
//     {
//       "category": "Entertainment: Music",
//       "type": "multiple",
//       "difficulty": "easy",
//       "question": "Which singer is known as the 'Queen of Pop'?",
//       "correct_answer": "Madonna",
//       "incorrect_answers": ["Lady Gaga", "Katy Perry", "Adele"]
//     }
//   ]
// }



startBtn.onclick = async () => {
  const category = document.getElementById('category').value;
  const difficulty = document.getElementById('difficulty').value;
  const url = `https://opentdb.com/api.php?amount=5&category=${category}&difficulty=${difficulty}&type=multiple`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    questions = data.results.map(q => {
      const answers = [...q.incorrect_answers];                                 // Copies incorrect answers.
      const correctPos = Math.floor(Math.random() * 4);                         // Arranges position of correct answer randomly.
      answers.splice(correctPos, 0, q.correct_answer);                          // Inserts the correct answer into a random position in the answers array.

      return { question: q.question, answers, correct: q.correct_answer };
    });

    score = 0;
    currentQuestion = 0;
    settings.style.display = 'none';
    quiz.style.display = 'block';
    showQuestion();
  } catch (err) {
    alert("Failed to load questions. Try again.");
  }
};

nextBtn.onclick = () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
};

restartBtn.onclick = () => {
  result.style.display = 'none';
  settings.style.display = 'block';
};


function showQuestion() {
  resetState();                                         // Clear the previous question's answers, styles, and hide the "Next" button

  const q = questions[currentQuestion];                 // Get the current question object from the list
  questionEl.innerHTML = q.question;                    // Display the question text in the question container
  q.answers.forEach(ans => {                            // Loop through each answer option
    const btn = document.createElement('button');       // Create a new button for each answer
    btn.textContent = ans;                              // Set the button text to the answer text
    btn.onclick = () => selectAnswer(ans, q.correct);   // Set click handler to check the selected answer
    answerButtons.appendChild(btn);                     // Add the button to the answer buttons container
  });

  startTimer();                                         // Start the countdown timer for the question
  updateProgressBar();                                  // Update the progress bar to reflect how far along the quiz is
}



function selectAnswer(selected, correct) {
  clearInterval(timer);                                 // Stop the question timer

  // Disable all answer buttons and color them based on correctness
  for (let btn of answerButtons.children) {
    btn.disabled = true;

    if (btn.textContent === correct) {
      btn.style.backgroundColor = '#76c7c0';            // Highlight correct answer
    } else if (btn.textContent === selected) {
      btn.style.backgroundColor = '#ff4d4d';            // Highlight selected wrong answer
    }
  }

  // Increase score if selected answer is correct
  if (selected === correct) {
    score++;
  }
  // Show the "Next" button
  nextBtn.style.display = 'block';
}


function startTimer() {
  timeLeft = 15;
  timerEl.textContent = timeLeft;
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft === 0) {
      clearInterval(timer);
      nextBtn.style.display = 'block';
      for (let btn of answerButtons.children) {
        btn.disabled = true;
        if (btn.textContent === questions[currentQuestion].correct) {
          btn.style.backgroundColor = '#76c7c0';
        }
      }
    }
  }, 1000); // 1000 ms = 1 second
}

function resetState() {
  clearInterval(timer);
  nextBtn.style.display = 'none';
  answerButtons.innerHTML = '';
}

function updateProgressBar() {
  progress.style.width = `${(currentQuestion / questions.length) * 100}%`;
}

function showResult() {
  quiz.style.display = 'none';
  result.style.display = 'block';
  scoreEl.textContent = `${score} / ${questions.length}`;
}
