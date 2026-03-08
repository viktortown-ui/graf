export type AppMode = 'start' | 'world' | 'graph' | 'oracle';

export type ModeDefinition = {
  id: AppMode;
  label: string;
  short: string;
  summary: string;
};

export const MODES: ModeDefinition[] = [
  {
    id: 'start',
    label: 'Старт',
    short: 'СТ',
    summary: 'Выравнивание контура и запуск рабочей сцены.',
  },
  {
    id: 'world',
    label: 'Мир',
    short: 'МР',
    summary: 'Наблюдение за живыми сигналами системы и давлением зон.',
  },
  {
    id: 'graph',
    label: 'Граф',
    short: 'ГР',
    summary: 'Разбор структуры связей, влияний и узловых рычагов.',
  },
  {
    id: 'oracle',
    label: 'Оракул',
    short: 'ОР',
    summary: 'Прогноз сценариев и выбор следующего шага.',
  },
];

export const DEFAULT_MODE: AppMode = 'start';
