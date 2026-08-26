import React, { useState, useEffect } from 'react';
import './QuizApp.css';

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('9');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    let interval;
    if (quizStarted && !isAnswered && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeout();
    }
    return () => clearInterval(interval);
  }, [quizStarted, timeLeft, isAnswered]);

  const startQuiz = () => {
    fetch(`https://opentdb.com/api.php?amount=10&category=${selectedCategory}&difficulty=${selectedDifficulty}&type=multiple`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.results.map(q => {
          const answers = [...q.incorrect_answers];
          const correctIndex = Math.floor(Math.random() * 4);
          answers.splice(correctIndex, 0, q.correct_answer);
          return {
            question: q.question,
            answers,
            correct: q.correct_answer
          };
        });
        setQuestions(formatted);
        setQuizStarted(true);
        setQuizEnded(false);
        setScore(0);
        setCurrentQuestionIndex(0);
        setTimeLeft(15);
        setIsAnswered(false);
      });
  };

  const handleAnswer = (answer) => {
    if (isAnswered) return;
    setIsAnswered(true);
    const correct = questions[currentQuestionIndex].correct;
    if (answer === correct) setScore(prev => prev + 1);

    const buttons = document.querySelectorAll('#answer-buttons button');
    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.innerHTML === correct) {
        btn.style.backgroundColor = '#76c7c0';
      } else if (btn.innerHTML === answer) {
        btn.style.backgroundColor = '#ff4d4d';
      }
    });
  };

  const handleTimeout = () => {
    setIsAnswered(true);
    const correct = questions[currentQuestionIndex].correct;
    const buttons = document.querySelectorAll('#answer-buttons button');
    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.innerHTML === correct) {
        btn.style.backgroundColor = '#76c7c0';
      }
    });
  };

  const nextQuestion = () => {
    if (!isAnswered) return;
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(15);
      setIsAnswered(false);
      resetButtons();
    } else {
      setQuizEnded(true);
      setQuizStarted(false);
    }
  };

  const resetButtons = () => {
    const buttons = document.querySelectorAll('#answer-buttons button');
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.style.backgroundColor = '#ffffff';
    });
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizEnded(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(15);
    setIsAnswered(false);
  };

  return (
    <div className="quiz-container">
      {!quizStarted && !quizEnded && (
        <div className="settings">
          <h2><span>Select Quiz Settings</span></h2>
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select id="category" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="9">General Knowledge</option>
              <option value="21">Sports</option>
              <option value="23">History</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty:</label>
            <select id="difficulty" value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <button onClick={startQuiz}>Start Quiz</button>
        </div>
      )}

      {quizStarted && !quizEnded && (
        <div className="quiz">
          <div className="quiz-header">
            <div id="progress-bar">
              <div id="progress" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
            </div>
            <div id="timer">Time Left: <span>{timeLeft}</span>s</div>
          </div>

          <div id="question-container">
            <h3 dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex].question }}></h3>
            <ul id="answer-buttons">
              {questions[currentQuestionIndex]?.answers.map((ans, idx) => (
                <li key={idx}>
                  <button onClick={() => handleAnswer(ans)} dangerouslySetInnerHTML={{ __html: ans }}></button>
                </li>
              ))}
            </ul>
          </div>

          <button onClick={nextQuestion} disabled={!isAnswered}>Next</button>
        </div>
      )}

      {quizEnded && (
        <div className="result">
          <h2><span>You scored {score} / {questions.length}</span></h2>
          <button onClick={restartQuiz}>Restart Quiz</button>
        </div>
      )}
    </div>
  );
};

export default QuizApp;
