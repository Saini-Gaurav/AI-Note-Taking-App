import { Context, Next } from "hono";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/errors";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository();

export const authMiddleware = async (c: Context, next: Next): Promise<void> => {
  const authorization = c.req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError("Missing bearer token", 401, "UNAUTHORIZED");
  }

  const token = authorization.slice("Bearer ".length);
  const payload = verifyAccessToken(token);
  const user = await userRepository.findById(payload.sub);

  if (!user) throw new AppError("User not found", 401, "UNAUTHORIZED");

  c.set("currentUser", { id: user._id.toString(), email: user.email, name: user.name });
  await next();
};
