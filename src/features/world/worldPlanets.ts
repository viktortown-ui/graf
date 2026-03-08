export type PlanetAccent = 'ring' | 'shield' | 'crack' | 'haze';

export type PlanetDomain = {
  id: string;
  label: string;
  size: number;
  brightness: number;
  pulseIntensity: number;
  orbitStability: number;
  accent: PlanetAccent;
  color: string;
  state: 'stable' | 'overloaded' | 'weak' | 'protected' | 'risky' | 'improving';
  orbitRadius: number;
  orbitSpeed: number;
  baseAngle: number;
};

export const WORLD_PLANETS: PlanetDomain[] = [
  {
    id: 'energy',
    label: 'Энергия',
    size: 1.2,
    brightness: 0.92,
    pulseIntensity: 0.8,
    orbitStability: 0.82,
    accent: 'ring',
    color: '#7ce7ff',
    state: 'improving',
    orbitRadius: 172,
    orbitSpeed: 0.165,
    baseAngle: 0.2,
  },
  {
    id: 'money',
    label: 'Ресурсы',
    size: 1,
    brightness: 0.9,
    pulseIntensity: 0.55,
    orbitStability: 0.92,
    accent: 'shield',
    color: '#7bffcb',
    state: 'protected',
    orbitRadius: 218,
    orbitSpeed: 0.14,
    baseAngle: 1.15,
  },
  {
    id: 'discipline',
    label: 'Дисциплина',
    size: 1.08,
    brightness: 0.86,
    pulseIntensity: 0.47,
    orbitStability: 0.95,
    accent: 'ring',
    color: '#90b8ff',
    state: 'stable',
    orbitRadius: 264,
    orbitSpeed: 0.112,
    baseAngle: 1.96,
  },
  {
    id: 'focus',
    label: 'Фокус',
    size: 0.97,
    brightness: 0.78,
    pulseIntensity: 0.52,
    orbitStability: 0.87,
    accent: 'haze',
    color: '#dca3ff',
    state: 'stable',
    orbitRadius: 197,
    orbitSpeed: 0.152,
    baseAngle: 2.8,
  },
  {
    id: 'stress',
    label: 'Напряжение',
    size: 1.12,
    brightness: 0.84,
    pulseIntensity: 0.85,
    orbitStability: 0.58,
    accent: 'crack',
    color: '#ff8b73',
    state: 'risky',
    orbitRadius: 146,
    orbitSpeed: 0.19,
    baseAngle: 3.5,
  },
  {
    id: 'social',
    label: 'Поддержка',
    size: 1.03,
    brightness: 0.7,
    pulseIntensity: 0.48,
    orbitStability: 0.67,
    accent: 'haze',
    color: '#ffc774',
    state: 'weak',
    orbitRadius: 238,
    orbitSpeed: 0.125,
    baseAngle: 4.42,
  },
  {
    id: 'goal',
    label: 'Цель',
    size: 1.15,
    brightness: 0.96,
    pulseIntensity: 0.7,
    orbitStability: 0.89,
    accent: 'shield',
    color: '#9eff9e',
    state: 'stable',
    orbitRadius: 287,
    orbitSpeed: 0.102,
    baseAngle: 5.44,
  },
];

export const STATE_COPY: Record<PlanetDomain['state'], string> = {
  stable: 'Ровное сияние · стабильная орбита',
  overloaded: 'Перегрев контура · высокий шум',
  weak: 'Просадка поля · хрупкая динамика',
  protected: 'Защитный контур · низкая волатильность',
  risky: 'Расширение риска · рост турбулентности',
  improving: 'Рост импульса · положительный тренд',
};
