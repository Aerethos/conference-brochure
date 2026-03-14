import BrochureViewer from '@/components/BrochureViewer';
import Header from '@/components/Header';

export default function BrochurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <BrochureViewer />
    </div>
  );
}
