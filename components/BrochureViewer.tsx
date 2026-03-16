'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import Navigation from './Navigation';

const TOTAL_PAGES = 77;

export default function BrochureViewer() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string>('');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const viewerRef = useRef<HTMLDivElement>(null);

  const goToNextPage = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1 && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1);
        setTimeout(() => {
          setIsFlipping(false);
          setFlipDirection(null);
        }, 100);
      }, 400);
    }
  }, [currentPage, isFlipping]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage((prev) => prev - 1);
        setTimeout(() => {
          setIsFlipping(false);
          setFlipDirection(null);
        }, 100);
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

  // Enhanced swipe with visual feedback
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!showZoom) goToNextPage();
    },
    onSwipedRight: () => {
      if (!showZoom) goToPreviousPage();
    },
    onSwiping: (eventData) => {
      if (viewerRef.current && !showZoom) {
        const delta = eventData.deltaX;
        viewerRef.current.style.transform = `translateX(${delta * 0.1}px)`;
      }
    },
    onSwiped: () => {
      if (viewerRef.current) {
        viewerRef.current.style.transform = 'translateX(0)';
      }
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
      currentPage + 2,
    ].filter(p => p >= 0 && p < TOTAL_PAGES);

    pagesToPreload.forEach(pageNum => {
      const img = new window.Image();
      img.src = `/pages/page-${pageNum}.jpg`;
    });
  }, [currentPage]);

  const handleZoom = (imageSrc: string) => {
    setZoomedImage(imageSrc);
    setShowZoom(true);
  };

  const currentImageSrc = `/pages/page-${currentPage}.jpg`;
  const nextImageSrc = currentPage < TOTAL_PAGES - 1 ? `/pages/page-${currentPage + 1}.jpg` : null;

  // Determine if we should show single or double page layout
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Mobile: Single Page View */}
        <div className="md:hidden">
          <div
            {...swipeHandlers}
            ref={viewerRef}
            className="relative mx-auto transition-transform duration-200"
            style={{ maxWidth: '500px' }}
          >
            <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden">
              <div 
                className={`relative transition-all duration-400 ${
                  isFlipping ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
                style={{ aspectRatio: '0.707' }}
              >
                <img
                  src={currentImageSrc}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-full object-contain bg-gray-50"
                  onClick={() => handleZoom(currentImageSrc)}
                />
                
                {/* Page number badge */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  {currentPage + 1} / {TOTAL_PAGES}
                </div>

                {/* Tap zones indicators */}
                {!isFlipping && (
                  <>
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer active:bg-black/5 transition-colors"
                      onClick={goToPreviousPage}
                    />
                    <div 
                      className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer active:bg-black/5 transition-colors"
                      onClick={goToNextPage}
                    />
                  </>
                )}
              </div>

              {/* Zoom hint */}
              <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs backdrop-blur-sm">
                Tap to zoom
              </div>
            </div>

            {/* Swipe indicator */}
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                <span>←</span>
                <span>Swipe to flip pages</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Double Page Spread */}
        <div className="hidden md:block">
          <div
            className="relative mx-auto"
            style={{
              perspective: '2500px',
              maxWidth: '1200px',
            }}
          >
            {/* Book Container */}
            <div 
              className="relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg shadow-2xl overflow-visible p-8"
              style={{ aspectRatio: '2.1 / 1.414' }}
            >
              {/* Center spine shadow */}
              <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-gradient-to-r from-gray-800/20 via-gray-900/40 to-gray-800/20 transform -translate-x-1/2 z-20 shadow-xl" />

              {/* Left Page */}
              <div 
                className="absolute left-8 top-8 bottom-8 bg-white shadow-lg overflow-hidden"
                style={{
                  width: 'calc(50% - 2.5rem)',
                  transformOrigin: 'right center',
                  transform: isFlipping && flipDirection === 'prev' ? 'rotateY(10deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}
              >
                <img
                  src={currentImageSrc}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-full object-contain p-6 cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => handleZoom(currentImageSrc)}
                />
                
                {/* Page number */}
                <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-gray-400 font-medium">
                  {currentPage + 1}
                </div>

                {/* Hover overlay left */}
                <div 
                  className="absolute inset-0 hover:bg-gradient-to-r hover:from-transparent hover:via-transparent hover:to-blue-500/5 cursor-pointer transition-all duration-300 group"
                  onClick={goToPreviousPage}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg">
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right Page */}
              <div 
                className="absolute right-8 top-8 bottom-8 bg-white shadow-lg overflow-hidden"
                style={{
                  width: 'calc(50% - 2.5rem)',
                  transformOrigin: 'left center',
                  transform: isFlipping && flipDirection === 'next' ? 'rotateY(-10deg)' : 'rotateY(0deg)',
                  transition: 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
                }}
              >
                {nextImageSrc ? (
                  <>
                    <img
                      src={nextImageSrc}
                      alt={`Page ${currentPage + 2}`}
                      className="w-full h-full object-contain p-6 cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => handleZoom(nextImageSrc)}
                    />
                    
                    {/* Page number */}
                    <div className="absolute bottom-6 left-0 right-0 text-center text-sm text-gray-400 font-medium">
                      {currentPage + 2}
                    </div>

                    {/* Hover overlay right */}
                    <div 
                      className="absolute inset-0 hover:bg-gradient-to-l hover:from-transparent hover:via-transparent hover:to-blue-500/5 cursor-pointer transition-all duration-300 group"
                      onClick={goToNextPage}
                    >
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 shadow-lg">
                        <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-50" />
                )}
              </div>

              {/* Flipping page animation */}
              {isFlipping && (
                <div 
                  className="absolute top-8 bottom-8 bg-white shadow-2xl z-30 overflow-hidden"
                  style={{
                    width: 'calc(50% - 2.5rem)',
                    left: flipDirection === 'next' ? 'calc(50% + 1.5rem)' : '2rem',
                    transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
                    transform: flipDirection === 'next' 
                      ? 'rotateY(-180deg)' 
                      : 'rotateY(180deg)',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div style={{ transform: 'scaleX(-1)' }}>
                    <img
                      src={flipDirection === 'next' ? currentImageSrc : (nextImageSrc || '')}
                      alt="Flipping"
                      className="w-full h-full object-contain p-6"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Desktop hint */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Click on pages to flip • Hover for navigation arrows • Click any page to zoom
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
              <span>Arrow keys</span>
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

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
            Click anywhere to close • Pinch to zoom further
          </div>
        </div>
      )}
    </>
  );
}
