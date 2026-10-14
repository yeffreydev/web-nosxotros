'use client';

import { useState } from 'react';

/**
 * Galería de la portada (1 a 5 imágenes): foto grande + miniaturas. Con una
 * sola foto se ve igual que la portada de siempre.
 */
export function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const current = photos[idx] ?? photos[0];

  return (
    <div className="photoGallery">
      <div className="detailHero" style={{ backgroundImage: `url(${current})` }} role="img" aria-label={alt} />
      {photos.length > 1 && (
        <div className="photoGalleryThumbs" role="group" aria-label="Fotos de la iniciativa">
          {photos.map((url, i) => (
            <button
              key={url}
              type="button"
              className={`photoGalleryThumb ${i === idx ? 'photoGalleryThumbOn' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Ver foto ${i + 1} de ${photos.length}`}
              aria-pressed={i === idx}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
