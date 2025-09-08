"use client";

import Link from "next/link";
import HamburgerMenu from "./HamburgerMenu";

export default function HomePageHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-40">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-6">
          {/* Left side - Empty for logo in hero section */}
          <div className="flex-1" />

          {/* Right side - Navigation and Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/features" 
                className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-sm"
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-sm"
              >
                Pricing
              </Link>
              <Link 
                href="/demo" 
                className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-sm"
              >
                Demo
              </Link>
              <Link 
                href="/docs" 
                className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-sm"
              >
                Docs
              </Link>
              <Link 
                href="/support" 
                className="text-white/90 hover:text-white font-medium transition-colors drop-shadow-sm"
              >
                Support
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/login"
                className="text-white/90 hover:text-white font-medium transition-colors px-4 py-2 drop-shadow-sm"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm drop-shadow-sm"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Hamburger Menu with custom styling for homepage */}
            <div className="relative">
              <style jsx>{`
                .homepage-hamburger button {
                  color: rgba(255, 255, 255, 0.9);
                }
                .homepage-hamburger button:hover {
                  color: white;
                }
              `}</style>
              <div className="homepage-hamburger">
                <HamburgerMenu />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}