// infrastructure/http/middlewares/authMiddleware.ts
import { FastifyRequest, FastifyReply } from "fastify";
import * as jwt from "jsonwebtoken";

/**
 * Payload décodé du JWT
 */
export interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Extension du FastifyRequest pour inclure l'utilisateur authentifié
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * Middleware d'authentification JWT
 * Vérifie la validité du token et ajoute l'utilisateur au request
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Récupérer le token du header Authorization
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        success: false,
        message: 'No authorization header provided'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Vérifier et décoder le token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Ajouter l'utilisateur au request pour les prochains handlers
    request.user = decoded;

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return reply.status(401).send({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return reply.status(500).send({
      success: false,
      message: 'Authentication error'
    });
  }
}

/**
 * Middleware optionnel : vérifie que l'utilisateur modifie ses propres données
 * À utiliser sur les routes /users/:id/...
 */
export async function checkOwnership(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
): Promise<void> {
  const resourceUserId = Number(request.params.id);
  const currentUserId = request.user?.userId;

  if (!currentUserId) {
    return reply.status(401).send({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (currentUserId !== resourceUserId) {
    return reply.status(403).send({
      success: false,
      message: 'Forbidden: You can only access your own resources'
    });
  }
}

/**
 * Middleware optionnel : vérifie le rôle admin
 * À créer si vous ajoutez un système de rôles
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // TODO: Ajouter la vérification du rôle depuis la DB ou le token
  // const user = await userRepository.findById(request.user!.userId);
  // if (user.role !== 'ADMIN') { ... }
}