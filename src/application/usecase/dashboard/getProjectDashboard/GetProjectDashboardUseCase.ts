import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { GetProjectDashboardCommand } from "./GetProjectDashboardCommand";
import { GetProjectDashboardResponse } from "./GetProjectDashboardResponse";
import { TicketRepository } from "../../../../domain/repositories/TicketRepository";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { SprintRepository } from "../../../../domain/repositories/SprintRepository";
import { TestRepository } from "../../../../domain/repositories/TestRepository";
import { CommentRepository } from "../../../../domain/repositories/CommentRepository";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";
import { TicketType } from "../../../../domain/enums/TicketType";

/**
 * Use case to get comprehensive project dashboard
 */
export class GetProjectDashboardUseCase extends AbstractUseCase<
  GetProjectDashboardCommand,
  GetProjectDashboardResponse
> {
  protected static commandClass = GetProjectDashboardCommand;

  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly userRepository: UserRepository,
    private readonly sprintRepository: SprintRepository,
    private readonly testRepository: TestRepository,
    private readonly commentRepository: CommentRepository
  ) {
    super();
  }

  protected async doExecute(
    command: GetProjectDashboardCommand
  ): Promise<Partial<GetProjectDashboardResponse>> {
    
    const now = new Date();

    // Get all data
    const allTickets = await this.ticketRepository.findAll({
      relations: ['creator', 'assignee', 'sprint', 'comments', 'tests']
    });

    const allUsers = await this.userRepository.findAll();

    const allSprints = await this.sprintRepository.findAll({
      relations: ['tickets']
    });

    const allTests = await this.testRepository.findAll();
    const allComments = await this.commentRepository.findAll();

    // Overview
    const activeSprints = allSprints.filter(s => 
      s.startDate <= now && s.endDate >= now
    ).length;

    const completedSprints = allSprints.filter(s => 
      s.endDate < now
    ).length;

    // Tickets analysis
    const ticketsByStatus: Record<TicketStatus, number> = {} as any;
    Object.values(TicketStatus).forEach(status => {
      ticketsByStatus[status] = allTickets.filter(t => t.status === status).length;
    });

    const ticketsByType: Record<TicketType, number> = {} as any;
    Object.values(TicketType).forEach(type => {
      ticketsByType[type] = allTickets.filter(t => t.type === type).length;
    });

    const totalPoints = allTickets.reduce((sum, t) => sum + t.difficultyPoints, 0);
    
    const completedStatuses = [TicketStatus.TEST_OK, TicketStatus.PRODUCTION];
    const completedPoints = allTickets
      .filter(t => completedStatuses.includes(t.status))
      .reduce((sum, t) => sum + t.difficultyPoints, 0);

    const averagePointsPerTicket = allTickets.length > 0 
      ? Math.round((totalPoints / allTickets.length) * 10) / 10 
      : 0;

    const unassignedCount = allTickets.filter(t => !t.assignee).length;
    const withoutSprintCount = allTickets.filter(t => !t.sprint).length;

    // Active sprints details
    const activeSprintsDetails = allSprints
      .filter(s => s.startDate <= now && s.endDate >= now)
      .map(sprint => {
        const sprintTotalPoints = sprint.tickets.reduce(
          (sum, t) => sum + t.difficultyPoints, 
          0
        );
        const sprintCompletedPoints = sprint.tickets
          .filter(t => completedStatuses.includes(t.status))
          .reduce((sum, t) => sum + t.difficultyPoints, 0);

        const progressPercentage = sprintTotalPoints > 0
          ? Math.round((sprintCompletedPoints / sprintTotalPoints) * 100)
          : 0;

        const daysRemaining = Math.ceil(
          (sprint.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: sprint.id,
          name: sprint.name,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          totalPoints: sprintTotalPoints,
          completedPoints: sprintCompletedPoints,
          progressPercentage,
          ticketsCount: sprint.tickets.length,
          daysRemaining
        };
      })
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());

    // Upcoming sprints
    const upcomingSprints = allSprints
      .filter(s => s.startDate > now)
      .map(sprint => ({
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        ticketsCount: sprint.tickets.length,
        totalPoints: sprint.tickets.reduce((sum, t) => sum + t.difficultyPoints, 0)
      }))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .slice(0, 5);

    // Recently completed sprints
    const recentlyCompleted = allSprints
      .filter(s => s.endDate < now)
      .map(sprint => {
        const sprintTotalPoints = sprint.tickets.reduce(
          (sum, t) => sum + t.difficultyPoints, 
          0
        );
        const sprintCompletedPoints = sprint.tickets
          .filter(t => completedStatuses.includes(t.status))
          .reduce((sum, t) => sum + t.difficultyPoints, 0);

        const completionRate = sprintTotalPoints > 0
          ? Math.round((sprintCompletedPoints / sprintTotalPoints) * 100)
          : 0;

        const durationMs = sprint.endDate.getTime() - sprint.startDate.getTime();
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
        const velocity = durationDays > 0
          ? Math.round((sprintCompletedPoints / durationDays) * 10) / 10
          : 0;

        return {
          id: sprint.id,
          name: sprint.name,
          endDate: sprint.endDate,
          completionRate,
          velocity
        };
      })
      .sort((a, b) => b.endDate.getTime() - a.endDate.getTime())
      .slice(0, 5);

    // Team analysis
    const userStats = allUsers.map(user => {
      const assignedTickets = allTickets.filter(t => t.assignee?.id === user.id);
      const completedTickets = assignedTickets.filter(t => 
        completedStatuses.includes(t.status)
      );
      const commentsCount = allComments.filter(c => c.user.id === user.id).length;
      const testsCount = allTests.filter(t => t.user.id === user.id).length;

      const assignedPoints = assignedTickets.reduce(
        (sum, t) => sum + t.difficultyPoints, 
        0
      );
      const completedPoints = completedTickets.reduce(
        (sum, t) => sum + t.difficultyPoints, 
        0
      );

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        assignedTickets: assignedTickets.length,
        completedTickets: completedTickets.length,
        commentsCount,
        testsCount,
        assignedPoints,
        completedPoints
      };
    });

    const mostActiveUsers = userStats
      .sort((a, b) => {
        const scoreA = a.completedTickets * 3 + a.commentsCount + a.testsCount;
        const scoreB = b.completedTickets * 3 + b.commentsCount + b.testsCount;
        return scoreB - scoreA;
      })
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        name: u.name,
        assignedTickets: u.assignedTickets,
        completedTickets: u.completedTickets,
        commentsCount: u.commentsCount,
        testsCount: u.testsCount
      }));

    const totalAssignedPoints = userStats.reduce((sum, u) => sum + u.assignedPoints, 0);

    const workloadDistribution = userStats
      .filter(u => u.assignedTickets > 0)
      .map(u => ({
        userId: u.id,
        userName: u.name,
        assignedPoints: u.assignedPoints,
        completedPoints: u.completedPoints,
        workloadPercentage: totalAssignedPoints > 0
          ? Math.round((u.assignedPoints / totalAssignedPoints) * 100)
          : 0
      }))
      .sort((a, b) => b.assignedPoints - a.assignedPoints);

    // Quality metrics
    const validatedTests = allTests.filter(t => t.isValidated).length;
    const validationRate = allTests.length > 0
      ? Math.round((validatedTests / allTests.length) * 100)
      : 0;

    const averageCommentsPerTicket = allTickets.length > 0
      ? Math.round((allComments.length / allTickets.length) * 10) / 10
      : 0;

    const ticketsWithTests = new Set(allTests.map(t => t.ticket.id)).size;
    const testCoverage = allTickets.length > 0
      ? Math.round((ticketsWithTests / allTickets.length) * 100)
      : 0;

    // Trends (if historical data requested)
    let trends = undefined;
    if (command.includeHistorical) {
      trends = this.calculateTrends(allTickets, allSprints);
    }

    return {
      overview: {
        totalTickets: allTickets.length,
        totalUsers: allUsers.length,
        totalSprints: allSprints.length,
        activeSprints,
        completedSprints
      },

      tickets: {
        byStatus: ticketsByStatus,
        byType: ticketsByType,
        totalPoints,
        completedPoints,
        averagePointsPerTicket,
        unassignedCount,
        withoutSprintCount
      },

      sprints: {
        active: activeSprintsDetails,
        upcoming: upcomingSprints,
        recentlyCompleted
      },

      team: {
        mostActiveUsers,
        workloadDistribution
      },

      quality: {
        totalTests: allTests.length,
        validatedTests,
        validationRate,
        totalComments: allComments.length,
        averageCommentsPerTicket,
        ticketsWithTests,
        testCoverage
      },

      trends
    };
  }

  /**
   * Calculate historical trends
   */
  private calculateTrends(tickets: any[], sprints: any[]): any {
    const now = new Date();
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(now.getDate() - 84); // 12 weeks

    // Group by week
    const weeklyData = new Map<string, { completed: number; created: number; points: number }>();

    // Initialize weeks
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(twelveWeeksAgo);
      weekStart.setDate(twelveWeeksAgo.getDate() + (i * 7));
      const weekKey = this.getWeekKey(weekStart);
      weeklyData.set(weekKey, { completed: 0, created: 0, points: 0 });
    }

    // Count created tickets by week
    tickets.forEach(ticket => {
      const createdDate = new Date(ticket.createdAt);
      if (createdDate >= twelveWeeksAgo) {
        const weekKey = this.getWeekKey(createdDate);
        const data = weeklyData.get(weekKey);
        if (data) {
          data.created++;
        }
      }
    });

    // Count completed tickets by week (using updatedAt as proxy for completion)
    const completedStatuses = [TicketStatus.TEST_OK, TicketStatus.PRODUCTION];
    tickets
      .filter(t => completedStatuses.includes(t.status))
      .forEach(ticket => {
        const updatedDate = new Date(ticket.updatedAt);
        if (updatedDate >= twelveWeeksAgo) {
          const weekKey = this.getWeekKey(updatedDate);
          const data = weeklyData.get(weekKey);
          if (data) {
            data.completed++;
            data.points += ticket.difficultyPoints;
          }
        }
      });

    // Convert to arrays
    const velocityByWeek = Array.from(weeklyData.entries())
      .map(([weekKey, data]) => ({
        weekStart: this.parseWeekKey(weekKey),
        pointsCompleted: data.points,
        ticketsCompleted: data.completed
      }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

    const ticketCreationByWeek = Array.from(weeklyData.entries())
      .map(([weekKey, data]) => ({
        weekStart: this.parseWeekKey(weekKey),
        ticketsCreated: data.created
      }))
      .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

    return {
      velocityByWeek,
      ticketCreationByWeek
    };
  }

  /**
   * Get week key (YYYY-Www format)
   */
  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const weekNum = this.getWeekNumber(date);
    return `${year}-W${String(weekNum).padStart(2, '0')}`;
  }

  /**
   * Parse week key back to date
   */
  private parseWeekKey(weekKey: string): Date {
    const [year, week] = weekKey.split('-W').map(Number);
    const jan4 = new Date(year, 0, 4);
    const weekStart = new Date(jan4);
    weekStart.setDate(jan4.getDate() - jan4.getDay() + 1 + (week - 1) * 7);
    return weekStart;
  }

  /**
   * Get ISO week number
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNum;
  }
}