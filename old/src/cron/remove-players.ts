import { subWeeks } from "date-fns";
import cron from "node-cron";
import { LessThanOrEqual } from "typeorm";
import { PlayerEntity, PlayerSpellEntity } from "../db";
import { sendBotspamMessage } from "../discord";
import { logger } from "../log";

export const removeOutdatedPlayersEveryMonth = () => {
  cron.schedule("0 0 3 * *", async () => {
    logger.info("removing old players");
    await sendBotspamMessage(
      "> Removendo passagens de jogadores desatualizadas há mais de 4 semanas..."
    );

    const fourWeeksAgo = subWeeks(new Date(), 4);
    const outdatedPlayers = await PlayerEntity.find({
      select: ["transfermarktId", "lastSpellsUpdate"],
      where: {
        lastSpellsUpdate: LessThanOrEqual(fourWeeksAgo.toISOString()),
      },
    });

    const deleteResult = await PlayerSpellEntity.createQueryBuilder()
      .delete()
      .where("playerTransfermarktId IN (:...outdatedPlayerIds)", {
        outdatedPlayerIds: outdatedPlayers.map((x) => x.transfermarktId),
      })
      .execute();

    await Promise.all(
      outdatedPlayers.map(async (op) => {
        // eslint-disable-next-line no-param-reassign
        op.lastSpellsUpdate = new Date();
        await op.save();
      })
    );

    await sendBotspamMessage(
      `> ${deleteResult.affected} passagens desatualizadas (de ${outdatedPlayers.length} jogadores) removidas.`
    );
  });
};
