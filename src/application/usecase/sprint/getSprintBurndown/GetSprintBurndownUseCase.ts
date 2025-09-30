import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { GetSprintBurndownCommand } from "./GetSprintBurndownCommand";
import { GetSprintBurndownResponse } from "./GetSprintBurndownResponse";
import { SprintRepository } from "../../../../domain/repositories/SprintRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";

/**
 * Use case to get sprint burndown chart data with predictions
 */
export class GetSprintBurndownUseCase extends AbstractUseCase<
  GetSprintBurndownCommand,
  GetSprintBurndownResponse
> {
  protected static commandClass = GetSprintBurndownCommand;

  constructor(private readonly sprintRepository: SprintRepository) {
    super();
  }

  protected async doExecute(
    command: GetSprintBurndownCommand
  ): Promise<Partial<GetSprintBurndownResponse>> {
    
    const sprint = await this.sprintRepository.findOne(
      { id: command.sprintId },
      { relations: ['tickets'] }
    );

    if (!sprint) {
      throw new ApplicationException('SPRINT_NOT_FOUND', { 
        sprintId: command.sprintId 
      });
    }

    const totalPoints = sprint.tickets.reduce(
      (sum, ticket) => sum + ticket.difficultyPoints, 
      0
    );

    const completedStatuses = [TicketStatus.TEST_OK, TicketStatus.PRODUCTION];

    // Calculate total days in sprint
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const now = new Date();

    const totalDays = this.getDaysDifference(startDate, endDate) + 1;
    const daysElapsed = Math.min(
      this.getDaysDifference(startDate, now) + 1,
      totalDays
    );
    const daysRemaining = Math.max(totalDays - daysElapsed + 1, 0);

    // Generate burndown data for each day
    const burndownData = [];
    
    for (let dayNum = 0; dayNum <= totalDays; dayNum++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayNum);

      // Ideal burndown (linear)
      const idealRemainingPoints = totalPoints - (totalPoints / totalDays) * dayNum;

      // Actual remaining points (tickets completed by this day)
      // Note: In a real scenario, you'd track completion dates on tickets
      // For now, we'll estimate based on current state
      let actualRemainingPoints = totalPoints;
      let completedPoints = 0;

      if (dayNum === daysElapsed - 1 || currentDate <= now) {
        completedPoints = sprint.tickets
          .filter(ticket => completedStatuses.includes(ticket.status))
          .reduce((sum, ticket) => sum + ticket.difficultyPoints, 0);
        
        actualRemainingPoints = totalPoints - completedPoints;
      } else if (dayNum > daysElapsed - 1) {
        // Future days - use null or projected values
        actualRemainingPoints = totalPoints - completedPoints;
      }

      // Velocity (points completed per day up to this point)
      const velocity = dayNum > 0 ? completedPoints / dayNum : 0;

      burndownData.push({
        date: new Date(currentDate),
        dayNumber: dayNum,
        idealRemainingPoints: Math.max(idealRemainingPoints, 0),
        actualRemainingPoints: Math.max(actualRemainingPoints, 0),
        completedPoints,
        velocity: Math.round(velocity * 10) / 10
      });
    }

    // Calculate current completion
    const currentCompletedPoints = sprint.tickets
      .filter(ticket => completedStatuses.includes(ticket.status))
      .reduce((sum, ticket) => sum + ticket.difficultyPoints, 0);

    const remainingPoints = totalPoints - currentCompletedPoints;
    const percentComplete = totalPoints > 0 
      ? Math.round((currentCompletedPoints / totalPoints) * 100) 
      : 0;

    // Calculate average velocity
    const averageVelocity = daysElapsed > 0 
      ? currentCompletedPoints / daysElapsed 
      : 0;

    // Project completion date based on velocity
    let projectedCompletionDate = null;
    if (averageVelocity > 0 && remainingPoints > 0) {
      const daysNeeded = Math.ceil(remainingPoints / averageVelocity);
      projectedCompletionDate = new Date(now);
      projectedCompletionDate.setDate(now.getDate() + daysNeeded);
    } else if (remainingPoints === 0) {
      projectedCompletionDate = now;
    }

    // Determine if on track
    const idealCompletedByNow = (totalPoints / totalDays) * daysElapsed;
    const isOnTrack = currentCompletedPoints >= idealCompletedByNow * 0.9; // 90% threshold

    // Predictions
    const willCompleteOnTime = projectedCompletionDate 
      ? projectedCompletionDate <= endDate 
      : remainingPoints === 0;

    const estimatedCompletionDate = projectedCompletionDate || endDate;
    const pointsShortfall = willCompleteOnTime ? 0 : remainingPoints;

    const recommendedDailyVelocity = daysRemaining > 0 
      ? Math.ceil(remainingPoints / daysRemaining) 
      : 0;

    return {
      sprint: {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        maxPoints: sprint.maxPoints
      },

      burndownData,

      summary: {
        totalPoints,
        completedPoints: currentCompletedPoints,
        remainingPoints,
        totalDays,
        daysElapsed,
        daysRemaining,
        averageVelocity: Math.round(averageVelocity * 10) / 10,
        projectedCompletionDate,
        isOnTrack,
        percentComplete
      },

      predictions: {
        willCompleteOnTime,
        estimatedCompletionDate,
        pointsShortfall,
        recommendedDailyVelocity
      }
    };
  }

  /**
   * Calculate difference in days between two dates
   */
  private getDaysDifference(start: Date, end: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const startMs = start.getTime();
    const endMs = end.getTime();
    return Math.floor((endMs - startMs) / msPerDay);
  }
}