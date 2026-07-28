import { useState } from 'react';
import Modal from './Modal';
import PinPad from './PinPad';
import styles from './PinSetupModal.module.css';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onDone: (pin: string) => void;
}

// Dois passos: digitar o PIN novo e confirmar.
export default function PinSetupModal({ visible, onCancel, onDone }: Props) {
  const [first, setFirst] = useState<string | null>(null);
  const [errSignal, setErrSignal] = useState(0);
  const [errText, setErrText] = useState<string | null>(null);

  function reset() {
    setFirst(null);
    setErrText(null);
  }

  function close() {
    reset();
    onCancel();
  }

  function handleComplete(pin: string) {
    if (first === null) {
      setFirst(pin);
      setErrText(null);
      return;
    }
    if (pin === first) {
      reset();
      onDone(pin);
    } else {
      setFirst(null);
      setErrText('Os PINs não conferem. Tente de novo.');
      setErrSignal((n) => n + 1);
    }
  }

  return (
    <Modal visible={visible} onClose={close} variant="full" label="Controle parental">
      <div className={styles.container}>
        <button type="button" className={styles.cancel} onClick={close}>
          Cancelar
        </button>
        <div className={styles.center}>
          <PinPad
            title={first === null ? 'Crie um PIN de 4 dígitos' : 'Confirme o PIN'}
            subtitle={
              first === null
                ? 'Os pais usarão este PIN para abrir as Configurações.'
                : 'Digite o mesmo PIN novamente.'
            }
            onComplete={handleComplete}
            errorSignal={errSignal}
            errorText={errText}
          />
        </div>
      </div>
    </Modal>
  );
}
