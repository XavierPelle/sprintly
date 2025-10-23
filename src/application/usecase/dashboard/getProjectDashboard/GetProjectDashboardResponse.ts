import { TicketPriority } from "../../../../domain/enums/TicketPriority";
import { TicketStatus } from "../../../../domain/enums/TicketStatus";

export interface GetProjectDashboardResponse {
  // 📦 Ce qui a été mis en production hier
  productionDeployments: {
    yesterday: Array<{
      ticketId: number;
      ticketKey: string;
      title: string;
      deployedBy: {
        id: number;
        name: string;
      };
      deployedAt: Date;
      branch: string;
      pullRequestLink: string | null;
      priority: TicketPriority;
    }>;
    count: number;
  };

  // 👥 Sur quoi travaillent les autres membres de l'équipe
  teamActivity: {
    members: Array<{
      userId: number;
      userName: string;
      currentTickets: Array<{
        ticketId: number;
        ticketKey: string;
        title: string;
        status: TicketStatus;
        priority: TicketPriority;
        daysSinceStarted: number;
      }>;
      ticketCount: number;
    }>;
    totalActiveTickets: number;
  };

  // 🧪 Tests à faire
  pendingTests: {
    tests: Array<{
      testId: number;
      ticketId: number;
      ticketKey: string;
      ticketTitle: string;
      description: string;
      createdBy: {
        id: number;
        name: string;
      };
      createdAt: Date;
      priority: TicketPriority;
      hasImages: boolean;
    }>;
    count: number;
  };

  // 📋 Mes tickets en cours (tous sauf TODO et PRODUCTION)
  myActiveTickets: {
    tickets: Array<{
      ticketId: number;
      ticketKey: string;
      title: string;
      status: TicketStatus;
      priority: TicketPriority;
      difficultyPoints: number;
      isBlocked: boolean;
      blockedReason: string | null;
      daysSinceLastUpdate: number;
      hasTests: boolean;
      testCount: number;
      branch: string | null;
    }>;
    byStatus: Record<TicketStatus, number>;
    totalPoints: number;
  };

  // ❌ Mes tests KO
  myFailedTests: {
    tickets: Array<{
      ticketId: number;
      ticketKey: string;
      title: string;
      failedTests: Array<{
        testId: number;
        description: string;
        createdAt: Date;
      }>;
      failedTestCount: number;
    }>;
    totalFailedTests: number;
  };

  // 🚨 Mes tickets prioritaires (HIGH et CRITICAL)
  myUrgentTickets: {
    critical: Array<{
      ticketId: number;
      ticketKey: string;
      title: string;
      status: TicketStatus;
      daysSinceCreated: number;
      isBlocked: boolean;
    }>;
    high: Array<{
      ticketId: number;
      ticketKey: string;
      title: string;
      status: TicketStatus;
      daysSinceCreated: number;
      isBlocked: boolean;
    }>;
    totalUrgent: number;
  };

  // 🔔 Alertes et blocages d'équipe
  teamAlerts: {
    blockedTickets: Array<{
      ticketId: number;
      ticketKey: string;
      title: string;
      assignee: {
        id: number;
        name: string;
      };
      blockedReason: string;
      priority: TicketPriority;
      daysSinceBlocked: number;
    }>;
    staleTickets: Array<{
      ticketId: number;
      ticketKey: string;
      title: string;
      assignee: {
        id: number;
        name: string;
      } | null;
      status: TicketStatus;
      daysSinceLastUpdate: number;
    }>;
  };

  // 📊 Résumé du sprint actif
  currentSprintSummary: {
    sprintName: string | null;
    daysRemaining: number | null;
    completionPercentage: number;
    velocity: number;
    burndownTrend: "ahead" | "on-track" | "behind" | null;
  };
}