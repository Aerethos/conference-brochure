'use client';

import { HiDownload } from 'react-icons/hi';

export default function Header() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/brochure.pdf';
    link.download = 'Social-Care-Ireland-Conference-2026-Brochure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Social Care Ireland Conference 2026
            </h1>
            <p className="text-sm text-gray-600 mt-1">Sponsor Brochure - Digital</p>
          </div>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 text-sm sm:text-base"
          >
            <HiDownload className="w-5 h-5" />
            <span className="hidden sm:inline">Download Full Brochure (once complete)</span>
            <span className="sm:hidden">Download</span>
          </button>
        </div>
      </div>
    </header>
  );
}
