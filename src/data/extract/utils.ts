import cheerio, { CheerioAPI } from "cheerio";
import fetch from "node-fetch";

export class RecaptchaError extends Error {}

export const cheerioFromPage = async (url: string): Promise<CheerioAPI> => {
  const response = await fetch(url, {
    method: "GET",
  });
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
