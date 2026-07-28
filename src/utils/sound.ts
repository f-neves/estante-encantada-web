// Retorno sonoro curto no toque. Para quem ainda não lê, o som confirma a ação
// junto com a animação: é feedback redundante, não enfeite.
//
// Os sons são sintetizados na hora (Web Audio), então não há arquivo para
// baixar nem atraso na primeira vez. O contexto de áudio só nasce no primeiro
// toque, como o navegador exige.

const KEY = 'estante_sound';

export type SoundName = 'tap' | 'page' | 'reward' | 'open';

let contexto: AudioContext | null = null;

function ligado(): boolean {
  try {
    return window.localStorage.getItem(KEY) !== '0';
  } catch {
    return true;
  }
}

export function isSoundEnabled(): boolean {
  return ligado();
}

export function setSoundEnabled(value: boolean): void {
  try {
    window.localStorage.setItem(KEY, value ? '1' : '0');
  } catch {
    // sem persistência: vale só nesta sessão
  }
}

function pegarContexto(): AudioContext | null {
  if (contexto) {
    return contexto;
  }
  try {
    contexto = new AudioContext();
    return contexto;
  } catch {
    return null;
  }
}

/** Uma nota curta e suave, sem ataque seco (que assusta em volume alto). */
function nota(ctx: AudioContext, freq: number, inicio: number, duracao: number, volume: number) {
  const osc = ctx.createOscillator();
  const ganho = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, ctx.currentTime + inicio);
  ganho.gain.setValueAtTime(0, ctx.currentTime + inicio);
  ganho.gain.linearRampToValueAtTime(volume, ctx.currentTime + inicio + 0.012);
  ganho.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + inicio + duracao);
  osc.connect(ganho).connect(ctx.destination);
  osc.start(ctx.currentTime + inicio);
  osc.stop(ctx.currentTime + inicio + duracao + 0.02);
}

const RECEITAS: Record<SoundName, [freq: number, inicio: number, duracao: number, vol: number][]> = {
  // Toque comum: um "plim" discreto.
  tap: [[660, 0, 0.09, 0.05]],
  // Abrir uma tela ou painel: dois tons subindo.
  open: [
    [520, 0, 0.08, 0.045],
    [780, 0.06, 0.1, 0.04],
  ],
  // Virar de capítulo.
  page: [
    [420, 0, 0.07, 0.04],
    [320, 0.05, 0.12, 0.035],
  ],
  // Medalha conquistada: arpejo alegre.
  reward: [
    [523, 0, 0.12, 0.06],
    [659, 0.1, 0.12, 0.06],
    [784, 0.2, 0.16, 0.06],
    [1047, 0.32, 0.28, 0.05],
  ],
};

export function playSound(nome: SoundName): void {
  if (!ligado()) {
    return;
  }
  const ctx = pegarContexto();
  if (!ctx) {
    return;
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  for (const [freq, inicio, duracao, vol] of RECEITAS[nome]) {
    nota(ctx, freq, inicio, duracao, vol);
  }
}
