window.addEventListener('load', () => {
    Semaforo.Start();
});

class Semaforo{
    static Start() {
        this.tokens = document.querySelectorAll('#btn-pallete .token');
        this.draggedElement = null;
        this.ghostElement   = null;
        this.offsetX = 0;
        this.offsetY = 0;

        this.initEvents();
    }

    static async initEvents() {
        this.tokens.forEach(token => {
            token.addEventListener('pointerdown', (e) => this.onPointerDown(e, token));
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

    static moveGhost(x, y){
        this.ghostElement.style.left = `${x - this.offsetX}px`;
        this.ghostElement.style.top  = `${y - this.offsetY}px`;
    }

    static onPointerUp(e) {
        if (!this.ghostElement) return;

        this.ghostElement.style.display = 'none';

        const elementUnderPointer = document.elementFromPoint(e.clientX, e.clientY);

        const dropZone = elementUnderPointer ? elementUnderPointer.closest('.drop-zone') : null;

        if (dropZone && !dropZone.classList.contains('filled')) {
            this.handleDrop(dropZone);
        }

        this.cleanUp();
    }

    static handleDrop(dropZone) {
        dropZone.classList.add('filled');

        const color = this.draggedElement.dataset.color;

        const placedToken = document.createElement('div');
        placedToken.className = `token ${color}`;
        placedToken.dataset.color = color;

        dropZone.appendChild(placedToken);
    }

    static cleanUp() {
        if (this.ghostElement) {
            this.ghostElement.remove();
            this.ghostElement = null;
        }

        if (this.draggedElement) {
            this.draggedElement.style.opacity = `1`;
            this.draggedElement = null;
        }

        document.removeEventListener('pointermove', this.boundOnPointerMove);
        document.removeEventListener('pointerup', this.boundOnPointerUp);
    }
}

export default Semaforo;