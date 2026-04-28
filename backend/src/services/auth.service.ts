import dayjs from "dayjs";
import ms from "ms";
import { UserRepository } from "../repositories/user.repository";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";
import { AppError } from "../utils/errors";
import { compareValue, hashValue } from "../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AuthTokens, UserSafe } from "../types";
import { env } from "../config/env";

export class AuthService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly refreshTokenRepository = new RefreshTokenRepository()
  ) {}

  async register(input: { email: string; name: string; password: string }): Promise<{
    user: UserSafe;
    accessToken: string;
    refreshToken: string;
  }> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new AppError("Email already in use", 409, "EMAIL_TAKEN");

    const passwordHash = await hashValue(input.password);
    const user = await this.userRepository.create({ email: input.email, name: input.name, passwordHash });

    const tokens = await this.issueTokens(user._id.toString(), user.email);
    return {
      user: this.toSafeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(input: { email: string; password: string }): Promise<{
    user: UserSafe;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

    const ok = await compareValue(input.password, user.passwordHash);
    if (!ok) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

    const tokens = await this.issueTokens(user._id.toString(), user.email);
    return {
      user: this.toSafeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = verifyRefreshToken(refreshToken);
    const stored = await this.refreshTokenRepository.findActiveByJti(payload.jti);
    if (!stored) throw new AppError("Refresh token revoked or missing", 401, "REFRESH_REVOKED");

    const matches = await compareValue(refreshToken, stored.tokenHash);
    if (!matches) {
      await this.refreshTokenRepository.revokeByJti(payload.jti);
      throw new AppError("Refresh token mismatch", 401, "REFRESH_MISMATCH");
    }

    await this.refreshTokenRepository.revokeByJti(payload.jti);
    return this.issueTokens(payload.sub, payload.email);
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = verifyRefreshToken(refreshToken);
    await this.refreshTokenRepository.revokeByJti(payload.jti);
  }

  async me(userId: string): Promise<UserSafe> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    return this.toSafeUser(user);
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = signAccessToken(userId, email);
    const refresh = signRefreshToken(userId, email);
    const tokenHash = await hashValue(refresh.token);
    const ttlMs = ms(env.JWT_REFRESH_EXPIRES_IN);
    await this.refreshTokenRepository.save({
      userId,
      tokenHash,
      jti: refresh.jti,
      expiresAt: dayjs().add(ttlMs, "millisecond").toDate()
    });
    return { accessToken, refreshToken: refresh.token };
  }

  private toSafeUser(user: { _id: unknown; email: string; name: string; createdAt: Date; updatedAt: Date }): UserSafe {
    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
