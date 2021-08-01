import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveEventDateColumns1627793091953 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE players DROP COLUMN createdAt");
    await queryRunner.query("ALTER TABLE players DROP COLUMN updatedAt");

    await queryRunner.query("ALTER TABLE player_spells DROP COLUMN createdAt");
    await queryRunner.query("ALTER TABLE player_spells DROP COLUMN updatedAt");
  }

  public async down(): Promise<void> {
    // we don't use these columns
  }
}
