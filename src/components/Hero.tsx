import React, { useState, useRef, useCallback, useEffect } from 'react';
import HeroVideo from './HeroVideo';
import HeroContent from './HeroContent';

const CONTENT_DELAY_MS = 2000;

interface HeroProps {
  videoSrc: string;
  mobileVideoSrc?: string;
  posterSrc?: string;
  onPrimaryClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ 
  videoSrc,
  mobileVideoSrc,
  posterSrc, 
  onPrimaryClick, 
}) => {
  const [showContent, setShowContent] = useState(false);
  const contentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlaybackStart = useCallback(() => {
    contentTimerRef.current = setTimeout(() => {
      setShowContent(true);
    }, CONTENT_DELAY_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
    };
  }, []);

  return (
    <section 
      className="relative w-full overflow-hidden h-[100dvh] min-h-[80vh] max-md:max-h-[100dvh] lg:h-screen"
      aria-label="Hero Section"
    >
      <HeroVideo
        src={videoSrc}
        mobileSrc={mobileVideoSrc}
        poster={posterSrc}
        onPlaybackStart={handlePlaybackStart}
      />
      <HeroContent 
        isVisible={showContent}
        onPrimaryClick={onPrimaryClick} 
      />
    </section>
  );
};

export default Hero;
