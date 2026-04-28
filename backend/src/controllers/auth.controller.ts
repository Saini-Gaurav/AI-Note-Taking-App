import { Context } from "hono";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  register = async (c: Context) => {
    const body = c.get("validated:json") as { email: string; name: string; password: string };
    const result = await authService.register(body);
    return c.json(result, 201);
  };

  login = async (c: Context) => {
    const body = c.get("validated:json") as { email: string; password: string };
    const result = await authService.login(body);
    return c.json(result);
  };

  refresh = async (c: Context) => {
    const body = c.get("validated:json") as { refreshToken: string };
    const tokens = await authService.refresh(body.refreshToken);
    return c.json(tokens);
  };

  logout = async (c: Context) => {
    const body = c.get("validated:json") as { refreshToken: string };
    await authService.logout(body.refreshToken);
    return c.json({ success: true });
  };

  me = async (c: Context) => {
    const currentUser = c.get("currentUser") as { id: string };
    const user = await authService.me(currentUser.id);
    return c.json(user);
  };
}
