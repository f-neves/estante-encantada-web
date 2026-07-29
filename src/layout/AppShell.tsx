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
