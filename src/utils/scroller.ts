// No modo app dentro do desktop, a moldura tem altura fixa de aparelho e rola
// por dentro, então quem rola não é a janela. Estas funções falam com o
// elemento certo nos dois casos, para o leitor não precisar saber onde está.
//
// O AppShell marca a moldura com `data-scroller`; só existe uma por vez.

export function getScroller(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-scroller]');
}

export function getScrollTop(): number {
  const el = getScroller();
  return el ? el.scrollTop : window.scrollY;
}

export function getViewportHeight(): number {
  const el = getScroller();
  return (el ? el.clientHeight : window.innerHeight) || 1;
}

/** Quanto ainda dá para rolar (altura total menos a janela). Nunca zero. */
export function getScrollRange(): number {
  const el = getScroller();
  const total = el ? el.scrollHeight : document.documentElement.scrollHeight;
  return Math.max(1, total - getViewportHeight());
}

export function scrollToY(y: number, behavior: ScrollBehavior = 'auto'): void {
  const el = getScroller();
  if (el) {
    el.scrollTo({ top: y, behavior });
  } else {
    window.scrollTo({ top: y, behavior });
  }
}

/** Distância do topo de um elemento até o topo do conteúdo rolável. */
export function offsetTopWithin(el: HTMLElement): number {
  const scroller = getScroller();
  const rect = el.getBoundingClientRect();
  if (scroller) {
    return rect.top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  }
  return rect.top + window.scrollY;
}

/** Assina o evento de rolagem de quem estiver rolando. Devolve o cancelador. */
export function onScroll(handler: () => void): () => void {
  const el = getScroller();
  const alvo: HTMLElement | Window = el ?? window;
  alvo.addEventListener('scroll', handler, { passive: true });
  return () => alvo.removeEventListener('scroll', handler);
}
