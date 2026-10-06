const QUESTIONS = [
  { pergunta: "Um amigo estende a mão para um toca-aqui e você quer.", resposta: "verde",
    explicacao: "Um toque combinado e que você aceita é seguro." },
  { pergunta: "Você está triste e pede um abraço para a sua mãe.", resposta: "verde",
    explicacao: "Um abraço que você pede e quer é um toque carinhoso e seguro." },
  { pergunta: "Sua tia faz um carinho na sua cabeça e você gosta.", resposta: "verde",
    explicacao: "Carinhos que você gosta e aceita são seguros. Se não gostar, pode dizer." },
  { pergunta: "Seu avô quer um abraço, mas você não está com vontade.", resposta: "amarelo",
    explicacao: "Atenção: você pode dizer não, mesmo a quem você ama. Pode oferecer um aceno ou um aperto de mão." },
  { pergunta: "Você está numa consulta e o médico precisa examinar você, com seu responsável presente.", resposta: "amarelo",
    explicacao: "Cuidados de saúde pedem atenção: o responsável fica junto e o médico explica antes. Você pode perguntar." },
  { pergunta: "Um toque de alguém deixou você com uma sensação estranha, mas você não sabe explicar.", resposta: "amarelo",
    explicacao: "Confie no que sente. Converse com um adulto de confiança, mesmo sem saber explicar direito." },
  { pergunta: "Alguém pede para ver ou tocar as partes do seu corpo cobertas pela roupa de baixo.", resposta: "vermelho",
    explicacao: "Isso não pode. Diga NÃO, saia de perto e conte a um adulto de confiança." },
  { pergunta: "Um adulto pede que você guarde segredo sobre um toque que te deixou mal.", resposta: "vermelho",
    explicacao: "Segredos sobre toques não devem ser guardados. Contar não é fazer fofoca, é se proteger." },
  { pergunta: "Alguém na internet pede uma foto sua sem roupa.", resposta: "vermelho",
    explicacao: "Nunca envie. Não responda, mostre a conversa a um adulto de confiança e peça ajuda." },
  { pergunta: "Um colega propõe uma brincadeira em que todos mostram as partes íntimas.", resposta: "vermelho",
    explicacao: "Essa brincadeira não é segura. Diga que não quer e conte a um adulto de confiança." }
];

const POINTS_PER_HIT = 10;
const NAMES = { vermelho: "Vermelho", amarelo: "Amarelo", verde: "Verde" };

const $ = (id) => document.getElementById(id);
const screens = { start: $('screen-start'), play: $('screen-play'), result: $('screen-result') };
const choiceBtns = document.querySelectorAll('.choice');
let game = { questions: [], current: 0, score: 0, hits: 0, misses: 0, answered: false, playing: false };


function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => { el.hidden = key !== name; });
}

function startGame() {
  game = { questions: shuffle(QUESTIONS), current: 0, score: 0, hits: 0, misses: 0, answered: false, playing: true };
  showScreen('play');
  renderQuestion();
}

function renderQuestion() {
  const total = game.questions.length;
  game.answered = false;
  $('question-text').textContent = game.questions[game.current].pergunta;
  $('feedback').className = 'feedback';
  $('feedback').innerHTML = '';
  $('btn-next').hidden = true;
  $('mini-light').dataset.lit = 'none';
  choiceBtns.forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove('is-correct', 'is-wrong');
    btn.querySelector('.tag').textContent = '';
  });
  $('progress-label').textContent = `Pergunta ${game.current + 1} de ${total}`;
  updateScoreboard();
  $('question-text').focus({ preventScroll: true });
}

function handleAnswer(chosen) {
  if (game.answered) return; 
  game.answered = true;
  const q = game.questions[game.current];
  const correct = chosen === q.resposta;

  if (correct) { game.hits++; game.score += POINTS_PER_HIT; } else { game.misses++; }

  choiceBtns.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.color === q.resposta) {
      btn.classList.add('is-correct');
      btn.querySelector('.tag').textContent = '✓ Resposta certa';
    } else if (btn.dataset.color === chosen) {
      btn.classList.add('is-wrong');
      btn.querySelector('.tag').textContent = '✗ Sua escolha';
    }
  });

  const fb = $('feedback');
  fb.className = `feedback ${correct ? 'ok' : 'bad'}`;
  fb.innerHTML = correct
    ? `<strong>Correto! +${POINTS_PER_HIT} pontos.</strong> ${q.explicacao}`
    : `<strong>Não foi dessa vez.</strong> A resposta certa era ${NAMES[q.resposta]}. ${q.explicacao}`;

  $('mini-light').dataset.lit = q.resposta; // acende a luz correta
  updateScoreboard();

  const isLast = game.current === game.questions.length - 1;
  $('btn-next').textContent = isLast ? 'Ver resultado' : 'Próxima pergunta';
  $('btn-next').hidden = false;
  $('btn-next').focus({ preventScroll: true });
}

function nextQuestion() {
  game.current++;
  if (game.current >= game.questions.length) showResult(); else renderQuestion();
}

function updateScoreboard() {
  const total = QUESTIONS.length;
  const answeredCount = game.current + (game.answered ? 1 : 0);
  $('stat-score').textContent = game.score;
  $('stat-hits').textContent = game.hits;
  $('stat-misses').textContent = game.misses;
  $('stat-question').textContent = `${game.playing ? game.current + 1 : 0}/${total}`;
  $('progress-fill').style.width = `${(answeredCount / total) * 100}%`;
  $('progress').setAttribute('aria-valuenow', answeredCount);
}

function showResult() {
  const total = game.questions.length;
  const percent = Math.round((game.hits / total) * 100);
  game.playing = false;
  $('result-score').textContent = game.score;
  $('result-hits').textContent = game.hits;
  $('result-misses').textContent = game.misses;
  $('result-percent').textContent = `${percent}%`;

  let msg;
  if (percent >= 90) msg = "Excelente! Você reconhece muito bem os toques seguros e os que não são.";
  else if (percent >= 60) msg = "Muito bem! Leia de novo as explicações e jogue mais uma vez.";
  else msg = "Vamos praticar mais! Jogue de novo, de preferência com um adulto de confiança.";
  $('result-message').textContent = `${msg} Lembre-se: se um toque deixar você mal, conte a um adulto de confiança.`;

  showScreen('result');
  $('mini-light').dataset.lit = 'none';
  $('progress-fill').style.width = '100%';
  $('result-title').focus({ preventScroll: true });
}

choiceBtns.forEach((btn) => btn.addEventListener('click', () => handleAnswer(btn.dataset.color)));
$('btn-next').addEventListener('click', nextQuestion);
$('btn-start').addEventListener('click', startGame);
$('btn-restart').addEventListener('click', startGame);

$('btn-comecar').addEventListener('click', () => { if (!game.playing) startGame(); });

// const menuBtn = document.querySelector('.menu-toggle');
// const menu = $('menu');
// menuBtn.addEventListener('click', () => {
//   const open = menu.classList.toggle('open');
//   menuBtn.setAttribute('aria-expanded', open);
// });
// menu.addEventListener('click', (e) => {
//   if (e.target.tagName === 'A') { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); }
// });

$('year').textContent = new Date().getFullYear();
updateScoreboard();
