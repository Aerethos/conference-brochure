'use client';

export default function Footer() {
  return (
    <footer className="py-6 text-center text-sm text-gray-500">
      <p>
        Digital brochure crafted by{' '}
        <a 
          href="https://aerethos.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          AerEthos
        </a>
      </p>
    </footer>
  );
}
