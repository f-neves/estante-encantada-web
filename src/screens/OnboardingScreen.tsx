// Preenchida na fase seguinte do plano.
export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  return (
    <button type="button" onClick={onDone}>
      Começar
    </button>
  );
}
