import { PlayerEntity, PlayerSpellEntity } from "./player";
import { UserEntity } from "./user";

export const syncDatabase = async () => {
  await PlayerEntity.sync();
  await PlayerSpellEntity.sync();
  await UserEntity.sync();
};
