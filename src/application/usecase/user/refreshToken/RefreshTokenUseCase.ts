import { AbstractUseCase } from "../../../common/usecase/AbstractUseCase";
import { RefreshTokenCommand } from "./RefreshTokenCommand";
import { RefreshTokenResponse } from "./RefreshTokenResponse";
import { UserRepository } from "../../../../domain/repositories/UserRepository";
import { ApplicationException } from "../../../common/exceptions/ApplicationException";
import * as jwt from "jsonwebtoken";

/**
 * Use case to refresh access token using refresh token
 */
export class RefreshTokenUseCase extends AbstractUseCase<
  RefreshTokenCommand,
  RefreshTokenResponse
> {
  protected static commandClass = RefreshTokenCommand;

  private readonly JWT_SECRET = process.env.JWT_SECRET;
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  private readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  protected async doExecute(
    command: RefreshTokenCommand
  ): Promise<Partial<RefreshTokenResponse>> {
    
    try {
      const decoded = jwt.verify(
        command.refreshToken,
        this.JWT_REFRESH_SECRET
      ) as { userId: number; email: string };

      const user = await this.userRepository.findById(decoded.userId);
      if (!user) {
        throw new ApplicationException('USER_NOT_FOUND', { 
          userId: decoded.userId 
        }, 'AUTH_003');
      }

      const payload = {
        userId: user.id,
        email: user.email
      };

      const accessToken = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRES_IN
      });

      const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN
      });

      return {
        accessToken,
        refreshToken,
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApplicationException('INVALID_REFRESH_TOKEN', {}, 'AUTH_004');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApplicationException('REFRESH_TOKEN_EXPIRED', {}, 'AUTH_005');
      }
      throw error;
    }
  }
}