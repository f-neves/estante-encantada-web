import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import ModeToggle from './ModeToggle';
import styles from './AppShell.module.css';

// Versão App: coluna estreita centralizada, fiel ao aplicativo de celular.
// No desktop ganha uma moldura suave, e só aí aparece o botão flutuante que
// leva para a versão desktop (no celular a troca fica nas Configurações).
export default function AppShell() {
  const [wide, setWide] = useState(() => window.innerWidth >= 900);

  useEffect(() => {
    function onResize() {
      setWide(window.innerWidth >= 900);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className={styles.viewport}>
      <div className={styles.frame}>
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
