import betterSqlite3 from "better-sqlite3";

export const db = betterSqlite3("./db/db.sqlite");
db.pragma("synchronous = NORMAL");
db.pragma("journal_mode = WAL");
