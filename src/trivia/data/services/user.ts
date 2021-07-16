import { RunResult } from "better-sqlite3";
import { User } from "../../../core/db";
import { UserRepository } from "../repositories";

class UserService {
  private userRepository = new UserRepository();

  getAll(): User[] {
    return this.userRepository.getAll();
  }

  upsertUserWin(userId: string): RunResult {
    return this.userRepository.upsertUserWin(userId);
  }
}

export const userService = new UserService();
