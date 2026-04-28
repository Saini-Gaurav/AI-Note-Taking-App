import { UserModel } from "../models/user.model";

export class UserRepository {
  create(data: { email: string; name: string; passwordHash: string }) {
    return UserModel.create(data);
  }

  findByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() });
  }

  findById(id: string) {
    return UserModel.findById(id);
  }
}
