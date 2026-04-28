import dayjs from "dayjs";
import { RefreshTokenModel } from "../models/refresh-token.model";

export class RefreshTokenRepository {
  save(data: { userId: string; tokenHash: string; jti: string; expiresAt: Date }) {
    return RefreshTokenModel.create(data);
  }

  findActiveByJti(jti: string) {
    return RefreshTokenModel.findOne({ jti, revoked: false, expiresAt: { $gt: dayjs().toDate() } });
  }

  revokeByJti(jti: string) {
    return RefreshTokenModel.updateOne({ jti }, { $set: { revoked: true } });
  }
}
