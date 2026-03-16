import BrochureViewer from '@/components/BrochureViewer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BrochurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Header />
      <main className="flex-1">
        <BrochureViewer />
      </main>
      <Footer />
    </div>
  );
}
