export interface GetSprintBurndownResponse {
  sprint: {
    id: number;
    name: string;
    startDate: Date;
    endDate: Date;
    maxPoints: number;
  };

  burndownData: Array<{
    date: Date;
    dayNumber: number;
    idealRemainingPoints: number;
    actualRemainingPoints: number;
    completedPoints: number;
    velocity: number;
  }>;

  summary: {
    totalPoints: number;
    completedPoints: number;
    remainingPoints: number;
    totalDays: number;
    daysElapsed: number;
    daysRemaining: number;
    averageVelocity: number;
    projectedCompletionDate: Date | null;
    isOnTrack: boolean;
    percentComplete: number;
  };

  predictions: {
    willCompleteOnTime: boolean;
    estimatedCompletionDate: Date;
    pointsShortfall: number;
    recommendedDailyVelocity: number;
  };
}