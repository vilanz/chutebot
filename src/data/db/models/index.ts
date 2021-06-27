import { PlayerEntity } from "./player";

export const syncDatabaseModels = () => PlayerEntity.sync();

export { PlayerEntity };
