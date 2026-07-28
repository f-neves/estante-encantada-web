// Único ponto de uso de ícones da interface, como no app. Os nomes são os
// mesmos do Ionicons usados em `mobile/src/components/Icon.tsx`, agora servidos
// pelo react-icons/io5 (mesmo conjunto, mesmos desenhos).

import type { CSSProperties } from 'react';
import {
  IoAddCircle,
  IoArrowBack,
  IoBackspaceOutline,
  IoBook,
  IoBrush,
  IoCheckmark,
  IoCheckmarkCircle,
  IoChevronBack,
  IoChevronDown,
  IoChevronForward,
  IoChevronUp,
  IoClose,
  IoColorPalette,
  IoConstruct,
  IoContrast,
  IoCreate,
  IoCreateOutline,
  IoDesktopOutline,
  IoDocumentText,
  IoEye,
  IoEyeOff,
  IoFlame,
  IoHome,
  IoList,
  IoLockClosed,
  IoLogoGoogle,
  IoMenu,
  IoMic,
  IoMoon,
  IoPause,
  IoPeople,
  IoPhonePortraitOutline,
  IoPlay,
  IoRefresh,
  IoReturnDownForward,
  IoSadOutline,
  IoSearch,
  IoSettings,
  IoSparkles,
  IoStar,
  IoStarOutline,
  IoStop,
  IoSunny,
  IoSwapHorizontal,
  IoText,
  IoTrashOutline,
  IoTrophy,
  IoVolumeHigh,
} from 'react-icons/io5';

const GLYPHS = {
  'add-circle': IoAddCircle,
  'arrow-back': IoArrowBack,
  'backspace-outline': IoBackspaceOutline,
  book: IoBook,
  brush: IoBrush,
  checkmark: IoCheckmark,
  'checkmark-circle': IoCheckmarkCircle,
  'chevron-back': IoChevronBack,
  'chevron-down': IoChevronDown,
  'chevron-forward': IoChevronForward,
  'chevron-up': IoChevronUp,
  close: IoClose,
  'color-palette': IoColorPalette,
  construct: IoConstruct,
  contrast: IoContrast,
  create: IoCreate,
  'create-outline': IoCreateOutline,
  desktop: IoDesktopOutline,
  'document-text': IoDocumentText,
  eye: IoEye,
  'eye-off': IoEyeOff,
  flame: IoFlame,
  home: IoHome,
  list: IoList,
  'lock-closed': IoLockClosed,
  'logo-google': IoLogoGoogle,
  menu: IoMenu,
  mic: IoMic,
  moon: IoMoon,
  pause: IoPause,
  people: IoPeople,
  phone: IoPhonePortraitOutline,
  play: IoPlay,
  refresh: IoRefresh,
  'return-down-forward': IoReturnDownForward,
  'sad-outline': IoSadOutline,
  search: IoSearch,
  settings: IoSettings,
  sparkles: IoSparkles,
  star: IoStar,
  'star-outline': IoStarOutline,
  stop: IoStop,
  sunny: IoSunny,
  'swap-horizontal': IoSwapHorizontal,
  text: IoText,
  'trash-outline': IoTrashOutline,
  trophy: IoTrophy,
  'volume-high': IoVolumeHigh,
} as const;

export type IconName = keyof typeof GLYPHS;

interface Props {
  name: IconName;
  /** Aceita número (px) ou qualquer medida CSS, como `var(--icon-lg)`. */
  size?: number | string;
  color?: string;
  // `| undefined` explícito: as classes vindas de CSS Modules são tipadas como
  // `string | undefined`, e o projeto usa exactOptionalPropertyTypes.
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export default function Icon({
  name,
  size = 'var(--icon-md)',
  color = 'currentColor',
  className,
  style,
}: Props) {
  const Glyph = GLYPHS[name];
  return (
    <Glyph
      size={size}
      color={color}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
    />
  );
}
