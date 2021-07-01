import cheerio, { Cheerio, CheerioAPI, Node, Element } from "cheerio";
import UserAgent from "user-agents";
import fetch from "node-fetch";
import { logger } from "../../core/log";

const getRandomUserAgent = () =>
  new UserAgent({ platform: "Win32", deviceCategory: "desktop" }).toString();

export const getCheerioFromPageHTML = async (
  url: string
): Promise<CheerioAPI> => {
  const transfermarktUrl = `https://www.transfermarkt.com.br${url}`;
  const response = await fetch(transfermarktUrl, {
    method: "GET",
    headers: {
      "User-Agent": getRandomUserAgent(),
    },
  });
  logger.info("got Transfermarkt response", {
    status: response.status,
    statusText: response.statusText,
    url: response.url,
  });
  const html = await response.text();
  return cheerio.load(html);
};

export const mapCheerioNodesList = (
  cheerioElements: Cheerio<Element>
): Cheerio<Node>[] => cheerioElements.map((_, el) => cheerio(el)).toArray();

export const parseNumberFromNode = (node: Cheerio<Node>): number => {
  const text = node.text();
  if (text === "-") {
    return 0;
  }
  return +text;
};

export const getQueryParamFromRelativeUrl = (
  relativeUrl: string,
  param: string
) => new URL(`https://localhost/${relativeUrl}`).searchParams.get(param);

export const getTransfermarktPlayerCareerUrl = (transfermarktId: number) =>
  `/geosmina/leistungsdatendetails/spieler/${transfermarktId}`;

export const getPlayerSearchUrl = (query: string) =>
  `/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(query)}`;
