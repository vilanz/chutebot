const COMMON_SUFFIXES =
  "(FC|CF|SE|UC|CR|CF|CSD|FR|SC|AD|EC|ACF|FBPA|RSC|AS|Clube?|Club de| (SP)|CD)";

export const removeClubLabels = (clubName: string) =>
  // remove from beginning and end of name
  clubName
    .replace(new RegExp(`^${COMMON_SUFFIXES} `), "")
    .replace(new RegExp(` ${COMMON_SUFFIXES}$`), "");
