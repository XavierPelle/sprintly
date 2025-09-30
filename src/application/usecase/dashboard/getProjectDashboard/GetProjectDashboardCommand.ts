import { Command } from "../../../common/usecase/Command";

/**
 * Command to get project-wide dashboard
 * No parameters needed as it's a global view
 */
export class GetProjectDashboardCommand implements Command {
  constructor(public readonly includeHistorical: boolean = false) {}

  validate(): void {
    // No validation needed
  }
}