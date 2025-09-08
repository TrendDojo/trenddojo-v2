"use client";

import Link from "next/link";
import Image from "next/image";
import HamburgerMenu from "./HamburgerMenu";

interface InternalPageHeaderProps {
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export default function InternalPageHeader({ 
  showBackButton = true, 
  backButtonText = "← Back to Home",
  backButtonHref = "/"
}: InternalPageHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Left side - Logo and Back Button */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/assets/logos/td-logo.svg"
                alt="TrendDojo"
                width={140}
                height={31}
                className="h-8 w-auto"
              />
            </Link>
            
            {/* Back Button */}
            {showBackButton && (
              <Link 
                href={backButtonHref}
                className="hidden sm:block text-trenddojo-purple-700 hover:text-trenddojo-purple-800 text-sm font-medium transition-colors"
              >
                {backButtonText}
              </Link>
            )}
          </div>

          {/* Right side - Navigation and Menu */}
          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/features" 
                className="text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors"
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link 
                href="/demo" 
                className="text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors"
              >
                Demo
              </Link>
              <Link 
                href="/support" 
                className="text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors"
              >
                Support
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                href="/login"
                className="text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-trenddojo-primary-600 hover:bg-trenddojo-primary-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Hamburger Menu */}
            <HamburgerMenu />
          </div>
        </div>

        {/* Mobile Back Button */}
        {showBackButton && (
          <div className="sm:hidden pb-4">
            <Link 
              href={backButtonHref}
              className="text-trenddojo-purple-700 hover:text-trenddojo-purple-800 text-sm font-medium transition-colors"
            >
              {backButtonText}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}