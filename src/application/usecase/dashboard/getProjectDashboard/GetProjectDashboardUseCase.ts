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
import { TicketPriority } from "../../../../domain/enums/TicketPriority";

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
    private readonly testRepository: TestRepository
  ) {
    super();
  }

  protected async doExecute(
    command: GetProjectDashboardCommand
  ): Promise<Partial<GetProjectDashboardResponse>> {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Récupérer toutes les données nécessaires
    const allTickets = await this.ticketRepository.findAll({
      relations: ["creator", "assignee", "sprint", "tests"],
    });

    const allUsers = await this.userRepository.findAll();
    const allTests = await this.testRepository.findAll({
      relations: ["user", "ticket", "ticket.assignee"],
    });

    // 📦 PANEL 1: Ce qui a été mis en production hier
    const productionDeployments = this.getProductionDeployments(
      allTickets,
      yesterday,
      todayStart
    );

    // 👥 PANEL 2: Activité de l'équipe
    const teamActivity = this.getTeamActivity(
      allTickets,
      allUsers,
      command.userId,
      now
    );

    // 🧪 PANEL 3: Tests à faire
    const pendingTests = this.getPendingTests(allTests, command.userId);

    // 📋 PANEL 4: Mes tickets actifs (hors TODO et PRODUCTION)
    const myActiveTickets = this.getMyActiveTickets(
      allTickets,
      command.userId,
      now
    );

    // ❌ PANEL 5: Mes tests KO
    const myFailedTests = this.getMyFailedTests(allTickets, command.userId);

    // 🚨 PANEL 6: Mes tickets urgents (HIGH/CRITICAL)
    const myUrgentTickets = this.getMyUrgentTickets(
      allTickets,
      command.userId,
      now
    );

    // 🔔 PANEL 7: Alertes équipe (tickets bloqués et anciens)
    const teamAlerts = this.getTeamAlerts(allTickets, now);

    // 📊 PANEL 8: Résumé sprint actif
    const currentSprintSummary = await this.getCurrentSprintSummary(now);

    return {
      productionDeployments,
      teamActivity,
      pendingTests,
      myActiveTickets,
      myFailedTests,
      myUrgentTickets,
      teamAlerts,
      currentSprintSummary,
    };
  }

  /**
   * 📦 Récupère les déploiements en production d'hier
   */
  private getProductionDeployments(
    tickets: any[],
    yesterday: Date,
    todayStart: Date
  ) {
    const deployedYesterday = tickets
      .filter((t) => {
        if (t.status !== TicketStatus.PRODUCTION) return false;
        const updatedAt = new Date(t.updatedAt);
        return updatedAt >= yesterday && updatedAt < todayStart;
      })
      .map((t) => ({
        ticketId: t.id,
        ticketKey: t.key,
        title: t.title,
        deployedBy: {
          id: t.assignee?.id || t.creator.id,
          name: t.assignee
            ? `${t.assignee.firstName} ${t.assignee.lastName}`
            : `${t.creator.firstName} ${t.creator.lastName}`,
        },
        deployedAt: new Date(t.updatedAt),
        branch: t.branch || "N/A",
        pullRequestLink: t.pullRequestLink,
        priority: t.priority,
      }))
      .sort((a, b) => b.deployedAt.getTime() - a.deployedAt.getTime());

    return {
      yesterday: deployedYesterday,
      count: deployedYesterday.length,
    };
  }

  /**
   * 👥 Récupère l'activité de l'équipe (sans l'utilisateur courant)
   */
  private getTeamActivity(
    tickets: any[],
    users: any[],
    currentUserId: number,
    now: Date
  ) {
    const activeStatuses = [
      TicketStatus.IN_PROGRESS,
      TicketStatus.REVIEW,
      TicketStatus.CHANGE_REQUEST,
      TicketStatus.TEST,
      TicketStatus.TEST_KO,
      TicketStatus.TEST_OK,
    ];

    const otherUsers = users.filter((u) => u.id !== currentUserId);

    const members = otherUsers
      .map((user) => {
        const userTickets = tickets
          .filter(
            (t) =>
              t.assignee?.id === user.id && activeStatuses.includes(t.status)
          )
          .map((t) => {
            const updatedAt = new Date(t.updatedAt);
            const daysSinceStarted = Math.floor(
              (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
              ticketId: t.id,
              ticketKey: t.key,
              title: t.title,
              status: t.status,
              priority: t.priority,
              daysSinceStarted,
            };
          })
          .sort((a, b) => b.priority.localeCompare(a.priority));

        return {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          currentTickets: userTickets,
          ticketCount: userTickets.length,
        };
      })
      .filter((m) => m.ticketCount > 0)
      .sort((a, b) => b.ticketCount - a.ticketCount);

    const totalActiveTickets = members.reduce(
      (sum, m) => sum + m.ticketCount,
      0
    );

    return {
      members,
      totalActiveTickets,
    };
  }

  /**
   * 🧪 Récupère les tests en attente (non validés)
   */
  private getPendingTests(tests: any[], currentUserId: number) {
    const pending = tests
      .filter((test) => !test.isValidated)
      .map((test) => ({
        testId: test.id,
        ticketId: test.ticket.id,
        ticketKey: test.ticket.key,
        ticketTitle: test.ticket.title,
        description: test.description,
        createdBy: {
          id: test.user.id,
          name: `${test.user.firstName} ${test.user.lastName}`,
        },
        createdAt: new Date(test.createdAt),
        priority: test.ticket.priority,
        hasImages: test.images && test.images.length > 0,
      }))
      .sort((a, b) => {
        // Prioriser par priorité puis par date
        if (a.priority !== b.priority) {
          return b.priority.localeCompare(a.priority);
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

    return {
      tests: pending,
      count: pending.length,
    };
  }

  /**
   * 📋 Récupère mes tickets actifs (hors TODO et PRODUCTION)
   */
  private getMyActiveTickets(tickets: any[], userId: number, now: Date) {
    const excludedStatuses = [TicketStatus.TODO, TicketStatus.PRODUCTION];

    const myTickets = tickets
      .filter(
        (t) =>
          t.assignee?.id === userId && !excludedStatuses.includes(t.status)
      )
      .map((t) => {
        const updatedAt = new Date(t.updatedAt);
        const daysSinceLastUpdate = Math.floor(
          (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ticketId: t.id,
          ticketKey: t.key,
          title: t.title,
          status: t.status,
          priority: t.priority,
          difficultyPoints: t.difficultyPoints,
          isBlocked: t.isBlocked,
          blockedReason: t.blockedReason,
          daysSinceLastUpdate,
          hasTests: t.tests && t.tests.length > 0,
          testCount: t.tests ? t.tests.length : 0,
          branch: t.branch,
        };
      })
      .sort((a, b) => {
        // Bloqués en premier, puis par priorité
        if (a.isBlocked !== b.isBlocked) {
          return a.isBlocked ? -1 : 1;
        }
        return b.priority.localeCompare(a.priority);
      });

    const byStatus: Record<TicketStatus, number> = {} as any;
    Object.values(TicketStatus).forEach((status) => {
      byStatus[status] = myTickets.filter((t) => t.status === status).length;
    });

    const totalPoints = myTickets.reduce(
      (sum, t) => sum + t.difficultyPoints,
      0
    );

    return {
      tickets: myTickets,
      byStatus,
      totalPoints,
    };
  }

  /**
   * ❌ Récupère mes tickets avec tests KO
   */
  private getMyFailedTests(tickets: any[], userId: number) {
    const ticketsWithFailedTests = tickets
      .filter(
        (t) =>
          t.assignee?.id === userId &&
          (t.status === TicketStatus.TEST_KO ||
            (t.tests &&
              t.tests.some((test: any) => !test.isValidated)))
      )
      .map((t) => {
        const failedTests = (t.tests || [])
          .filter((test: any) => !test.isValidated)
          .map((test: any) => ({
            testId: test.id,
            description: test.description,
            createdAt: new Date(test.createdAt),
          }));

        return {
          ticketId: t.id,
          ticketKey: t.key,
          title: t.title,
          failedTests,
          failedTestCount: failedTests.length,
        };
      })
      .filter((t) => t.failedTestCount > 0)
      .sort((a, b) => b.failedTestCount - a.failedTestCount);

    const totalFailedTests = ticketsWithFailedTests.reduce(
      (sum, t) => sum + t.failedTestCount,
      0
    );

    return {
      tickets: ticketsWithFailedTests,
      totalFailedTests,
    };
  }

  /**
   * 🚨 Récupère mes tickets urgents (CRITICAL et HIGH)
   */
  private getMyUrgentTickets(tickets: any[], userId: number, now: Date) {
    const myUrgentTickets = tickets.filter(
      (t) =>
        t.assignee?.id === userId &&
        (t.priority === TicketPriority.CRITICAL ||
          t.priority === TicketPriority.HIGH) &&
        t.status !== TicketStatus.PRODUCTION
    );

    const critical = myUrgentTickets
      .filter((t) => t.priority === TicketPriority.CRITICAL)
      .map((t) => this.mapUrgentTicket(t, now));

    const high = myUrgentTickets
      .filter((t) => t.priority === TicketPriority.HIGH)
      .map((t) => this.mapUrgentTicket(t, now));

    return {
      critical,
      high,
      totalUrgent: critical.length + high.length,
    };
  }

  private mapUrgentTicket(ticket: any, now: Date) {
    const createdAt = new Date(ticket.createdAt);
    const daysSinceCreated = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      ticketId: ticket.id,
      ticketKey: ticket.key,
      title: ticket.title,
      status: ticket.status,
      daysSinceCreated,
      isBlocked: ticket.isBlocked,
    };
  }

  /**
   * 🔔 Récupère les alertes d'équipe (tickets bloqués et anciens)
   */
  private getTeamAlerts(tickets: any[], now: Date) {
    const STALE_THRESHOLD_DAYS = 7;

    // Tickets bloqués
    const blockedTickets = tickets
      .filter((t) => t.isBlocked && t.status !== TicketStatus.PRODUCTION)
      .map((t) => {
        const updatedAt = new Date(t.updatedAt);
        const daysSinceBlocked = Math.floor(
          (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ticketId: t.id,
          ticketKey: t.key,
          title: t.title,
          assignee: t.assignee
            ? {
                id: t.assignee.id,
                name: `${t.assignee.firstName} ${t.assignee.lastName}`,
              }
            : null,
          blockedReason: t.blockedReason || "Raison non spécifiée",
          priority: t.priority,
          daysSinceBlocked,
        };
      })
      .filter((t) => t.assignee !== null)
      .sort((a, b) => b.daysSinceBlocked - a.daysSinceBlocked);

    // Tickets anciens (pas mis à jour depuis 7+ jours)
    const staleTickets = tickets
      .filter((t) => {
        if (
          t.status === TicketStatus.PRODUCTION ||
          t.status === TicketStatus.TODO
        )
          return false;
        const updatedAt = new Date(t.updatedAt);
        const daysSinceLastUpdate = Math.floor(
          (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceLastUpdate >= STALE_THRESHOLD_DAYS;
      })
      .map((t) => {
        const updatedAt = new Date(t.updatedAt);
        const daysSinceLastUpdate = Math.floor(
          (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ticketId: t.id,
          ticketKey: t.key,
          title: t.title,
          assignee: t.assignee
            ? {
                id: t.assignee.id,
                name: `${t.assignee.firstName} ${t.assignee.lastName}`,
              }
            : null,
          status: t.status,
          daysSinceLastUpdate,
        };
      })
      .sort((a, b) => b.daysSinceLastUpdate - a.daysSinceLastUpdate)
      .slice(0, 10);

    return {
      blockedTickets,
      staleTickets,
    };
  }

  /**
   * 📊 Récupère le résumé du sprint actif
   */
  private async getCurrentSprintSummary(now: Date) {
    const activeSprints = await this.sprintRepository.findAll({
      relations: ["tickets"],
    });

    const currentSprint = activeSprints.find(
      (s) => s.startDate <= now && s.endDate >= now
    );

    if (!currentSprint) {
      return {
        sprintName: null,
        daysRemaining: null,
        completionPercentage: 0,
        velocity: 0,
        burndownTrend: null,
      };
    }

    const completedStatuses = [TicketStatus.TEST_OK, TicketStatus.PRODUCTION];
    const totalPoints = currentSprint.tickets.reduce(
      (sum, t) => sum + t.difficultyPoints,
      0
    );
    const completedPoints = currentSprint.tickets
      .filter((t) => completedStatuses.includes(t.status))
      .reduce((sum, t) => sum + t.difficultyPoints, 0);

    const completionPercentage =
      totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    const daysRemaining = Math.ceil(
      (currentSprint.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const sprintDuration = Math.ceil(
      (currentSprint.endDate.getTime() - currentSprint.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysElapsed = sprintDuration - daysRemaining;
    const expectedCompletion =
      daysElapsed > 0 ? (daysElapsed / sprintDuration) * 100 : 0;

    let burndownTrend: "ahead" | "on-track" | "behind" | null = null;
    if (completionPercentage > expectedCompletion + 10) {
      burndownTrend = "ahead";
    } else if (completionPercentage < expectedCompletion - 10) {
      burndownTrend = "behind";
    } else {
      burndownTrend = "on-track";
    }

    const velocity =
      daysElapsed > 0
        ? Math.round((completedPoints / daysElapsed) * 10) / 10
        : 0;

    return {
      sprintName: currentSprint.name,
      daysRemaining,
      completionPercentage,
      velocity,
      burndownTrend,
    };
  }
}