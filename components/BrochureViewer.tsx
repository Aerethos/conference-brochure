'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import Navigation from './Navigation';

const TOTAL_PAGES = 77;

export default function BrochureViewer() {
  const [currentPage, setCurrentPage] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const lastTouchDistance = useRef<number | null>(null);

  const goToNextPage = useCallback(() => {
  if (currentPage <= TOTAL_PAGES - 1 && scale === 1) {
      setCurrentPage((prev) => prev + 1);
      setImageLoaded(false);
      setImageError(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [currentPage, scale]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 0 && scale === 1) {
      setCurrentPage((prev) => prev - 1);
      setImageLoaded(false);
      setImageError(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [currentPage, scale]);

  // Reset zoom when page changes
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousPage();
      } else if (event.key === 'ArrowRight') {
        goToNextPage();
      } else if (event.key === 'Escape') {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPreviousPage]);

  // Swipe handlers (only when not zoomed)
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (scale === 1) goToNextPage();
    },
    onSwipedRight: () => {
      if (scale === 1) goToPreviousPage();
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: true,
  });

  // Pinch to zoom
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        lastTouchDistance.current = distance;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastTouchDistance.current) {
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        const delta = distance - lastTouchDistance.current;
        const scaleChange = delta * 0.01;
        
        setScale((prevScale) => {
          const newScale = Math.min(Math.max(prevScale + scaleChange, 1), 4);
          return newScale;
        });

        lastTouchDistance.current = distance;
      }
    };

    const handleTouchEnd = () => {
      lastTouchDistance.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Mouse wheel zoom (desktop)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      setScale((prevScale) => {
        const newScale = Math.min(Math.max(prevScale + delta, 1), 4);
        return newScale;
      });
    }
  };

  // Dragging when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Display Area */}
      <div
        {...swipeHandlers}
        ref={imageContainerRef}
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ touchAction: scale > 1 ? 'none' : 'pan-y' }}
        onWheel={handleWheel}
      >
        {/* Loading Skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10">
            <div className="text-gray-400 text-lg">Loading page {currentPage}...</div>
          </div>
        )}

        {/* Error State */}
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-8 z-10">
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

        {/* Page Image */}
        <div
          className={`
            relative w-full transition-opacity duration-300
            ${imageLoaded ? 'opacity-100 animate-fade-in' : 'opacity-0'}
            ${scale > 1 ? 'cursor-move' : 'cursor-default'}
          `}
          style={{
            aspectRatio: '210 / 297',
            maxHeight: 'calc(100vh - 280px)',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={currentImageSrc}
            alt={`Brochure page ${currentPage} of ${TOTAL_PAGES}`}
            className="w-full h-full object-contain select-none"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageLoaded(true);
              setImageError(true);
            }}
            draggable={false}
          />
        </div>

        {/* Zoom indicator */}
        {scale > 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium z-20">
            {Math.round(scale * 100)}%
          </div>
        )}

        {/* Reset zoom button */}
        {scale > 1 && (
          <button
            onClick={resetZoom}
            className="absolute top-4 left-4 bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors z-20"
          >
            Reset Zoom
          </button>
        )}

        {/* Touch indicator for mobile */}
        {scale === 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden pointer-events-none">
            <div className="bg-black/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
              Swipe to navigate • Pinch to zoom
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <Navigation
        currentPage={currentPage + 1}
        totalPages={TOTAL_PAGES}
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
      />

      {/* Keyboard hint for desktop */}
      <div className="hidden md:flex justify-center mt-6">
        <div className="text-sm text-gray-500 flex items-center gap-4">
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">←</kbd>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">→</kbd>
            <span>Arrow keys</span>
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd>
            <span>+ scroll to zoom</span>
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">Esc</kbd>
            <span>Reset zoom</span>
          </span>
        </div>
      </div>
    </div>
  );
}
