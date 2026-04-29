import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { isVideoUrl } from "@/lib/media";

type Props = {
  url: string;
  alt?: string;
  className?: string;
  /** When true, video element is rendered (lazy via IntersectionObserver). */
  enableVideo?: boolean;
};

/**
 * Renders an image or a video thumbnail with a play button overlay.
 * Videos lazy-load only when scrolled into view; clicking plays inline (muted=false).
 */
export function MediaItem({ url, alt = "", className = "", enableVideo = true }: Props) {
  const isVideo = isVideoUrl(url);
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!isVideo || !enableVideo) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isVideo, enableVideo]);

  if (!isVideo) {
    return (
      <img
        src={url}
        alt={alt}
        loading="lazy"
        className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${className}`}
      />
    );
  }

  return (
    <div ref={ref} className={`relative h-full w-full ${className}`}>
      {visible ? (
        <video
          ref={videoRef}
          src={url}
          playsInline
          preload="metadata"
          controls={playing}
          muted={!playing}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
      ) : (
        <div className="h-full w-full bg-muted" />
      )}
      {!playing && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            const v = videoRef.current;
            if (v) {
              v.muted = false;
              void v.play();
            }
          }}
          className="absolute inset-0 grid place-items-center bg-black/15 transition group-hover:bg-black/30"
          aria-label="Play video"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-background/95 shadow-lg backdrop-blur transition group-hover:scale-110">
            <Play className="h-6 w-6 translate-x-0.5 fill-foreground text-foreground" />
          </span>
        </button>
      )}
    </div>
  );
}
