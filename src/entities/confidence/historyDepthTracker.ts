export const HISTORY_UNLOCKS = [
  { thresholdDays: 3, title: 'Стартовые рекомендации' },
  { thresholdDays: 7, title: 'Первые personal deviations' },
  { thresholdDays: 14, title: 'Factor links preview' },
  { thresholdDays: 30, title: 'Stable pattern layer' },
  { thresholdDays: 60, title: 'Deep baseline + stronger forecast' },
] as const;

export type HistoryDepthStatus = {
  historyDepthDays: number;
  unlockedFeatures: string[];
  nextUnlock: { thresholdDays: number; title: string; daysLeft: number } | null;
};

export const trackHistoryDepth = (historyDepthDays: number): HistoryDepthStatus => {
  const unlockedFeatures = HISTORY_UNLOCKS.filter((unlock) => historyDepthDays >= unlock.thresholdDays).map((unlock) => unlock.title);
  const next = HISTORY_UNLOCKS.find((unlock) => historyDepthDays < unlock.thresholdDays);

  return {
    historyDepthDays,
    unlockedFeatures,
    nextUnlock: next
      ? {
        thresholdDays: next.thresholdDays,
        title: next.title,
        daysLeft: Math.max(0, next.thresholdDays - historyDepthDays),
      }
      : null,
  };
};
