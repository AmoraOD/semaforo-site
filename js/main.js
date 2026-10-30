import Quiz from './games/quiz.js';

window.pageInit = {
    quiz: () => Quiz.Start()
};

document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
});