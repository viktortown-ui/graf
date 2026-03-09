export type AppMode = 'overview' | 'start' | 'world' | 'graph' | 'oracle' | 'settings';

export type ModeDefinition = {
  id: AppMode;
  label: string;
  summary: string;
};

export const MODES: ModeDefinition[] = [
  {
    id: 'overview',
    label: 'Обзор',
    summary: 'Единая приветственная сцена для быстрого входа в контур решений GRAF.',
  },
  {
    id: 'start',
    label: 'Старт',
    summary: 'Выравнивание контура и запуск рабочей сцены.',
  },
  {
    id: 'world',
    label: 'Мир',
    summary: 'Наблюдение за живыми сигналами системы и давлением зон.',
  },
  {
    id: 'graph',
    label: 'Граф',
    summary: 'Разбор структуры связей, влияний и узловых рычагов.',
  },
  {
    id: 'oracle',
    label: 'Оракул',
    summary: 'Прогноз сценариев и выбор следующего шага.',
  },
  {
    id: 'settings',
    label: 'Настройки',
    summary: 'Центр управления визуальной сценой, поведением и безопасностью данных.',
  },
];

export const DEFAULT_MODE: AppMode = 'overview';
