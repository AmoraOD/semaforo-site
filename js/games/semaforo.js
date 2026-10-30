window.addEventListener('load', () => {
    Semaforo.Start();
});

class Semaforo {
    static tokens = [];
    static draggedElement   = null;
    static draggedPointerId  = null;
    static ghostElement   = null;
    static offsetX = 0; static offsetY = 0;
    static hits = 0; static misses = 0;

    static pointerX = 0;
    static pointerY = 0;
    static scrollRAF = null;

    static SCROLL_MAX_PX  = 16;   // velocidade máx por frame
    static SCROLL_EDGE_TOP = 80;   // distância da borda que ativa o scroll
    static SCROLL_EDGE_BOTTOM = 500; // px rodapé

    static activeBody = 'boy';
    static autoScrollEnabled = false;

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
        document.getElementById('change-boy') ?.addEventListener('click', () => this.changeBody('boy'));
        document.getElementById('change-girl')?.addEventListener('click', () => this.changeBody('girl'));
    }

    static changeBody(gender) {
        if (this.activeBody === gender) return;
        this.activeBody = gender;

        const boyContainer  = document.getElementById('body-container-boy');
        const girlContainer = document.getElementById('body-container-girl');

        if (gender === 'boy') {
            boyContainer.style.display = 'block';
            girlContainer.style.display = 'none';
        } else {
            boyContainer.style.display = 'none';
            girlContainer.style.display = 'block';
        }

        this.resetGame();
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

    static getViewrInfo(){
        const vv = window.visualViewport;

        if (vv && typeof vv.height === 'number') {
            return { top: vv.offsetTop || 0, height: vv.height };
        }
        return {
            top: 0,
            height: document.documentElement.clientHeight || window.innerHeight
        };
    }

    // ============================ DRAG ============================

    static onPointerDown(e, token) {
        if (this.draggedElement) return;

        e.preventDefault();

        this.autoScrollEnabled = this.shouldEnableAutoScroll(e);

        this.draggedElement   = token;
        this.draggedPointerId = e.pointerId;
        this.pointerX = e.clientX;
        this.pointerY = e.clientY;

        try { token.setPointerCapture(e.pointerId); } catch (_) {}

        this.ghostElement = token.cloneNode(true);
        this.ghostElement.classList.add('ghost-token');
        document.body.appendChild(this.ghostElement);

        const rect = token.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;

        this.moveGhost(e.clientX, e.clientY);

        this.boundOnPointerMove   = this.onPointerMove.bind(this);
        this.boundOnPointerUp     = this.onPointerUp.bind(this);
        this.boundOnPointerCancel = this.onPointerCancel.bind(this);

        document.addEventListener('pointermove',   this.boundOnPointerMove);
        document.addEventListener('pointerup',     this.boundOnPointerUp);
        document.addEventListener('pointercancel', this.boundOnPointerCancel);

        token.style.opacity = '0.3';
    }

    static onPointerMove(e) {
        if (e.pointerId !== this.draggedPointerId) return;
        if (!this.ghostElement) return;

        this.pointerX = e.clientX;
        this.pointerY = e.clientY;
        this.moveGhost(e.clientX, e.clientY);

        if (this.autoScrollEnabled && !this.scrollRAF) {
            this.startAutoScroll();
        }
    }

    static onPointerCancel(e) {
        if (e.pointerId !== this.draggedPointerId) return;
        this.stopAutoScroll();
        this.cleanUp();
    }

    static moveGhost(x, y) {
        if (!this.ghostElement) return;
        this.ghostElement.style.left = `${x - this.offsetX}px`;
        this.ghostElement.style.top  = `${y - this.offsetY}px`;
    }

    static onPointerUp(e) {
        if (e.pointerId !== this.draggedPointerId) return;
        if (!this.ghostElement) return;

        this.ghostElement.style.display = 'none';

        const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY);
        const dropZone = elementUnderPointer
            ? elementUnderPointer.closest('.drop-zone') : null;

        if (dropZone && !dropZone.classList.contains('filled')) {
            this.handleDrop(dropZone);
        }

        this.stopAutoScroll();
        this.cleanUp();
    }

    static startAutoScroll() {
        if (this.scrollRAF) return;

        const edgeTop    = this.SCROLL_EDGE_TOP;
        const edgeBottom = this.SCROLL_EDGE_BOTTOM;
        const vmax       = this.SCROLL_MAX_PX;

        const tick = () => {
            if (!this.draggedElement) { this.scrollRAF = null; return; }

            const { top, height } = this.getViewrInfo();
            const bottom = top + height;
            const y = this.pointerY;
            // const vh = window.innerHeight;
            // const y  = this.pointerY;

            let dy = 0;
            if (y < top + edgeTop) {
                dy = -vmax * (1 - y + top / edgeTop);
            } else if (y > bottom - edgeBottom) {
                dy = vmax * ((y - (bottom - edgeBottom)) / edgeBottom);
            }

            if (dy !== 0) window.scrollBy(0, dy);

            this.scrollRAF = requestAnimationFrame(tick);
        };

        this.scrollRAF = requestAnimationFrame(tick);
    }

    static stopAutoScroll() {
        if (this.scrollRAF) {
            cancelAnimationFrame(this.scrollRAF);
            this.scrollRAF = null;
        }
    }

    static shouldEnableAutoScroll(e) {
        // Mouse: sempre deixa o scroll nativo do navegador
        if (e.pointerType === 'mouse') return false;

        return window.matchMedia('(max-width: 1024px), (max-height: 600px)').matches;
    }

    static handleDrop(dropZone) {
        const chosen  = this.draggedElement.dataset.color;
        const correct = dropZone.dataset.correct;
        const acertou = chosen === correct;

        if (acertou) {
            dropZone.classList.add('filled', 'is-correct');
            dropZone.classList.remove('is-wrong');

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
            this.showFeedback(`Ops! Aqui é outra cor.`, 'bad');

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
        const activeContainer = document.getElementById(`body-container-${this.activeBody}`);

        const total = activeContainer.querySelectorAll('.drop-zone').length;

        if (this.hits === total && this.feedbackEl) {
            this.feedbackEl.textContent = `Parabéns! 🎉 Você acertou ${total} pontos.`;
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

            try { this.draggedElement.releasePointerCapture(this.draggedPointerId); } catch (_) {}

            this.draggedElement = null;
        }

        this.draggedPointerId = null;

        document.removeEventListener('pointermove', this.boundOnPointerMove);
        document.removeEventListener('pointerup', this.boundOnPointerUp);
        document.removeEventListener('pointercancel', this.boundOnPointerCancel);
    }
}

export default Semaforo;