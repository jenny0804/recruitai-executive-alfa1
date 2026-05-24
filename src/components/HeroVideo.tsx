import React, { useRef, useCallback, useEffect, useState } from 'react';

const MOBILE_MEDIA_QUERY = '(max-width: 767px)';

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, []);

  return isMobile;
}

interface HeroVideoProps {
  src: string;
  mobileSrc?: string;
  poster?: string;
  onPlaybackStart?: () => void;
}

const HeroVideo: React.FC<HeroVideoProps> = ({ src, mobileSrc, poster, onPlaybackStart }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasNotified = useRef(false);
  const isMobile = useIsMobileViewport();

  const activeSrc = isMobile && mobileSrc ? mobileSrc : src;

  const handlePlaying = useCallback(() => {
    if (hasNotified.current) return;
    hasNotified.current = true;
    onPlaybackStart?.();
  }, [onPlaybackStart]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentPath = video.src
      ? new URL(video.src, window.location.origin).pathname
      : '';

    if (currentPath !== activeSrc) {
      video.src = activeSrc;
      video.load();
      video.play().catch(() => {
        /* autoplay puede bloquearse tras cambio de fuente */
      });
    }
  }, [activeSrc]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video
        ref={videoRef}
        src={activeSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        onPlaying={handlePlaying}
        className="h-full w-full object-cover max-md:object-[center_20%]"
      />
      <div
        className="absolute inset-0 z-10 bg-gradient-to-b from-black/5 via-transparent to-black/80 md:hidden"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-10 hidden md:block"
        style={{ background: 'rgba(0, 0, 0, 0.45)' }}
        aria-hidden
      />
    </div>
  );
};

export default HeroVideo;
