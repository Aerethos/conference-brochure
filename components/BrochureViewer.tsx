'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import Navigation from './Navigation';

const TOTAL_PAGES = 75;

export default function BrochureViewer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const goToNextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES) {
      setCurrentPage((prev) => prev + 1);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [currentPage]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (event.key === 'ArrowRight') {
        goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPreviousPage]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNextPage,
    onSwipedRight: goToPreviousPage,
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: true,
  });

  useEffect(() => {
    if (currentPage < TOTAL_PAGES) {
      const nextImg = new window.Image();
      nextImg.src = `/pages/page-${currentPage + 1}.jpg`;
    }
    if (currentPage > 1) {
      const prevImg = new window.Image();
      prevImg.src = `/pages/page-${currentPage - 1}.jpg`;
    }
  }, [currentPage]);

  const currentImageSrc = `/pages/page-${currentPage}.jpg`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div
        {...swipeHandlers}
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ touchAction: 'pan-y' }}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
            <div className="text-gray-400 text-lg">Loading page {currentPage}...</div>
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-8">
            <div className="text-red-500 text-xl font-semibold mb-2">
              Unable to load page {currentPage}
            </div>
            <div className="text-gray-600 text-sm">
              Please ensure the image file exists at:
            </div>
            <code className="text-xs bg-gray-200 px-3 py-1 rounded mt-2">
              /public/pages/page-{currentPage}.jpg
            </code>
          </div>
        )}

        <div
          className={`
            relative w-full transition-opacity duration-300
            ${imageLoaded ? 'opacity-100 animate-fade-in' : 'opacity-0'}
          `}
          style={{
            aspectRatio: '210 / 297',
            maxHeight: 'calc(100vh - 280px)',
          }}
        >
          <img
            src={currentImageSrc}
            alt={`Brochure page ${currentPage} of ${TOTAL_PAGES}`}
            className="w-full h-full object-contain"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              setImageError(true);
            }}
          />
        </div>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden pointer-events-none">
          <div className="bg-black/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            Swipe to navigate
          </div>
        </div>
      </div>

      <Navigation
        currentPage={currentPage}
        totalPages={TOTAL_PAGES}
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
      />

      <div className="hidden md:flex justify-center mt-6">
        <div className="text-sm text-gray-500 flex items-center gap-4">
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">←</kbd>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">→</kbd>
            <span>Use arrow keys to navigate</span>
          </span>
        </div>
      </div>
    </div>
  );
}
