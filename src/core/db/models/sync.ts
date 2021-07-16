import { PlayerEntity, PlayerSpellEntity } from "./player";

export const syncDatabase = async () => {
  await PlayerEntity.sync();
  await PlayerSpellEntity.sync();
};
