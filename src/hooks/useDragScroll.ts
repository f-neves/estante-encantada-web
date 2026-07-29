import { useCallback, useRef } from 'react';

// Arrastar com o mouse para rolar, como num aparelho de toque. Sem isto, no
// desktop as faixas horizontais só rolam com shift + roda, o que ninguém
// descobre, e a moldura do modo app não responde ao gesto que a pessoa espera
// de um aplicativo.
//
// Cuidados:
// - só começa a rolar depois de uns pixels de movimento, então clicar e soltar
//   continua sendo clique;
// - quando vira arrasto de verdade, o clique seguinte é engolido, senão soltar
//   o dedo em cima de um livro abriria o livro;
// - campos de texto, controles deslizantes e o que estiver marcado com
//   `data-no-drag` ficam de fora;
// - gesto que nasce numa faixa horizontal pertence a ela, e não à moldura.

const LIMIAR = 6;
const IGNORAR = 'input, textarea, select, [contenteditable="true"], [role="slider"], [data-no-drag]';
const FAIXA_X = '[data-drag-x]';

type Axis = 'x' | 'y' | 'both';

function ligar(el: HTMLElement, axis: Axis): () => void {
  if (axis === 'x' || axis === 'both') {
    el.dataset['dragX'] = '';
  }

  let arrastando = false;
  let moveu = false;
  let inicioX = 0;
  let inicioY = 0;
  let scrollX = 0;
  let scrollY = 0;
  let ponteiro = -1;

  function onPointerDown(e: PointerEvent) {
    // Só o mouse: no toque o navegador já rola sozinho, e melhor.
    if (e.pointerType !== 'mouse' || e.button !== 0) {
      return;
    }
    const alvo = e.target as HTMLElement | null;
    if (alvo?.closest(IGNORAR)) {
      return;
    }
    if (axis === 'y' && alvo?.closest(FAIXA_X)) {
      return;
    }
    arrastando = true;
    moveu = false;
    ponteiro = e.pointerId;
    inicioX = e.clientX;
    inicioY = e.clientY;
    scrollX = el.scrollLeft;
    scrollY = el.scrollTop;
  }

  function onPointerMove(e: PointerEvent) {
    if (!arrastando || e.pointerId !== ponteiro) {
      return;
    }
    const dx = e.clientX - inicioX;
    const dy = e.clientY - inicioY;

    if (!moveu && Math.hypot(dx, dy) < LIMIAR) {
      return;
    }
    if (!moveu) {
      moveu = true;
      el.setPointerCapture(ponteiro);
      el.style.cursor = 'grabbing';
      el.style.userSelect = 'none';
    }

    if (axis === 'x' || axis === 'both') {
      el.scrollLeft = scrollX - dx;
    }
    if (axis === 'y' || axis === 'both') {
      el.scrollTop = scrollY - dy;
    }
    e.preventDefault();
  }

  function terminar(e: PointerEvent) {
    if (!arrastando || e.pointerId !== ponteiro) {
      return;
    }
    arrastando = false;
    ponteiro = -1;
    el.style.cursor = '';
    el.style.userSelect = '';
    if (moveu) {
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
      // Engole o clique que viria logo depois do arrasto.
      const engolir = (evt: Event) => {
        evt.stopPropagation();
        evt.preventDefault();
      };
      el.addEventListener('click', engolir, { capture: true, once: true });
      window.setTimeout(() => el.removeEventListener('click', engolir, { capture: true }), 60);
    }
    moveu = false;
  }

  function semArrastarImagem(e: DragEvent) {
    e.preventDefault();
  }

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', terminar);
  el.addEventListener('pointercancel', terminar);
  el.addEventListener('dragstart', semArrastarImagem);

  return () => {
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', terminar);
    el.removeEventListener('pointercancel', terminar);
    el.removeEventListener('dragstart', semArrastarImagem);
    delete el.dataset['dragX'];
  };
}

interface Options {
  /** 'x' para faixas horizontais, 'y' para a moldura, 'both' para os dois. */
  axis?: Axis;
  enabled?: boolean;
}

/**
 * Devolve um `ref` de função. É de propósito: o elemento pode só aparecer
 * depois (a faixa de temas nasce quando os livros carregam), e um ref de
 * função avisa na hora em que ele entra e sai da tela.
 */
export function useDragScroll({ axis = 'x', enabled = true }: Options = {}) {
  const desligar = useRef<(() => void) | null>(null);

  return useCallback(
    (el: HTMLElement | null) => {
      desligar.current?.();
      desligar.current = null;
      if (el && enabled) {
        desligar.current = ligar(el, axis);
      }
    },
    [axis, enabled],
  );
}
