import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#F7F7F7] dark:bg-[#0F172A] border-t border-gray-200 dark:border-slate-800 mt-auto py-10 text-gray-600 dark:text-slate-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wider">Support</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Help Centre</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">AirCover</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Anti-discrimination</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Disability support</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Cancellation options</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wider">Hosting</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">BookNearMe your home</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">AirCover for Hosts</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Hosting resources</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Community forum</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Hosting responsibly</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wider">BookNearMe</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Newsroom</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">New features</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Investors</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Gift cards</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wider">Legal</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">Sitemap</a></li>
              <li><a href="#" className="hover:underline hover:text-gray-900 transition-colors">UK Modern Slavery Act</a></li>
            </ul>
          </div>
        </div>
        <hr className="border-gray-200 my-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 BookNearMe, Inc.</span>
            <span className="hidden sm:inline">·</span>
            <a href="#" className="hover:underline">Privacy</a>
            <span>·</span>
            <a href="#" className="hover:underline">Terms</a>
            <span>·</span>
            <a href="#" className="hover:underline">Sitemap</a>
          </div>
          <div className="flex space-x-6 mt-4 sm:mt-0 font-medium text-gray-700">
            <span className="cursor-pointer hover:underline">English (GB)</span>
            <span className="cursor-pointer hover:underline">GBP (£)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
