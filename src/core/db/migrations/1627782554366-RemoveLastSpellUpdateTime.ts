import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Remove timezones from LastSpellsUpdate
 * Ex: 2021-07-06 02:08:15.392 +00:00 -> 2021-07-06 02:08:15
 * TypeORM's better-sqlite3 complains about the first form, and it's more compact as well
 */
export class RemoveLastSpellUpdateTime1627782554366
  implements MigrationInterface
{
  name = "RemoveLastSpellUpdateTime1627782554366";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE players SET lastSpellsUpdate = DATETIME(LastSpellsUpdate)"
    );
  }

  public async down(): Promise<void> {
    // this is backwards compatible
  }
}
