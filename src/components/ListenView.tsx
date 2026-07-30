import { useMemo } from 'react';
import Icon from './Icon';
import ChapterImage from './ChapterImage';
import styles from './ListenView.module.css';

export interface Frase {
  texto: string;
  primeiraPalavra: number;
}

// Quebra o capítulo em frases, guardando em que palavra cada uma começa. Isso
// liga a frase ao tempo do áudio (os `wordTimings` são por palavra).
export function dividirEmFrases(texto: string): Frase[] {
  const partes = texto.split(/\n{2,}|(?<=[.!?…])\s+/);
  let contador = 0;
  const frases: Frase[] = [];
  for (const parte of partes) {
    const limpo = parte.trim();
    if (limpo.length === 0) {
      continue;
    }
    frases.push({ texto: limpo, primeiraPalavra: contador });
    contador += limpo.split(/\s+/).filter(Boolean).length;
  }
  return frases;
}

interface Props {
  title: string;
  imageUrl: string | null;
  frases: Frase[];
  /** Índice da palavra que está tocando agora (-1 antes de começar). */
  currentWord: number;
  playing: boolean;
  chapterIndex: number;
  chapterCount: number;
  onToggle: () => void;
  onSeekWord: (indice: number) => void;
  onExit: () => void;
  onBack: () => void;
}

// Modo Ouvir: pensado para 3 a 6 anos, que ainda não leem. Uma frase por vez,
// bem grande, com a frase atual em destaque. Dois controles apenas: ouvir e
// voltar uma frase. Tudo o mais sai da frente.
export default function ListenView({
  title,
  imageUrl,
  frases,
  currentWord,
  playing,
  chapterIndex,
  chapterCount,
  onToggle,
  onSeekWord,
  onExit,
  onBack,
}: Props) {
  const atual = useMemo(() => {
    if (currentWord < 0) {
      return 0;
    }
    let indice = 0;
    for (let i = 0; i < frases.length; i++) {
      const frase = frases[i];
      if (frase && frase.primeiraPalavra <= currentWord) {
        indice = i;
      } else {
        break;
      }
    }
    return indice;
  }, [frases, currentWord]);

  const anterior = frases[atual - 1];
  const frase = frases[atual];
  const proxima = frases[atual + 1];

  function voltarUmaFrase() {
    const alvo = frases[Math.max(0, atual - 1)];
    if (alvo) {
      onSeekWord(alvo.primeiraPalavra);
    }
  }

  return (
    <div className={styles.palco}>
      <div className={styles.topo}>
        {/* Sem isto não havia como sair do livro no modo Ouvir. */}
        <button type="button" className={styles.voltar} onClick={onBack} aria-label="Voltar">
          <Icon name="chevron-back" size="var(--icon-lg)" />
        </button>
        <button type="button" className={styles.sair} onClick={onExit}>
          <Icon name="text" size="var(--icon-sm)" />
          Ver o texto todo
        </button>
        <div className={styles.pontos} aria-label={`Capítulo ${chapterIndex + 1} de ${chapterCount}`}>
          {Array.from({ length: chapterCount }, (_, i) => (
            <span
              key={i}
              className={[styles.ponto, i === chapterIndex ? styles.pontoAtivo : ''].join(' ')}
            />
          ))}
        </div>
      </div>

      <div className={styles.miolo}>
        {imageUrl ? (
          <div className={styles.ilustracao}>
            <ChapterImage uri={imageUrl} />
          </div>
        ) : null}

        <h1 className={['display', styles.titulo].join(' ')}>{title}</h1>

        <div className={styles.frases}>
          {anterior ? (
            <p
              className={[styles.frase, styles.fraseFraca].join(' ')}
              onClick={() => onSeekWord(anterior.primeiraPalavra)}
            >
              {anterior.texto}
            </p>
          ) : null}

          <p className={[styles.frase, styles.fraseAtual].join(' ')}>{frase?.texto ?? ''}</p>

          {proxima ? (
            <p
              className={[styles.frase, styles.fraseFraca].join(' ')}
              onClick={() => onSeekWord(proxima.primeiraPalavra)}
            >
              {proxima.texto}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.controles}>
        <button
          type="button"
          className={styles.voltar}
          onClick={voltarUmaFrase}
          aria-label="Ouvir a frase de novo"
        >
          <Icon name="refresh" size={34} color="var(--c-primary)" />
        </button>

        <button
          type="button"
          className={[styles.play, playing ? '' : styles.parado].join(' ')}
          onClick={onToggle}
          aria-label={playing ? 'Pausar' : 'Ouvir'}
        >
          <Icon name={playing ? 'pause' : 'play'} size={54} color="var(--c-white)" />
        </button>
      </div>
    </div>
  );
}
