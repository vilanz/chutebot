import { log } from "../../log";
import { cheerioFromPage, getQueryParamFromRelativeUrl } from "./utils";

export const getPlayerPlaymakerstatsId = async (
  playerName: string
): Promise<string | null> => {
  const encodedPlayerName = encodeURIComponent(playerName);
  const searchParams = `?search_string=${encodedPlayerName}&op=all`;
  const searchPlayerUrl = `https://playmakerstats.com/search_player.php${searchParams}`;

  log("playmakerstats", `Going to ${searchPlayerUrl}`);

  const ch = await cheerioFromPage(searchPlayerUrl);

  const playerProfileUrl = ch(
    "#page_main table:not(.stats) td:first-child a"
  ).attr("href");
  if (!playerProfileUrl) {
    log("playmakerstats", `No player url found in ${searchPlayerUrl}`);
    return null;
  }
  log(
    "playmakerstats",
    `Extracting id for ${playerName} from URL ${playerProfileUrl}`
  );
  return getQueryParamFromRelativeUrl(playerProfileUrl, "id");
};
