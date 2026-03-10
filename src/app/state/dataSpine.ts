export type WorkloadLevel = 'low' | 'medium' | 'high';

export type Goal = {
  title: string;
  deadline: string;
  failureCost: number;
};

export type Profile = {
  monthlyIncome: number;
  monthlyFixedExpenses: number;
  reserveAmount: number;
  sleepTargetHours: number;
  workCapacityBaseline: number;
  activeGoalTitle: string;
  activeGoalDeadline: string;
  activeGoalFailureCost: number;
};

export type DailyCheckIn = {
  mood: number;
  energy: number;
  focus: number;
  pressure: number;
  recovery: number;
};

export type DailyFactors = {
  sleepHours: number;
  workloadLevel: WorkloadLevel;
  hadConflict: boolean;
  unplannedSpend: number;
  hadWorkout: boolean;
  lateCaffeine: boolean;
};

export type DerivedMetrics = {
  pressureValue: number;
  riskValue: number;
  stabilityValue: number;
  leverageValue: number;
  readinessValue: number;
};

export type DataSpine = {
  profile: Profile;
  activeGoal: Goal;
  dailyCheckIn: DailyCheckIn;
  dailyFactors: DailyFactors;
  derived: DerivedMetrics;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round1 = (value: number) => Math.round(value * 10) / 10;

export const DEFAULT_PROFILE: Profile = {
  monthlyIncome: 180000,
  monthlyFixedExpenses: 95000,
  reserveAmount: 240000,
  sleepTargetHours: 7.5,
  workCapacityBaseline: 7,
  activeGoalTitle: 'Запустить MVP GRAF',
  activeGoalDeadline: '2026-06-30',
  activeGoalFailureCost: 180000,
};

export const DEFAULT_DAILY_CHECKIN: DailyCheckIn = {
  mood: 6,
  energy: 6,
  focus: 5,
  pressure: 7,
  recovery: 5,
};

export const DEFAULT_DAILY_FACTORS: DailyFactors = {
  sleepHours: 6.5,
  workloadLevel: 'high',
  hadConflict: false,
  unplannedSpend: 8000,
  hadWorkout: true,
  lateCaffeine: true,
};

const workloadToScale = (level: WorkloadLevel) => {
  if (level === 'low') return 4;
  if (level === 'medium') return 7;
  return 9;
};

export const deriveMetrics = (profile: Profile, checkIn: DailyCheckIn, factors: DailyFactors): DerivedMetrics => {
  const disposableIncome = Math.max(profile.monthlyIncome - profile.monthlyFixedExpenses, 1);
  const spendShare = factors.unplannedSpend / disposableIncome;
  const reserveExposure = factors.unplannedSpend / Math.max(profile.reserveAmount, 1);
  const moneyPressure = clamp((spendShare * 100) * 0.72 + (reserveExposure * 100) * 0.28);

  const sleepDeficit = Math.max(0, profile.sleepTargetHours - factors.sleepHours);
  const sleepPenalty = clamp((sleepDeficit / Math.max(profile.sleepTargetHours, 1)) * 100);

  const capacityBaseline = Math.max(profile.workCapacityBaseline, 1);
  const workloadGap = workloadToScale(factors.workloadLevel) - capacityBaseline;
  const workloadPressure = clamp(50 + workloadGap * 10);

  const goalPressure = clamp((profile.activeGoalFailureCost / Math.max(disposableIncome, 1)) * 22 + (profile.activeGoalTitle ? 10 : 0));

  const checkInPressure = clamp(
    checkIn.pressure * 7 +
      (10 - checkIn.energy) * 2.2 +
      (10 - checkIn.focus) * 2.2 +
      (10 - checkIn.recovery) * 1.8 +
      (10 - checkIn.mood) * 1.6,
  );

  const factorPenalty =
    sleepPenalty * 0.32 +
    workloadPressure * 0.26 +
    moneyPressure * 0.26 +
    goalPressure * 0.16 +
    (factors.hadConflict ? 8 : 0) +
    (factors.lateCaffeine ? 4 : 0) -
    (factors.hadWorkout ? 6 : 0);

  const pressureValue = clamp(checkInPressure * 0.58 + factorPenalty * 0.42);
  const riskValue = clamp(pressureValue * 0.6 + moneyPressure * 0.24 + goalPressure * 0.16);
  const stabilityValue = clamp(100 - pressureValue * 0.62 - sleepPenalty * 0.14 + (factors.hadWorkout ? 5 : 0));
  const leverageValue = clamp(
    checkIn.focus * 5 + checkIn.energy * 4.2 + checkIn.recovery * 2.6 + (10 - checkIn.pressure) * 2.4 - workloadPressure * 0.15,
  );
  const readinessValue = clamp(leverageValue * 0.55 + stabilityValue * 0.3 - riskValue * 0.15);

  return {
    pressureValue: round1(pressureValue),
    riskValue: round1(riskValue),
    stabilityValue: round1(stabilityValue),
    leverageValue: round1(leverageValue),
    readinessValue: round1(readinessValue),
  };
};

export const createDataSpine = (
  profile: Profile = DEFAULT_PROFILE,
  dailyCheckIn: DailyCheckIn = DEFAULT_DAILY_CHECKIN,
  dailyFactors: DailyFactors = DEFAULT_DAILY_FACTORS,
): DataSpine => ({
  profile,
  activeGoal: {
    title: profile.activeGoalTitle,
    deadline: profile.activeGoalDeadline,
    failureCost: profile.activeGoalFailureCost,
  },
  dailyCheckIn,
  dailyFactors,
  derived: deriveMetrics(profile, dailyCheckIn, dailyFactors),
});
