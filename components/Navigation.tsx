'use client';

import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface NavigationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Navigation({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: NavigationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
      <button
        onClick={onPrevious}
        disabled={isFirstPage}
        className={`
          flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium
          transition-all duration-200 shadow-md
          ${
            isFirstPage
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-800 hover:bg-gray-50 hover:shadow-lg active:scale-95'
          }
        `}
        aria-label="Previous page"
      >
        <HiChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white rounded-lg shadow-md">
        <span className="text-sm sm:text-base font-medium text-gray-700">
          Page
        </span>
        <span className="text-base sm:text-lg font-bold text-blue-600 min-w-[2rem] text-center">
          {currentPage}
        </span>
        <span className="text-sm sm:text-base text-gray-500">/</span>
        <span className="text-sm sm:text-base text-gray-700">{totalPages}</span>
      </div>

      <button
        onClick={onNext}
        disabled={isLastPage}
        className={`
          flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium
          transition-all duration-200 shadow-md
          ${
            isLastPage
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-800 hover:bg-gray-50 hover:shadow-lg active:scale-95'
          }
        `}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <HiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
