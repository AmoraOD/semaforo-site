window.addEventListener('load', () => {
    Semaforo.Start();
});

class Semaforo {
    static tokens = [];
    static draggedElement = null;
    static ghostElement   = null;
    static offsetX = 0; static offsetY = 0;
    static hits = 0; static misses = 0;

    static activeBody = 'boy';
    static boyBtn     = null;
    static girlBtn    = null;
    static girlContainer = null;
    static boyContainer  = null;

    static Start() {
        this.tokens = document.querySelectorAll('#btn-pallete .token');

        this.hitsEl     = document.getElementById('sf-hits');
        this.missesEl   = document.getElementById('sf-misses');
        this.feedbackEl = document.getElementById('sf-feedback');
        this.resetBtn   = document.getElementById('btn-reset');

        this.resetGame();
        this.initEvents();
    }

    static initEvents() {
        this.tokens.forEach(token => {
            token.addEventListener('pointerdown', (e) => this.onPointerDown(e, token));
        });

        this.resetBtn?.addEventListener('click', () => this.resetGame());
    }

    static changeBody() {
        const boyBtn = document.getElementById('change-boy');
        const girlBtn = document.getElementById('change-girl');

        const boyContainer = document.getElementById('body-container-boy');
        const girlContainer = document.getElementById('body-container-girl');
    }

    static resetGame() {
        this.hits = 0; this.misses = 0;

        if (this.hitsEl)     this.hitsEl.textContent = '0';
        if (this.missesEl)   this.missesEl.textContent = '0';
        if (this.feedbackEl) this.feedbackEl.textContent = '';

        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('filled', 'is-correct', 'is-wrong');
            zone.querySelectorAll('.token').forEach(t => t.remove());
            zone.disabled = false;
        });
    }

    static onPointerDown(e, token) {
        e.preventDefault();

        this.draggedElement = token;

        this.ghostElement = token.cloneNode(true);
        this.ghostElement.classList.add('ghost-token');
        document.body.appendChild(this.ghostElement);

        const rect = token.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;

        this.moveGhost(e.clientX, e.clientY);

        this.boundOnPointerMove = this.onPointerMove.bind(this);
        this.boundOnPointerUp   = this.onPointerUp.bind(this);

        document.addEventListener('pointermove', this.boundOnPointerMove);
        document.addEventListener('pointerup', this.boundOnPointerUp);

        token.style.opacity = '0.3';
    }

    static onPointerMove(e) {
        if (!this.ghostElement) return;
        this.moveGhost(e.clientX, e.clientY);
    }

    static moveGhost(x, y) {
        this.ghostElement.style.left = `${x - this.offsetX}px`;
        this.ghostElement.style.top  = `${y - this.offsetY}px`;
    }

    static onPointerUp(e) {
        if (!this.ghostElement) return;

        this.ghostElement.style.display = 'none';

        const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
        const dropZone = elementUnderPointer
            ? elementUnderPointer.closest('.drop-zone') : null;

        if (dropZone && !dropZone.classList.contains('filled')) {
            this.handleDrop(dropZone);
        }

        this.cleanUp();
    }

    static handleDrop(dropZone) {
        const chosen  = this.draggedElement.dataset.color;
        const correct = dropZone.dataset.correct;
        const acertou = chosen === correct;

        if (acertou) {
            dropZone.classList.add('filled', 'is-correct');
            dropZone.classList.remove('is-wrong');

            // Coloca o token dentro da zona
            const placedToken = document.createElement('div');
            placedToken.className = `token ${chosen}`;
            placedToken.dataset.color = chosen;
            placedToken.setAttribute('aria-hidden', 'true');

            dropZone.appendChild(placedToken);

            this.hits++;
            this.hitsEl.textContent = this.hits;
            this.showFeedback(`Boa! ${this.label(chosen)} está certo aqui.`, 'ok');

            this.checkEnd();
        } else {
            dropZone.classList.add('is-wrong');

            this.misses++;
            this.missesEl.textContent = this.misses;
            this.showFeedback(
                `Ops! Aqui é outra cor.`,
                'bad'
            );

            setTimeout(() => dropZone.classList.remove('is-wrong'), 800);
        }
    }

    static label(color) {
        return { vermelho: 'Vermelho', amarelo: 'Amarelo', verde: 'Verde' }[color] || color;
    }

    static showFeedback(msg, type) {
        if (!this.feedbackEl) return;
        this.feedbackEl.textContent = msg;
        this.feedbackEl.dataset.state = type;
    }

    static checkEnd() {
        const total = document.querySelectorAll('.drop-zone').length;

        if (this.hits === total && this.feedbackEl) {
            this.feedbackEl.textContent =
                `Parabéns! 🎉 Você acertou ${total} pontos.`;
            this.feedbackEl.dataset.state = 'ok';
        }
    }

    static cleanUp() {
        if (this.ghostElement) {
            this.ghostElement.remove();
            this.ghostElement = null;
        }

        if (this.draggedElement) {
            this.draggedElement.style.opacity = '1';
            this.draggedElement = null;
        }

        document.removeEventListener('pointermove', this.boundOnPointerMove);
        document.removeEventListener('pointerup', this.boundOnPointerUp);
    }
}

export default Semaforo;