import { userRepository } from "../repositories";

const getAll = () => userRepository.getAll();

const upsertUserWin = (userId: string) => userRepository.upsertUserWin(userId);

export const userService = {
  getAll,
  upsertUserWin,
};
