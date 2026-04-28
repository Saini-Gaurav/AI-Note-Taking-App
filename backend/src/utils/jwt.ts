import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env";
import { AppError } from "./errors";
import { JwtAccessPayload, JwtRefreshPayload } from "../types";

export const signAccessToken = (userId: string, email: string): string =>
  jwt.sign({ sub: userId, email, type: "access" }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  });

export const signRefreshToken = (userId: string, email: string): { token: string; jti: string } => {
  const jti = randomUUID();
  const token = jwt.sign({ sub: userId, email, type: "refresh", jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  });
  return { token, jti };
};

export const verifyAccessToken = (token: string): JwtAccessPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
  } catch {
    throw new AppError("Invalid or expired access token", 401, "INVALID_ACCESS_TOKEN");
  }
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
  } catch {
    throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
  }
};
