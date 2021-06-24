import cheerio, { Cheerio, CheerioAPI, Node, Element } from "cheerio";
import fetch from "node-fetch";
import { log } from "../../log";

export class RecaptchaError extends Error {}

export const cheerioFromPage = async (url: string): Promise<CheerioAPI> => {
  const response = await fetch(url, {
    method: "GET",
  });
  log("cheerio", response.url);
  if (response.url.includes("recaptcha.php")) {
    throw new RecaptchaError();
  }
  const html = await response.text();
  return cheerio.load(html);
};

export const getQueryParamFromRelativeUrl = (
  relativeUrl: string,
  param: string
) => new URL(`https://localhost/${relativeUrl}`).searchParams.get(param);

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
