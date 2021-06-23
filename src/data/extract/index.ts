import { cheerioFromPage, toArrayOfCheerios } from "./utils";

export * from "./playmakerstats";

type ClubAndSeasonKey = string;
type Career = Map<ClubAndSeasonKey, any>;

const parseNumberColumn = (str: string) => (str === "-" ? 0 : +str);

export const logStuffTransfermarkt = async (): Promise<Career> => {
  const careerUrl = `https://www.transfermarkt.com.br/taison/leistungsdatendetails/spieler/76028/verein/0/liga/0/wettbewerb//pos/0/trainer_id/0`;
  const ch = await cheerioFromPage(careerUrl);

  const career: Career = new Map<ClubAndSeasonKey, any>();

  const rows = toArrayOfCheerios(ch(".grid-view table.items tbody tr"));
  rows.forEach((tr) => {
    const columns = toArrayOfCheerios(tr.find("td"));

    const [season, , , club, matches, , goals] = columns;

    const clubName = club.find("img").attr("alt")!;
    const clubSeason = season.text();
    const careerKey = `${clubName}-${clubSeason}`;

    const previousAtClubThisSeason = career.get(careerKey) ?? {
      matches: 0,
      goals: 0,
    };

    career.set(careerKey, {
      matches:
        previousAtClubThisSeason.matches + parseNumberColumn(matches.text()),
      goals: previousAtClubThisSeason.goals + parseNumberColumn(goals.text()),
    });
  });

  return career;
};
