import { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDragScroll } from '../hooks/useDragScroll';
import ModeToggle from './ModeToggle';
import styles from './AppShell.module.css';

const LARGURA_DESKTOP = 900;

// Versão App: coluna estreita centralizada, fiel ao aplicativo de celular.
// No desktop ganha moldura de aparelho com altura fixa (430x932, proporção de
// celular atual) e rolagem por dentro, para caber inteira num print. Arrastar
// com o mouse rola, como num aparelho de toque.
export default function AppShell() {
  const [wide, setWide] = useState(() => window.innerWidth >= LARGURA_DESKTOP);
  const frameRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    function onResize() {
      setWide(window.innerWidth >= LARGURA_DESKTOP);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Trocar de tela volta ao topo (no celular quem faz isso é a janela).
  useEffect(() => {
    frameRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // Publica onde a moldura está para os diálogos se prenderem a ela. O
  // <dialog> nativo vive na camada de topo e ignora a árvore da página, então
  // a única forma de mantê-lo dentro do aparelho é passar a geometria por
  // variáveis de CSS.
  useEffect(() => {
    const root = document.documentElement;
    if (!wide) {
      root.removeAttribute('data-framed');
      return;
    }

    function medir() {
      const el = frameRef.current;
      if (!el) {
        return;
      }
      const r = el.getBoundingClientRect();
      // Numa janela mais baixa que a moldura, o diálogo se limita à parte
      // visível dela: preso ao aparelho, mas nunca com um pedaço fora do
      // alcance (o <dialog> aberto trava a rolagem da página).
      const left = Math.max(r.left, 0);
      const top = Math.max(r.top, 0);
      const right = Math.min(r.right, window.innerWidth);
      const bottom = Math.min(r.bottom, window.innerHeight);

      root.style.setProperty('--frame-left', `${left}px`);
      root.style.setProperty('--frame-top', `${top}px`);
      root.style.setProperty('--frame-width', `${Math.max(0, right - left)}px`);
      root.style.setProperty('--frame-height', `${Math.max(0, bottom - top)}px`);
      // Arredonda só os cantos que sobreviveram ao corte, senão a curva
      // apareceria no meio da moldura.
      const topoInteiro = r.top >= -0.5;
      const baseInteira = r.bottom <= window.innerHeight + 0.5;
      root.style.setProperty('--frame-radius-top', topoInteiro ? '36px' : '0px');
      root.style.setProperty('--frame-radius-bottom', baseInteira ? '36px' : '0px');
    }

    root.setAttribute('data-framed', '');
    medir();

    const observador = new ResizeObserver(medir);
    if (frameRef.current) {
      observador.observe(frameRef.current);
    }
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', medir, { passive: true });

    return () => {
      observador.disconnect();
      window.removeEventListener('resize', medir);
      window.removeEventListener('scroll', medir);
      root.removeAttribute('data-framed');
    };
  }, [wide]);

  const ligarArrasto = useDragScroll({ axis: 'y', enabled: wide });
  const guardarMoldura = useCallback(
    (el: HTMLDivElement | null) => {
      frameRef.current = el;
      ligarArrasto(el);
    },
    [ligarArrasto],
  );

  return (
    <div className={styles.viewport}>
      <div className={styles.frame} ref={guardarMoldura} data-scroller={wide ? '' : undefined}>
        <Outlet />
      </div>
      {wide ? (
        <div className={styles.floating}>
          <ModeToggle />
        </div>
      ) : null}
    </div>
  );
}
