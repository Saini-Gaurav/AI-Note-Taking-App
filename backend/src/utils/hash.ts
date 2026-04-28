import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashValue = async (value: string): Promise<string> => bcrypt.hash(value, SALT_ROUNDS);
export const compareValue = async (value: string, hash: string): Promise<boolean> =>
  bcrypt.compare(value, hash);
