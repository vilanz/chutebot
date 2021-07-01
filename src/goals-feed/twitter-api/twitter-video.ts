import { mapAxiosData, twitterOldAPI } from "./axios";

export const getTweetVideoUrl = async (
  tweetId: number
): Promise<string | null> => {
  const expandedTweet: any = await twitterOldAPI
    .get(`/statuses/show/${tweetId}.json`)
    .then(mapAxiosData);

  const media = expandedTweet.extended_entities?.media?.[0];
  if (!media) {
    return null;
  }

  const variants = media.video_info?.variants;
  if (!variants) {
    return null;
  }

  const mp4 = variants
    .filter((x: any) => x.content_type === "video/mp4")
    .reduce((max: any, curr: any) => (max.bitrate > curr.bitrate ? max : curr));
  if (!mp4) {
    return null;
  }

  return mp4.url;
};
