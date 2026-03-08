export type ThemePresetId = 'contour' | 'cosmos' | 'abyss';
export type AnimationIntensity = 'minimum' | 'normal' | 'cinema';
export type SceneSpeed = 'slow' | 'standard' | 'fast';

export type AppSettings = {
  theme: ThemePresetId;
  animationIntensity: AnimationIntensity;
  sceneSpeed: SceneSpeed;
  glowBrightness: number;
  hudOpacity: number;
  backgroundDensity: number;
  labelDensity: number;
  showSecondaryLinks: boolean;
  showDelays: boolean;
  autoFocusNode: boolean;
  persistCameraBetweenModes: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  highContrast: boolean;
  enhancedFocus: boolean;
  uiTextScale: number;
  lowGlowMode: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'contour',
  animationIntensity: 'normal',
  sceneSpeed: 'standard',
  glowBrightness: 55,
  hudOpacity: 78,
  backgroundDensity: 52,
  labelDensity: 82,
  showSecondaryLinks: true,
  showDelays: true,
  autoFocusNode: true,
  persistCameraBetweenModes: true,
  reduceMotion: false,
  reduceTransparency: false,
  highContrast: false,
  enhancedFocus: false,
  uiTextScale: 100,
  lowGlowMode: false,
};

export const THEME_PRESETS: Record<ThemePresetId, { label: string; description: string }> = {
  contour: {
    label: 'Контур',
    description: 'Строгий аналитический режим: чистая читаемость и контроль линий.',
  },
  cosmos: {
    label: 'Космос',
    description: 'Глубокая атмосферная сцена с кинематографичной глубиной и свечением.',
  },
  abyss: {
    label: 'Бездна',
    description: 'Тактическая сверхтёмная конфигурация с акцентом на критические связи.',
  },
};
