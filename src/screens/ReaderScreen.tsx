import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import * as api from '../api';
import { audioSource } from '../media';
import { useChild } from '../profiles/ChildContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useSpeech } from '../hooks/useSpeech';
import Icon from '../components/Icon';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import Modal from '../components/Modal';
import PressBounce from '../components/PressBounce';
import ListenBar from '../components/ListenBar';
import ListenView, { dividirEmFrases } from '../components/ListenView';
import ReaderSettingsSheet from '../components/ReaderSettingsSheet';
import KaraokeText from '../components/KaraokeText';
import { playSound } from '../utils/sound';
import ChapterImage from '../components/ChapterImage';
import CelebrationModal from '../components/CelebrationModal';
import { countWords, readWordCount } from '../utils/reading';
import { getReaderSettings, setReaderSettings, type ReaderSettings } from '../session';
import { Chapter } from '../types';
import styles from './ReaderScreen.module.css';

type ThemeName = ReaderSettings['theme'];

// Temas de leitura próprios do leitor, independentes da aparência do site.
const THEMES: Record<ThemeName, { bg: string; text: string; title: string; muted: string; border: string }> = {
  light: { bg: '#ffffff', text: '#333333', title: '#3b2f6b', muted: '#999999', border: '#eeeeee' },
  sepia: { bg: '#f4ecd8', text: '#5b4636', title: '#5b4636', muted: '#9c8a6e', border: '#e2d6bd' },
  dark: { bg: '#1c1c24', text: '#e4e4ea', title: '#cfc7ff', muted: '#8a8a99', border: '#33333f' },
};

const MIN_SCALE = 0.85;
const MAX_SCALE = 1.6;
const DEFAULT_VOICE = 'pt-BR-Neural2-A';

