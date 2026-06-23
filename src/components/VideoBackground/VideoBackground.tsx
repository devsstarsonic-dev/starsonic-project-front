'use client';

import React, { useState, useCallback } from 'react';
import styles from './VideoBackground.module.css';
import { VideoBackgroundProps } from './VideoBackground.types';

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  src,
  poster,
  overlayOpacity = 0.3,
  overlayColor = 'rgba(0, 0, 0, 0.3)',
  className,
}) => {
  const [videoError, setVideoError] = useState(false);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  // Calcula a cor do overlay dinâmicamente
  const overlayStyle = {
    backgroundColor: overlayColor.includes('rgba')
      ? overlayColor.replace(/[\d.]+\)/, `${overlayOpacity})`)
      : overlayColor,
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      {!videoError ? (
        <>
          <video
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            poster={poster}
            onError={handleVideoError}
          >
            <source src={src} type="video/mp4" />
            Seu navegador não suporta vídeo HTML5.
          </video>
          <div className={styles.overlay} style={overlayStyle} />
        </>
      ) : (
        <div
          className={styles.fallback}
          style={{ backgroundColor: overlayColor }}
        />
      )}
    </div>
  );
};
