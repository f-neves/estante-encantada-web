// Vibração: existe em Android/Chrome, é ignorada no desktop e no iOS.
// Mesmo papel do expo-haptics no app, sem quebrar onde não há suporte.

function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Sem suporte: seguimos sem feedback tátil.
  }
}

export function hapticSuccess(): void {
  vibrate([12, 60, 24]);
}

export function hapticLight(): void {
  vibrate(10);
}