export default function ReaderScreen() {
  const { bookId = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { activeProfile } = useChild();
  const speech = useSpeech();

  const startIndex = Number(params.get('cap') ?? 0) || 0;
  const startPosition = Number(params.get('pos') ?? 0) || 0;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [current, setCurrent] = useState(startIndex);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [showIndex, setShowIndex] = useState(false);
  const [rate, setRate] = useState(1);
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [fontScale, setFontScale] = useState(1);
  const [theme, setTheme] = useState<ThemeName>('light');
  const [continuous, setContinuous] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // null = ninguém escolheu ainda; aí vale a idade do personagem.
  const [listen, setListen] = useState<boolean | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const arrasteRef = useRef<{ x: number; y: number } | null>(null);
  const autoPlayNextRef = useRef(false);
  const advancedRef = useRef(false);
  const fractionRef = useRef(0);
  const restoredRef = useRef(false);
  const firstChapterEffectRef = useRef(true);

  const currentChapter = chapters[current];
  const voiceAudio =
    currentChapter?.audios?.[voice] ??
    (currentChapter?.audios ? Object.values(currentChapter.audios)[0] : undefined) ??
    (currentChapter?.audioUrl
      ? { audioUrl: currentChapter.audioUrl, wordTimings: currentChapter.wordTimings }
      : undefined);

  const audioUri = voiceAudio?.audioUrl ?? null;
  const audioSrc = useMemo(() => (audioUri ? audioSource(audioUri) : null), [audioUri]);
  const wordTimings = voiceAudio?.wordTimings ?? [];
  const { player, status } = useAudioPlayer(audioSrc);

  // --- Preferências -------------------------------------------------------
  useEffect(() => {
    getReaderSettings().then((s) => {
      if (!s) {
        return;
      }
      setFontScale(s.fontScale);
      setTheme(s.theme);
      if (s.voice) {
        setVoice(s.voice);
      }
      if (s.continuous !== undefined) {
        setContinuous(s.continuous);
      }
      if (s.listen !== undefined) {
        setListen(s.listen);
      }
    });
  }, []);

  const persistSettings = useCallback(
    (next: Partial<ReaderSettings>) => {
      // Mescla com o que está salvo para não apagar campos ajustados fora daqui.
      getReaderSettings()
        .then((cur) =>
          setReaderSettings({ ...(cur ?? {}), fontScale, theme, voice, continuous, ...next }),
        )
        .catch(() => {});
    },
    [fontScale, theme, voice, continuous],
  );

  function changeVoice(next: string) {
    setVoice(next);
    persistSettings({ voice: next });
  }

  function changeFont(delta: number) {
    setFontScale((prev) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round((prev + delta) * 100) / 100));
      persistSettings({ fontScale: next });
      return next;
    });
  }

  function changeTheme(next: ThemeName) {
    setTheme(next);
    persistSettings({ theme: next });
  }

  function toggleContinuous(next: boolean) {
    setContinuous(next);
    persistSettings({ continuous: next });
  }

  function changeListen(next: boolean) {
    setListen(next);
    persistSettings({ listen: next });
    playSound('open');
  }

  // --- Dados --------------------------------------------------------------
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const book = await api.books.getBook(bookId);
      setChapters(book.chapters);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar o capítulo');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  const persistProgress = useCallback(
    (isCompleted?: boolean) => {
      if (!activeProfile || chapters.length === 0) {
        return;
      }
      api.progress
        .saveProgress(activeProfile.id, bookId, {
          lastChapterIndex: current,
          positionPercent: fractionRef.current,
          ...(isCompleted !== undefined ? { completed: isCompleted } : {}),
        })
        .catch(() => {});
    },
    [activeProfile, bookId, current, chapters.length],
  );

  // Trocou de capítulo: para a narração, volta ao topo e salva o novo ponto.
  useEffect(() => {
    speech.stop();
    player.pause();
    if (firstChapterEffectRef.current) {
      firstChapterEffectRef.current = false;
      return;
    }
    playSound('page');
    fractionRef.current = 0;
    restoredRef.current = true;
    window.scrollTo({ top: 0, behavior: 'auto' });
    persistProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Salva ao sair da tela (fechar a aba ou voltar).
  useEffect(() => {
    return () => {
      persistProgress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistProgress]);

  useEffect(() => {
    player.setPlaybackRate(rate);
  }, [rate, audioSrc, player]);

  // Nova faixa: libera o gatilho de avanço e, se viemos da narração contínua,
  // toca sozinho assim que o áudio estiver disponível.
  useEffect(() => {
    advancedRef.current = false;
    if (autoPlayNextRef.current && audioSrc) {
      autoPlayNextRef.current = false;
      const id = window.setTimeout(() => player.play(), 250);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [audioSrc, player]);

  // Narração contínua: ao terminar o áudio, avança para o próximo capítulo.
  useEffect(() => {
    if (!status.didJustFinish || advancedRef.current) {
      return;
    }
    advancedRef.current = true;
    if (continuous && current < chapters.length - 1) {
      autoPlayNextRef.current = true;
      setCurrent((c) => c + 1);
    }
  }, [status.didJustFinish, continuous, current, chapters.length]);

  // --- Rolagem ------------------------------------------------------------
  useEffect(() => {
    let saveTimer = 0;
    function onScroll() {
      const denom = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      fractionRef.current = Math.min(1, Math.max(0, window.scrollY / denom));
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => persistProgress(), 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(saveTimer);
    };
  }, [persistProgress]);

  // Retoma a posição salva depois que o capítulo aparece na tela.
  useEffect(() => {
    if (loading || restoredRef.current || startPosition <= 0) {
      return;
    }
    restoredRef.current = true;
    const id = window.requestAnimationFrame(() => {
      const denom = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: startPosition * denom, behavior: 'auto' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [loading, startPosition]);

  // Acompanha a palavra narrada: recentraliza quando ela sai da faixa
  // confortável da tela, em qualquer direção.
  useEffect(() => {
    if (!status.playing || !bodyRef.current) {
      return;
    }
    const chapter = chapters[current];
    if (!chapter) {
      return;
    }
    const totalWords = countWords(chapter.content);
    if (totalWords === 0) {
      return;
    }
    const readWords = readWordCount(status.currentTime, status.duration, wordTimings, totalWords);
    const rect = bodyRef.current.getBoundingClientRect();
    const bodyTop = rect.top + window.scrollY;
    const boundaryY = bodyTop + (readWords / totalWords) * rect.height;
    const viewport = window.innerHeight || 1;
    const top = window.scrollY;
    if (boundaryY < top + viewport * 0.15 || boundaryY > top + viewport * 0.65) {
      window.scrollTo({ top: Math.max(0, boundaryY - viewport * 0.4), behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.currentTime, status.playing]);

  // --- Narração -----------------------------------------------------------
  function toggleNarration() {
    // Narração gravada quando o capítulo tem áudio.
    if (audioSrc) {
      player.toggle();
      return;
    }
    // Reserva: voz do navegador.
    if (speech.speaking) {
      speech.stop();
      return;
    }
    const text = chapters[current]?.content;
    if (text) {
      speech.speak(text);
    }
  }

  async function handleFinish() {
    if (!activeProfile) {
      return;
    }
    setFinishing(true);
    try {
      const result = await api.progress.saveProgress(activeProfile.id, bookId, {
        lastChapterIndex: current,
        positionPercent: fractionRef.current,
        completed: true,
      });
      setCompleted(true);
      speech.stop();
      player.pause();
      playSound('reward');
      setCelebration(result.reward ? result.reward.label : 'Livro concluído!');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível concluir');
    } finally {
      setFinishing(false);
    }
  }

  // --- Atalhos de teclado (versão desktop) --------------------------------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        toggleNarration();
      } else if (e.key === 'ArrowRight') {
        setCurrent((c) => Math.min(chapters.length - 1, c + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrent((c) => Math.max(0, c - 1));
      } else if (e.key === '+' || e.key === '=') {
        changeFont(0.15);
      } else if (e.key === '-') {
        changeFont(-0.15);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters.length, audioSrc, speech.speaking]);

  if (loading) {
    return <Loading label="Abrindo o livro..." />;
  }

  const chapter = chapters[current];
  if (error || !chapter) {
    return <ErrorState message={error ?? 'Capítulo não encontrado'} onRetry={load} />;
  }

  const isFirst = current === 0;
  const isLast = current === chapters.length - 1;
  const t = THEMES[theme];

  // Sem escolha salva, a idade decide: até 6 anos, a criança ainda não lê.
  const idade = activeProfile ? new Date().getFullYear() - activeProfile.birthYear : 99;
  const modoOuvir = (listen ?? idade <= 6) && audioSrc !== null;

  const totalWords = countWords(chapter.content);
  const palavraAtual =
    readWordCount(status.currentTime, status.duration, wordTimings, totalWords) - 1;

  function ouvirPalavra(indice: number) {
    const inicio = wordTimings[indice];
    if (inicio !== undefined) {
      player.seekTo(Math.max(0, inicio - 0.05));
      player.play();
    }
  }

  if (modoOuvir) {
    return (
      <div
        className={styles.reader}
        style={{
          ['--reader-bg' as string]: t.bg,
          ['--reader-text' as string]: t.text,
          ['--reader-title' as string]: t.title,
          ['--reader-muted' as string]: t.muted,
          ['--reader-border' as string]: t.border,
          ['--reader-scale' as string]: String(fontScale),
        }}
      >
        <ListenView
          title={chapter.title}
          imageUrl={chapter.imageUrl}
          frases={dividirEmFrases(chapter.content)}
          currentWord={palavraAtual}
          playing={status.playing}
          chapterIndex={current}
          chapterCount={chapters.length}
          onToggle={toggleNarration}
          onSeekWord={ouvirPalavra}
          onExit={() => changeListen(false)}
        />

        {isLast ? (
          <div className={styles.finishWrap}>
            <PressBounce
              className={[styles.finish, completed ? styles.finishDone : ''].join(' ')}
              onClick={handleFinish}
              disabled={finishing || completed}
            >
              {completed ? (
                <Icon name="checkmark-circle" size="var(--icon-md)" color="var(--c-white)" />
              ) : null}
              {finishing ? 'Salvando...' : completed ? 'Concluído' : 'Concluir leitura'}
            </PressBounce>
          </div>
        ) : null}

        <CelebrationModal
          visible={celebration !== null}
          message={celebration ?? ''}
          onClose={() => setCelebration(null)}
        />
      </div>
    );
  }

  return (
    <div
      className={styles.reader}
      style={{
        ['--reader-bg' as string]: t.bg,
        ['--reader-text' as string]: t.text,
        ['--reader-title' as string]: t.title,
        ['--reader-muted' as string]: t.muted,
        ['--reader-border' as string]: t.border,
        ['--reader-scale' as string]: String(fontScale),
      }}
    >
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => navigate(`/livro/${bookId}`)}
          aria-label="Voltar ao livro"
        >
          <Icon name="chevron-back" size="var(--icon-lg)" />
        </button>

        <p className={styles.chapterOf}>
          Capítulo {current + 1} de {chapters.length}
        </p>

        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => setSettingsOpen(true)}
          aria-label="Ajustes da leitura"
        >
          <Icon name="settings" size="var(--icon-lg)" />
        </button>
      </div>

      {audioSrc ? (
        <ListenBar
          playing={status.playing}
          currentTime={status.currentTime}
          duration={status.duration}
          rate={rate}
          onToggle={toggleNarration}
          onSeek={(fraction) => player.seekTo(fraction * (status.duration || 0))}
        />
      ) : (
        <button type="button" className={styles.fallbackNarrate} onClick={toggleNarration}>
          <Icon
            name={speech.speaking ? 'stop' : 'volume-high'}
            size="var(--icon-md)"
            color="var(--c-primary)"
          />
          {speech.speaking ? 'Parar a narração' : 'Ouvir a história'}
        </button>
      )}

      <article
        className={styles.content}
        onPointerDown={(e) => {
          arrasteRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={(e) => {
          // Arrastar para o lado vira o capítulo, como se vira a página de um
          // livro. Os botões continuam ali para quem prefere tocar.
          const inicio = arrasteRef.current;
          arrasteRef.current = null;
          if (!inicio) {
            return;
          }
          const dx = e.clientX - inicio.x;
          const dy = e.clientY - inicio.y;
          if (Math.abs(dx) < 90 || Math.abs(dx) < Math.abs(dy) * 2) {
            return;
          }
          if (dx < 0 && current < chapters.length - 1) {
            setCurrent((c) => c + 1);
          } else if (dx > 0 && current > 0) {
            setCurrent((c) => c - 1);
          }
        }}
      >
        <ChapterImage uri={chapter.imageUrl} />
        <h1 className={['display', styles.title].join(' ')}>{chapter.title}</h1>

        <div ref={bodyRef}>
          {audioSrc ? (
            <KaraokeText
              text={chapter.content}
              currentTime={status.currentTime}
              duration={status.duration}
              wordTimings={wordTimings}
              className={styles.body}
              onSeekToWord={(seconds) => {
                player.seekTo(seconds);
                player.play();
              }}
            />
          ) : (
            <p className={styles.body}>{chapter.content}</p>
          )}
        </div>

        {isLast ? (
          <PressBounce
            className={[styles.finish, completed ? styles.finishDone : ''].join(' ')}
            onClick={handleFinish}
            disabled={finishing || completed}
          >
            {completed ? <Icon name="checkmark-circle" size="var(--icon-md)" color="var(--c-white)" /> : null}
            {finishing ? 'Salvando...' : completed ? 'Concluído' : 'Concluir leitura'}
          </PressBounce>
        ) : null}
      </article>

      <nav className={styles.nav}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={isFirst}
        >
          <Icon name="chevron-back" size="var(--icon-sm)" />
          Anterior
        </button>
        <button type="button" className={styles.navButton} onClick={() => setShowIndex(true)}>
          <Icon name="list" size="var(--icon-sm)" />
          Capítulos
        </button>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => setCurrent((c) => Math.min(chapters.length - 1, c + 1))}
          disabled={isLast}
        >
          Próximo
          <Icon name="chevron-forward" size="var(--icon-sm)" />
        </button>
      </nav>

      <Modal
        visible={showIndex}
        onClose={() => setShowIndex(false)}
        variant="sheet"
        label="Capítulos"
        className={styles.indexModal}
      >
        {/* Caminho de bolinhas: mostra onde a criança está e quanto falta sem
            depender de leitura. */}
        <div className={styles.indexCard}>
          <div className={styles.handle} aria-hidden="true" />
          <h2 className={['display', styles.indexTitle].join(' ')}>Capítulos</h2>
          <ul className={styles.trilha}>
            {chapters.map((ch, i) => {
              const lido = i < current;
              const atual = i === current;
              return (
                <li key={ch.id} className={styles.paradaWrap}>
                  <button
                    type="button"
                    className={[
                      styles.parada,
                      lido ? styles.paradaLida : '',
                      atual ? styles.paradaAtual : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      setCurrent(i);
                      setShowIndex(false);
                    }}
                    aria-current={atual ? 'step' : undefined}
                  >
                    <span className={styles.paradaBolha}>
                      {lido ? <Icon name="checkmark" size="var(--icon-md)" color="var(--c-white)" /> : i + 1}
                    </span>
                    <span className={['clamp-2', styles.paradaTitulo].join(' ')}>{ch.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Modal>

      <ReaderSettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fontScale={fontScale}
        onChangeFont={changeFont}
        theme={theme}
        onChangeTheme={changeTheme}
        voice={voice}
        voices={api.books.VOICES}
        onChangeVoice={changeVoice}
        rate={rate}
        onChangeRate={setRate}
        continuous={continuous}
        onToggleContinuous={toggleContinuous}
        listen={listen ?? false}
        onToggleListen={changeListen}
        hasAudio={audioSrc !== null}
      />

      <CelebrationModal
        visible={celebration !== null}
        message={celebration ?? ''}
        onClose={() => setCelebration(null)}
      />
    </div>
  );
}
