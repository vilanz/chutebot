import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServerIdColumn1628122640115 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE players ADD COLUMN serverId VARCHAR");
    await queryRunner.query(
      "ALTER TABLE player_spells ADD COLUMN serverId VARCHAR"
    );
    await queryRunner.query("ALTER TABLE users ADD COLUMN serverId VARCHAR");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE players DROP COLUMN serverId");
    await queryRunner.query("ALTER TABLE player_spells DROP COLUMN serverId");
    await queryRunner.query("ALTER TABLE users DROP COLUMN serverId");
  }
}
