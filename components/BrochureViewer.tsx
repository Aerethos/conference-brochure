'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import Navigation from './Navigation';

const TOTAL_PAGES = 77;

export default function BrochureViewer() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);

  const goToNextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1 && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 600);
    }
  }, [currentPage, isFlipping]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 600);
    }
  }, [currentPage, isFlipping]);

  // Keyboard navigation
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

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNextPage,
    onSwipedRight: goToPreviousPage,
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: true,
  });

  // Preload adjacent pages
  useEffect(() => {
    if (currentPage < TOTAL_PAGES - 1) {
      const nextImg = new window.Image();
      nextImg.src = `/pages/page-${currentPage + 1}.jpg`;
    }
    if (currentPage > 0) {
      const prevImg = new window.Image();
      prevImg.src = `/pages/page-${currentPage - 1}.jpg`;
    }
  }, [currentPage]);

  const currentImageSrc = `/pages/page-${currentPage}.jpg`;
  const nextImageSrc = currentPage < TOTAL_PAGES - 1 ? `/pages/page-${currentPage + 1}.jpg` : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Flipbook Container */}
      <div
        {...swipeHandlers}
        className="relative mx-auto"
        style={{
          perspective: '2000px',
          maxWidth: '900px',
        }}
      >
        {/* Book Spine Shadow */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-r from-gray-400/30 via-gray-500/40 to-gray-400/30 transform -translate-x-1/2 z-10 shadow-lg" />

        {/* Page Spread Container */}
        <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden" style={{ aspectRatio: '2 / 1.414' }}>
          
          {/* Left Page (Current) */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden"
            style={{
              transformOrigin: 'right center',
            }}
          >
            <div className="relative w-full h-full bg-gray-50">
              <img
                src={currentImageSrc}
                alt={`Page ${currentPage + 1}`}
                className="w-full h-full object-contain p-4"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.1))',
                }}
              />
              
              {/* Page number */}
              <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400 font-medium">
                {currentPage + 1}
              </div>
            </div>
          </div>

          {/* Right Page (Next page preview or blank) */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden"
            style={{
              transformOrigin: 'left center',
            }}
          >
            {nextImageSrc ? (
              <div className="relative w-full h-full bg-gray-50">
                <img
                  src={nextImageSrc}
                  alt={`Page ${currentPage + 2}`}
                  className="w-full h-full object-contain p-4"
                  style={{
                    filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.1))',
                  }}
                />
                
                {/* Page number */}
                <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400 font-medium">
                  {currentPage + 2}
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>

          {/* Flipping Page Animation Overlay */}
          {isFlipping && (
            <div 
              className="absolute top-0 bottom-0 w-1/2 bg-white shadow-2xl z-20"
              style={{
                left: flipDirection === 'next' ? '50%' : '0',
                transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
                transform: flipDirection === 'next' 
                  ? 'perspective(2000px) rotateY(-180deg)' 
                  : 'perspective(2000px) rotateY(180deg)',
                transition: 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)',
                backfaceVisibility: 'hidden',
              }}
            >
              <img
                src={flipDirection === 'next' ? currentImageSrc : nextImageSrc || ''}
                alt="Flipping page"
                className="w-full h-full object-contain p-4"
                style={{
                  transform: 'scaleX(-1)',
                }}
              />
            </div>
          )}

          {/* Click zones for navigation */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 0 || isFlipping}
            className="absolute left-0 top-0 bottom-0 w-1/2 cursor-pointer z-5 opacity-0 hover:opacity-0"
            aria-label="Previous page"
          />
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= TOTAL_PAGES - 1 || isFlipping}
            className="absolute right-0 top-0 bottom-0 w-1/2 cursor-pointer z-5 opacity-0 hover:opacity-0"
            aria-label="Next page"
          />
        </div>

        {/* Mobile instruction */}
        <div className="md:hidden text-center mt-4 text-sm text-gray-500">
          Tap left/right or swipe to turn pages
        </div>
      </div>

      {/* Navigation Controls */}
      <Navigation
        currentPage={currentPage + 1}
        totalPages={TOTAL_PAGES}
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
      />

      {/* Desktop keyboard hint */}
      <div className="hidden md:flex justify-center mt-6">
        <div className="text-sm text-gray-500 flex items-center gap-4">
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">←</kbd>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">→</kbd>
            <span>Arrow keys to flip pages</span>
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-2">
          💡 <strong>Tip:</strong> Click on the left or right side of the book to flip pages
        </p>
        <p className="text-xs text-gray-500">
          For a closer look, download the full PDF using the button above
        </p>
      </div>
    </div>
  );
}
