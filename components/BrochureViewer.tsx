'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import Navigation from './Navigation';

const TOTAL_PAGES = 77;

export default function BrochureViewer() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showZoom, setShowZoom] = useState(false);

  const goToNextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setIsFlipping(false);
      }, 400);
    }
  }, [currentPage, isFlipping]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setIsFlipping(false);
      }, 400);
    }
  }, [currentPage, isFlipping]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showZoom && event.key === 'Escape') {
        setShowZoom(false);
        return;
      }
      if (!showZoom) {
        if (event.key === 'ArrowLeft') {
          goToPreviousPage();
        } else if (event.key === 'ArrowRight') {
          goToNextPage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPreviousPage, showZoom]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!showZoom) goToNextPage();
    },
    onSwipedRight: () => {
      if (!showZoom) goToPreviousPage();
    },
    trackMouse: false,
    trackTouch: true,
    delta: 30,
    preventScrollOnSwipe: true,
  });

  // Preload adjacent pages
  useEffect(() => {
    const pagesToPreload = [
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ].filter(p => p >= 0 && p < TOTAL_PAGES);

    pagesToPreload.forEach(pageNum => {
      const img = new window.Image();
      img.src = `/pages/page-${pageNum}.jpg`;
    });
  }, [currentPage]);

  const currentImageSrc = `/pages/page-${currentPage}.jpg`;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Single Page Viewer (All Devices) */}
        <div
          {...swipeHandlers}
          className="relative mx-auto"
          style={{
            perspective: '1500px',
            maxWidth: '800px',
          }}
        >
          {/* Page Container with Book Shadow */}
          <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden mx-auto" style={{ aspectRatio: '0.707' }}>
            
            {/* Current Page */}
            <div 
              className={`relative w-full h-full transition-all duration-400 ${
                isFlipping ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <img
                src={currentImageSrc}
                alt={`Page ${currentPage + 1} of ${TOTAL_PAGES}`}
                className="w-full h-full object-contain bg-gray-50 cursor-pointer"
                onClick={() => setShowZoom(true)}
              />

              {/* Click zones for navigation - visible on hover (desktop) or always (mobile) */}
              <div className="absolute inset-0 flex">
                {/* Left click zone */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className={`flex-1 group transition-colors ${
                    currentPage === 0 ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-black/5 active:bg-black/10'
                  }`}
                  aria-label="Previous page"
                >
                  <div className="h-full flex items-center justify-start pl-4 md:pl-8">
                    <div className={`bg-white/90 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg transition-all ${
                      currentPage === 0 
                        ? 'opacity-30' 
                        : 'opacity-0 md:group-hover:opacity-100 active:opacity-100'
                    }`}>
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Right click zone */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= TOTAL_PAGES - 1}
                  className={`flex-1 group transition-colors ${
                    currentPage >= TOTAL_PAGES - 1 ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-black/5 active:bg-black/10'
                  }`}
                  aria-label="Next page"
                >
                  <div className="h-full flex items-center justify-end pr-4 md:pr-8">
                    <div className={`bg-white/90 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg transition-all ${
                      currentPage >= TOTAL_PAGES - 1
                        ? 'opacity-30'
                        : 'opacity-0 md:group-hover:opacity-100 active:opacity-100'
                    }`}>
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Page number badge */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-10 pointer-events-none">
              Page {currentPage + 1} of {TOTAL_PAGES}
            </div>

            {/* Zoom hint */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs z-10 pointer-events-none">
              Click to zoom
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center space-y-2">
            <div className="md:hidden">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                <span>←</span>
                <span>Swipe or tap sides to navigate</span>
                <span>→</span>
              </div>
            </div>
            <div className="hidden md:block text-sm text-gray-600">
              Click left/right sides to flip pages • Click center to zoom
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-8">
          <Navigation
            currentPage={currentPage + 1}
            totalPages={TOTAL_PAGES}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        </div>

        {/* Keyboard hint (desktop only) */}
        <div className="hidden md:flex justify-center mt-6">
          <div className="text-sm text-gray-500 flex items-center gap-4">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-medium">←</kbd>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-medium">→</kbd>
              <span>Arrow keys to navigate</span>
            </span>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {showZoom && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setShowZoom(false)}
        >
          <button
            onClick={() => setShowZoom(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-colors z-10"
            aria-label="Close zoom"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-6xl max-h-[90vh] overflow-auto">
            <img
              src={currentImageSrc}
              alt={`Page ${currentPage + 1} zoomed`}
              className="w-full h-auto"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm pointer-events-none">
            Click anywhere to close • Pinch to zoom on mobile
          </div>
        </div>
      )}
    </>
  );
}
