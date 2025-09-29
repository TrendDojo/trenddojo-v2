"use client";

import Link from "next/link";
import Image from "next/image";
import HamburgerMenu from "./HamburgerMenu";
import Navigation from "./Navigation";
import { navigationLinks, ctaButtons } from "@/lib/navigation";

interface TrendDojoHeaderProps {
  variant: 'homepage' | 'internal' | 'pricing';
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  showLogo?: boolean;
}

export default function TrendDojoHeader({ 
  variant,
  showBackButton = true, 
  backButtonText = "← Back to Home",
  backButtonHref = "/",
  showLogo = true
}: TrendDojoHeaderProps) {

  const getHeaderStyles = () => {
    switch (variant) {
      case 'homepage':
        return "bg-white/95 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-40";
      case 'internal':
        return "bg-white border-b border-slate-200 sticky top-0 z-30";
      case 'pricing':
        return "bg-white/95 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-30";
      default:
        return "bg-white border-b border-slate-200 sticky top-0 z-30";
    }
  };

  const getSignInStyles = () => {
    switch (variant) {
      case 'homepage':
        return "text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors px-4 py-2 no-underline";
      case 'internal':
        return "text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors px-3 py-2 no-underline";
      case 'pricing':
        return "text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors px-3 py-2 no-underline";
      default:
        return "text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors px-3 py-2 no-underline";
    }
  };

  const getSignupStyles = () => {
    switch (variant) {
      case 'homepage':
        return "bg-trenddojo-purple-700 hover:bg-trenddojo-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm no-underline";
      case 'internal':
        return "bg-trenddojo-purple-700 hover:bg-trenddojo-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm no-underline";
      case 'pricing':
        return "bg-trenddojo-purple-700 hover:bg-trenddojo-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm no-underline";
      default:
        return "bg-trenddojo-purple-700 hover:bg-trenddojo-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm no-underline";
    }
  };

  const getBackButtonStyles = () => {
    switch (variant) {
      case 'homepage':
        return "text-trenddojo-purple-700 hover:text-trenddojo-purple-800 text-sm font-medium transition-colors";
      case 'internal':
        return "text-trenddojo-purple-700 hover:text-trenddojo-purple-800 text-sm font-medium transition-colors";
      case 'pricing':
        return "text-trenddojo-purple-700 hover:text-trenddojo-purple-800 text-sm font-medium transition-colors";
      default:
        return "text-trenddojo-purple-700 hover:text-trenddojo-purple-800 text-sm font-medium transition-colors";
    }
  };

  const getHamburgerStyles = () => {
    switch (variant) {
      case 'homepage':
        return "homepage-hamburger";
      default:
        return "";
    }
  };

  const headerStyles = getHeaderStyles();
  const signInStyles = getSignInStyles();
  const signupStyles = getSignupStyles();
  const backButtonStyles = getBackButtonStyles();
  const hamburgerStyles = getHamburgerStyles();

  return (
    <header className={headerStyles}>
      {/* Homepage variant hamburger styling */}
      {variant === 'homepage' && (
        <style jsx>{`
          .homepage-hamburger button {
            color: rgb(71, 85, 105);
          }
          .homepage-hamburger button:hover {
            color: rgb(79, 70, 229);
          }
        `}</style>
      )}
      
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-6">
          {/* Left side - Logo */}
          <div className="flex items-center">
            {/* Logo */}
            {showLogo && (
              <Link href="/" className="flex-shrink-0">
                <Image
                  src="/assets/logos/td-logo-s.svg"
                  alt="TrendDojo"
                  width={140}
                  height={31}
                  className="h-8 w-auto"
                />
              </Link>
            )}

            {/* Back Button */}
            {showBackButton && (
              <Link
                href={backButtonHref}
                className={`hidden sm:block ml-6 ${backButtonStyles}`}
              >
                {backButtonText}
              </Link>
            )}
          </div>

          {/* Center - Navigation */}
          <div className="flex-1 flex justify-center">
            <Navigation
              variant={variant}
              links={navigationLinks}
            />
          </div>

          {/* Right side - CTA Buttons and Menu */}
          <div className="flex items-center">
            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href={ctaButtons.signIn.href}
                className={signInStyles}
              >
                {ctaButtons.signIn.label}
              </Link>
              <Link
                href={ctaButtons.signup.href}
                className={signupStyles}
              >
                {ctaButtons.signup.label}
              </Link>
            </div>

            {/* Hamburger Menu - only show when desktop navigation is hidden */}
            <div className={`lg:hidden ${hamburgerStyles}`}>
              <HamburgerMenu />
            </div>
          </div>
        </div>

        {/* Mobile Back Button */}
        {showBackButton && variant !== 'homepage' && (
          <div className="sm:hidden pb-4">
            <Link 
              href={backButtonHref}
              className={backButtonStyles}
            >
              {backButtonText}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}