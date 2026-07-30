import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Voltar como num aplicativo: desfaz um passo, em vez de empurrar uma tela
 * nova por cima.
 *
 * Empurrar parece igual e não é. Ir do capítulo para o livro com um `navigate`
 * comum acrescentava uma entrada no histórico, então o voltar do livro
 * encontrava o capítulo de novo e os dois ficavam se revezando sem nunca
 * chegar ao início.
 *
 * O `fallback` cobre quem chegou direto na tela (link colado, aba nova,
 * recarregar): aí não há passo para desfazer. `location.key` vale 'default'
 * exatamente nesse caso, na primeira entrada da sessão.
 */
export function useGoBack(fallback = '/') {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [navigate, location.key, fallback]);
}
