import { useCallback, useEffect, useRef, useState } from 'react';
import Icon, { type IconName } from '../components/Icon';
import { useDragScroll } from '../hooks/useDragScroll';
import styles from './OnboardingScreen.module.css';

interface Slide {
  icon: IconName;
  bubble: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'book',
    bubble: 'var(--c-primary)',
    title: 'Bem-vindo à Estante Encantada!',
    subtitle: 'Um mundo de histórias mágicas esperando por você. ✨',
  },
  {
    icon: 'volume-high',
    bubble: 'var(--c-coral)',
    title: 'Histórias narradas',
    subtitle: 'Toque em ouvir e acompanhe cada palavrinha enquanto a história é contada.',
  },
  {
    icon: 'trophy',
    bubble: 'var(--c-mint)',
    title: 'Ganhe medalhas',
    subtitle: 'Leia, conclua livros e colecione conquistas no seu baú de tesouros!',
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);

  // No desktop, arrastar o slide com o mouse passa para o próximo.
  const ligarArrasto = useDragScroll({ axis: 'x' });
  const guardarTrilho = useCallback(
    (el: HTMLDivElement | null) => {
      trackRef.current = el;
      ligarArrasto(el);
    },
    [ligarArrasto],
  );

  const isLast = index === SLIDES.length - 1;

  // Acompanha a rolagem para mover as bolhas em parallax e marcar o ponto ativo.
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const width = track.clientWidth || 1;
    setOffset(track.scrollLeft / width);
    setIndex(Math.round(track.scrollLeft / width));
  }, []);

  function goTo(next: number) {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
  }

  function next() {
    if (isLast) {
      onDone();
      return;
    }
    goTo(index + 1);
  }

  // Setas do teclado percorrem os slides (versão desktop).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') {
        goTo(Math.min(SLIDES.length - 1, index + 1));
      } else if (e.key === 'ArrowLeft') {
        goTo(Math.max(0, index - 1));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index]);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.skipRow}>
          {!isLast ? (
            <button type="button" className={styles.skip} onClick={onDone}>
              Pular
            </button>
          ) : null}
        </div>

        <div className={styles.track} ref={guardarTrilho} onScroll={onScroll}>
          {SLIDES.map((slide, i) => (
            <section key={slide.title} className={styles.slide}>
              <div
                className={styles.bubble}
                style={{
                  background: slide.bubble,
                  // A bolha desliza menos que o slide: dá profundidade.
                  transform: `translateX(${(i - offset) * 25}%)`,
                }}
              >
                <Icon name={slide.icon} size={88} color="var(--c-white)" />
              </div>
              <h1 className={['display', styles.title].join(' ')}>{slide.title}</h1>
              <p className={styles.subtitle}>{slide.subtitle}</p>
            </section>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.dots}>
            {SLIDES.map((slide, i) => (
              <button
                key={slide.title}
                type="button"
                className={[styles.dot, i === index ? styles.dotActive : ''].join(' ')}
                onClick={() => goTo(i)}
                aria-label={`Ir para o slide ${i + 1}`}
              />
            ))}
          </div>
          <button type="button" className={['btn', 'btn-primary', styles.next].join(' ')} onClick={next}>
            {isLast ? 'Começar a aventura!' : 'Próximo'}
            <Icon name={isLast ? 'sparkles' : 'chevron-forward'} size="var(--icon-md)" />
          </button>
        </div>
      </div>
    </div>
  );
}
