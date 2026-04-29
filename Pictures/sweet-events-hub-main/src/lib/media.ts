export const VIDEO_EXT = ["mp4", "webm", "mov", "m4v", "ogv"];

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return VIDEO_EXT.some((ext) => clean.endsWith("." + ext));
}

export type MediaKind = "image" | "video";

export function mediaKind(url: string): MediaKind {
  return isVideoUrl(url) ? "video" : "image";
}
