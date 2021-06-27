import { PlayerEntity } from "./player";
import { UserEntity } from "./user";

export const syncDatabaseModels = async () => {
  await PlayerEntity.sync();
  await UserEntity.sync();
};
