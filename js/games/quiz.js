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

class Quiz {
    static game = {
        questions: [], current: 0, score: 0, hits: 0, misses: 0,
        answered: false, playing: false
    };
    static screens = {};
    static choiceBtns = [];

    static Start() {
        const start  = document.getElementById('screen-start');
        const play   = document.getElementById('screen-play');
        const result = document.getElementById('screen-result');

        if (!start || !play || !result) {
            console.warn("Quiz.Start: elementos do jogo não encontrados no DOM.");
            return;
        }

        this.screens    = { start, play, result };
        this.choiceBtns = document.querySelectorAll('.choice');

        this.bindEvents();

        this.game = {
            questions: QUESTIONS, current: 0, score: 0, hits: 0, misses: 0,
            answered: false, playing: false
        };
        this.updateScoreboard();
    }

    static bindEvents() {
        this.choiceBtns.forEach((btn) => {
            if (btn.dataset.quizBound) return;
            btn.dataset.quizBound = 'true';
            btn.addEventListener('click', () => this.handleAnswer(btn.dataset.color));
        });

        const bind = (id, handler) => {
            const el = document.getElementById(id);
            if (!el || el.dataset.quizBound) return;
            el.dataset.quizBound = 'true';
            el.addEventListener('click', handler);
        };
        bind('btn-next',    () => this.nextQuestion());
        bind('btn-start',   () => this.startGame());
        bind('btn-restart', () => this.startGame());
    }

    static showScreen(name) {
        Object.entries(this.screens).forEach(([key, el]) => { el.hidden = key !== name; });
    }

    static shuffle(list) {
        const a = [...list];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    static updateScoreboard() {
        const total = QUESTIONS.length;
        const answeredCount = this.game.current + (this.game.answered ? 1 : 0);
        document.getElementById('stat-score').textContent    = this.game.score;
        document.getElementById('stat-hits').textContent     = this.game.hits;
        document.getElementById('stat-misses').textContent   = this.game.misses;
        document.getElementById('stat-question').textContent = `${this.game.playing ? this.game.current + 1 : 0}/${total}`;
        document.getElementById('progress-fill').style.width = `${(answeredCount / total) * 100}%`;
        document.getElementById('progress').setAttribute('aria-valuenow', answeredCount);
    }

    static renderQuestion() {
        const total = this.game.questions.length;
        this.game.answered = false;

        document.getElementById('question-text').textContent = this.game.questions[this.game.current].pergunta;
        const fb = document.getElementById('feedback');
        fb.className = 'feedback';
        fb.innerHTML = '';
        document.getElementById('btn-next').hidden = true;
        document.getElementById('mini-light').dataset.lit = 'none';

        this.choiceBtns.forEach((btn) => {
            btn.disabled = false;
            btn.classList.remove('is-correct', 'is-wrong');
            btn.querySelector('.tag').textContent = '';
        });

        document.getElementById('progress-label').textContent = `Pergunta ${this.game.current + 1} de ${total}`;
        this.updateScoreboard();
        document.getElementById('question-text').focus({ preventScroll: true });
    }

    static startGame() {
        this.game = {
            questions: this.shuffle(QUESTIONS), current: 0,
            score: 0, hits: 0, misses: 0, answered: false, playing: true
        };
        this.showScreen('play');
        this.renderQuestion();
    }

    static handleAnswer(chosen) {
        if (this.game.answered) return;
        this.game.answered = true;

        const q = this.game.questions[this.game.current];
        const correct = chosen === q.resposta;

        if (correct) { this.game.hits++; this.game.score += POINTS_PER_HIT; }
        else         { this.game.misses++; }

        this.choiceBtns.forEach((btn) => {
            btn.disabled = true;
            if (btn.dataset.color === q.resposta) {
                btn.classList.add('is-correct');
                btn.querySelector('.tag').textContent = '✓ Resposta certa';
            } else if (btn.dataset.color === chosen) {
                btn.classList.add('is-wrong');
                btn.querySelector('.tag').textContent = '✗ Sua escolha';
            }
        });

        const fb = document.getElementById('feedback');
        fb.className = `feedback ${correct ? 'ok' : 'bad'}`;
        fb.innerHTML = correct
            ? `<strong>Correto! +${POINTS_PER_HIT} pontos.</strong> ${q.explicacao}`
            : `<strong>Não foi dessa vez.</strong> A resposta certa era ${NAMES[q.resposta]}. ${q.explicacao}`;

        document.getElementById('mini-light').dataset.lit = q.resposta;
        this.updateScoreboard();

        const isLast = this.game.current === this.game.questions.length - 1;
        const btnNext = document.getElementById('btn-next');
        btnNext.textContent = isLast ? 'Ver resultado' : 'Próxima pergunta';
        btnNext.hidden = false;
        btnNext.focus({ preventScroll: true });
    }

    static nextQuestion() {
        this.game.current++;
        if (this.game.current >= this.game.questions.length) this.showResult();
        else this.renderQuestion();
    }

    static showResult() {
        const total = this.game.questions.length;
        const percent = Math.round((this.game.hits / total) * 100);
        this.game.playing = false;

        document.getElementById('result-score').textContent   = this.game.score;
        document.getElementById('result-hits').textContent    = this.game.hits;
        document.getElementById('result-misses').textContent  = this.game.misses;
        document.getElementById('result-percent').textContent = `${percent}%`;

        let msg;
        if (percent >= 90) msg = "Excelente! Você reconhece muito bem os toques seguros e os que não são.";
        else if (percent >= 60) msg = "Muito bem! Leia de novo as explicações e jogue mais uma vez.";
        else msg = "Vamos praticar mais! Jogue de novo, de preferência com um adulto de confiança.";

        document.getElementById('result-message').textContent =
            `${msg} Lembre-se: se um toque deixar você mal, conte a um adulto de confiança.`;

        this.showScreen('result');
        document.getElementById('mini-light').dataset.lit = 'none';
        document.getElementById('progress-fill').style.width = '100%';
        document.getElementById('result-title').focus({ preventScroll: true });
    }
}

export default Quiz;