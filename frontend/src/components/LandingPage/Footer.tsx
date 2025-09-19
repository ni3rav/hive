export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-yellow-400 flex items-center justify-center">
              <span className="text-black font-bold text-lg">🐝</span>
            </div>
            <span className="text-xl font-bold text-white">Hive</span>
          </div>
          
          <div className="flex gap-8 text-sm text-neutral-400">
            <span>© 2024 Hive. All main marin reserved.</span>
          </div>
          
          <div className="flex gap-6 text-sm text-neutral-400">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-500">
            &copy; {currentYear} Your Company Name. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}