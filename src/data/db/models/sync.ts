import { PlayerEntity, PlayerSpellEntity } from "./player";
import { UserEntity } from "./user";

export const syncDatabaseModels = async () => {
  await PlayerEntity.sync();
  await PlayerSpellEntity.sync();
  await UserEntity.sync();
};
