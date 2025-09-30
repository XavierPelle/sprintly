import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { DashboardController } from "../../../application/controllers/DashboardController";
import { authMiddleware } from "../middlewares/AuthMiddleware";

/**
 * Router for dashboard endpoints
 */
export class DashboardRouter {
  constructor(private readonly controller: DashboardController) {}

  public plugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // GET /dashboard/project - Get project-wide dashboard
    fastify.get(
      "/project",
      { onRequest: [authMiddleware] },
      this.controller.getProjectDashboard.bind(this.controller)
    );
  };
}