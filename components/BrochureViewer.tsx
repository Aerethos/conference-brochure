'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import Navigation from './Navigation';

const TOTAL_PAGES = 77;

export default function BrochureViewer() {
  // Start at spread 0 (pages 0-1)
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string>('');

  // Calculate total spreads (2 pages per spread)
  const totalSpreads = Math.ceil(TOTAL_PAGES / 2);

  const goToNextSpread = useCallback(() => {
    if (currentSpread < totalSpreads - 1 && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpread((prev) => prev + 1);
        setTimeout(() => {
          setIsFlipping(false);
          setFlipDirection(null);
        }, 100);
      }, 600);
    }
  }, [currentSpread, isFlipping, totalSpreads]);

  const goToPreviousSpread = useCallback(() => {
    if (currentSpread > 0 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpread((prev) => prev - 1);
        setTimeout(() => {
          setIsFlipping(false);
          setFlipDirection(null);
        }, 100);
      }, 600);
    }
  }, [currentSpread, isFlipping]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showZoom && event.key === 'Escape') {
        setShowZoom(false);
        return;
      }
      if (!showZoom) {
        if (event.key === 'ArrowLeft') {
          goToPreviousSpread();
        } else if (event.key === 'ArrowRight') {
          goToNextSpread();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSpread, goToPreviousSpread, showZoom]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!showZoom) goToNextSpread();
    },
    onSwipedRight: () => {
      if (!showZoom) goToPreviousSpread();
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: true,
  });

  // Preload adjacent spreads
  useEffect(() => {
    const spreadsToPreload = [
      currentSpread - 1,
      currentSpread,
      currentSpread + 1,
    ].filter(s => s >= 0 && s < totalSpreads);

    spreadsToPreload.forEach(spreadNum => {
      const leftPageNum = spreadNum * 2;
      const rightPageNum = spreadNum * 2 + 1;
      
      if (leftPageNum < TOTAL_PAGES) {
        const img = new window.Image();
        img.src = `/pages/page-${leftPageNum}.jpg`;
      }
      if (rightPageNum < TOTAL_PAGES) {
        const img = new window.Image();
        img.src = `/pages/page-${rightPageNum}.jpg`;
      }
    });
  }, [currentSpread, totalSpreads]);

  // Get current spread pages
  const leftPageNum = currentSpread * 2;
  const rightPageNum = currentSpread * 2 + 1;
  
  const leftPageSrc = leftPageNum < TOTAL_PAGES ? `/pages/page-${leftPageNum}.jpg` : null;
  const rightPageSrc = rightPageNum < TOTAL_PAGES ? `/pages/page-${rightPageNum}.jpg` : null;

  // Get next spread for flip animation
  const nextLeftPageNum = (currentSpread + 1) * 2;
  const nextRightPageNum = (currentSpread + 1) * 2 + 1;
  const nextLeftPageSrc = nextLeftPageNum < TOTAL_PAGES ? `/pages/page-${nextLeftPageNum}.jpg` : null;
  const nextRightPageSrc = nextRightPageNum < TOTAL_PAGES ? `/pages/page-${nextRightPageNum}.jpg` : null;

  // Get previous spread for flip animation
  const prevLeftPageNum = (currentSpread - 1) * 2;
  const prevRightPageNum = (currentSpread - 1) * 2 + 1;
  const prevLeftPageSrc = prevLeftPageNum >= 0 ? `/pages/page-${prevLeftPageNum}.jpg` : null;
  const prevRightPageSrc = prevRightPageNum < TOTAL_PAGES ? `/pages/page-${prevRightPageNum}.jpg` : null;

  const handleZoom = (imageSrc: string) => {
    setZoomedImage(imageSrc);
    setShowZoom(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        
        {/* Desktop: Two-Page Spread */}
        <div className="hidden md:block">
          <div
            {...swipeHandlers}
            className="relative mx-auto"
            style={{
              perspective: '3000px',
              maxWidth: '1400px',
            }}
          >
            {/* Book Container */}
            <div 
              className="relative rounded-xl shadow-2xl overflow-visible"
              style={{ 
                aspectRatio: '2 / 1.414',
                background: 'linear-gradient(to bottom, #f5f5f5, #e5e5e5)',
              }}
            >
              {/* Book Spine/Shadow in center */}
              <div className="absolute left-1/2 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-700/30 via-gray-900/50 to-gray-700/30 transform -translate-x-1/2 z-30 shadow-2xl" />

              {/* Left Page */}
              {leftPageSrc && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-white shadow-xl overflow-hidden"
                  style={{
                    width: 'calc(50% - 0.5rem)',
                    transformOrigin: 'right center',
                    transform: isFlipping && flipDirection === 'prev' ? 'rotateY(5deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  }}
                >
                  <img
                    src={leftPageSrc}
                    alt={`Page ${leftPageNum + 1}`}
                    className="w-full h-full object-contain p-8 cursor-pointer"
                    onClick={() => handleZoom(leftPageSrc)}
                  />
                  
                  {/* Page number */}
                  <div className="absolute bottom-8 left-0 right-0 text-center text-sm text-gray-400 font-medium pointer-events-none">
                    {leftPageNum + 1}
                  </div>

                  {/* Navigation hint on hover */}
                  <div 
                    className="absolute inset-0 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-transparent cursor-pointer transition-all duration-300 group"
                    onClick={goToPreviousSpread}
                  >
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 rounded-full p-3 shadow-xl">
                      <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Page */}
              {rightPageSrc && (
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-white shadow-xl overflow-hidden"
                  style={{
                    width: 'calc(50% - 0.5rem)',
                    transformOrigin: 'left center',
                    transform: isFlipping && flipDirection === 'next' ? 'rotateY(-5deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  }}
                >
                  <img
                    src={rightPageSrc}
                    alt={`Page ${rightPageNum + 1}`}
                    className="w-full h-full object-contain p-8 cursor-pointer"
                    onClick={() => handleZoom(rightPageSrc)}
                  />
                  
                  {/* Page number */}
                  <div className="absolute bottom-8 left-0 right-0 text-center text-sm text-gray-400 font-medium pointer-events-none">
                    {rightPageNum + 1}
                  </div>

                  {/* Navigation hint on hover */}
                  <div 
                    className="absolute inset-0 hover:bg-gradient-to-l hover:from-blue-500/5 hover:to-transparent cursor-pointer transition-all duration-300 group"
                    onClick={goToNextSpread}
                  >
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 rounded-full p-3 shadow-xl">
                      <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Flipping Right Page Animation (when going forward) */}
              {isFlipping && flipDirection === 'next' && rightPageSrc && (
                <div 
                  className="absolute top-0 bottom-0 bg-white shadow-2xl z-40 overflow-hidden"
                  style={{
                    width: 'calc(50% - 0.5rem)',
                    right: '0.5rem',
                    transformOrigin: 'left center',
                    transform: 'rotateY(-180deg)',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div style={{ transform: 'scaleX(-1)' }}>
                    <img
                      src={rightPageSrc}
                      alt="Flipping"
                      className="w-full h-full object-contain p-8"
                    />
                  </div>
                </div>
              )}

              {/* Flipping Left Page Animation (when going backward) */}
              {isFlipping && flipDirection === 'prev' && prevRightPageSrc && (
                <div 
                  className="absolute top-0 bottom-0 bg-white shadow-2xl z-40 overflow-hidden"
                  style={{
                    width: 'calc(50% - 0.5rem)',
                    right: '0.5rem',
                    transformOrigin: 'left center',
                    transform: 'rotateY(0deg)',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <img
                    src={prevRightPageSrc}
                    alt="Flipping back"
                    className="w-full h-full object-contain p-8"
                  />
                </div>
              )}
            </div>

            {/* Page indicator */}
            <div className="mt-6 text-center text-sm text-gray-600">
              Pages {leftPageNum + 1}{rightPageSrc ? ` - ${rightPageNum + 1}` : ''} of {TOTAL_PAGES}
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Click pages to flip • Hover for navigation arrows • Click to zoom
            </div>
          </div>
        </div>

        {/* Mobile: Single Page */}
        <div className="md:hidden">
          <div
            {...swipeHandlers}
            className="relative mx-auto"
            style={{ maxWidth: '500px' }}
          >
            <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden" style={{ aspectRatio: '0.707' }}>
              <div 
                className={`relative w-full h-full transition-all duration-400 ${
                  isFlipping ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                <img
                  src={leftPageSrc || ''}
                  alt={`Page ${leftPageNum + 1}`}
                  className="w-full h-full object-contain bg-gray-50 cursor-pointer"
                  onClick={() => leftPageSrc && handleZoom(leftPageSrc)}
                />

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  Page {leftPageNum + 1} of {TOTAL_PAGES}
                </div>

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs">
                  Tap to zoom
                </div>

                {/* Tap zones */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1" onClick={goToPreviousSpread} />
                  <div className="flex-1" onClick={goToNextSpread} />
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                <span>←</span>
                <span>Swipe to flip pages</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-8">
          <Navigation
            currentPage={leftPageNum + 1}
            totalPages={TOTAL_PAGES}
            onPrevious={goToPreviousSpread}
            onNext={goToNextSpread}
          />
        </div>

        {/* Keyboard hint */}
        <div className="hidden md:flex justify-center mt-6">
          <div className="text-sm text-gray-500 flex items-center gap-4">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-medium">←</kbd>
              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-medium">→</kbd>
              <span>Arrow keys to flip</span>
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
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative max-w-6xl max-h-[90vh] overflow-auto">
            <img
              src={zoomedImage}
              alt="Zoomed page"
              className="w-full h-auto"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm pointer-events-none">
            Click to close • Pinch to zoom on mobile
          </div>
        </div>
      )}
    </>
  );
}
