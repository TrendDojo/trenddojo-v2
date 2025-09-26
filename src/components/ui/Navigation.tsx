"use client";

import Link from "next/link";
import { NavigationLink } from "@/lib/navigation";

interface NavigationProps {
  variant: 'homepage' | 'internal' | 'pricing';
  links: NavigationLink[];
  className?: string;
}

export default function Navigation({ variant, links, className = "" }: NavigationProps) {
  const getNavLinkStyles = () => {
    switch (variant) {
      case 'homepage':
        return "text-white/90 hover:text-white font-medium transition-colors drop-shadow-sm no-underline";
      case 'internal':
        return "text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors no-underline";
      case 'pricing':
        return "text-slate-700 hover:text-trenddojo-purple-700 font-medium transition-colors drop-shadow-sm no-underline";
      default:
        return "text-slate-600 hover:text-trenddojo-purple-700 font-medium transition-colors no-underline";
    }
  };

  const navLinkStyles = getNavLinkStyles();

  return (
    <nav className={`hidden lg:flex items-center space-x-8 ${className}`}>
      {links.map((link) => (
        <Link 
          key={link.href}
          href={link.href} 
          className={navLinkStyles}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}