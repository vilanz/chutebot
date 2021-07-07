import { logger } from "../../core/log";
import { mapAxiosData, twitterOldAPI } from "./axios";

// shamelessly stolen from PLhery/node-twitter-api-v2
interface DetailedTweet {
  extended_entities?: {
    media?: Array<{
      type: "photo" | "video" | "animated_gif";
      video_info?: {
        aspect_ratio: [number, number];
        variants: Array<{
          bitrate: number;
          content_type: string;
          url: string;
        }>;
      };
    }>;
  };
}

export const getTweetVideoUrl = async (
  tweetId: string
): Promise<string | null> => {
  const detailedTweet: DetailedTweet = await twitterOldAPI
    .get(`/statuses/show.json?id=${tweetId}`)
    .then(mapAxiosData);

  const videoVariants = detailedTweet.extended_entities?.media?.find(
    (m) => m.type === "video"
  )?.video_info?.variants;

  if (!videoVariants?.length) {
    logger.warn(
      "no video variants found for tweet %s with entites %O",
      tweetId,
      detailedTweet.extended_entities
    );
    return null;
  }

  const allMp4s = videoVariants.filter(
    (x: any) => x.content_type === "video/mp4"
  );
  const mp4WithhighestBitrate = allMp4s.reduce((max: any, curr: any) =>
    max.bitrate > curr.bitrate ? max : curr
  );

  if (!mp4WithhighestBitrate) {
    logger.warn(
      "couldn't find mp4 with highest bitrate for tweet %s with variants %O",
      tweetId,
      videoVariants
    );
    return null;
  }

  return mp4WithhighestBitrate.url;
};
