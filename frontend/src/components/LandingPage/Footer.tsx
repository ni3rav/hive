export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main footer content - stacked on mobile, horizontal on desktop */}
        <div className="flex flex-col items-center space-y-6 md:space-y-0 md:flex-row md:justify-between">
          
          {/* Logo section - always centered on mobile */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-yellow-400 flex items-center justify-center">
              <span className="text-black font-bold text-lg">🐝</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Hive</span>
          </div>
          
          {/* Navigation links - centered on mobile, right-aligned on desktop */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 md:justify-end">
            <a href="#" className="hover:text-gray-900 transition-colors">About</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
        
        {/* Copyright section - always centered and separated */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © {currentYear} Hive. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}