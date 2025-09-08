"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Menu } from "lucide-react";

const menuItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo", label: "Demo" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
];

const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact" },
];

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="relative z-50 p-2 text-slate-700 hover:text-trenddojo-purple-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-slate-900">Menu</h2>
                <button
                  onClick={closeMenu}
                  className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Navigation */}
              <nav className="mb-8">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="block px-3 py-3 text-slate-700 hover:text-trenddojo-purple-700 hover:bg-trenddojo-purple-50 rounded-lg transition-colors font-medium"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* CTA Buttons */}
              <div className="space-y-3 mb-8">
                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="block w-full bg-trenddojo-primary-600 hover:bg-trenddojo-primary-700 text-white text-center px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="block w-full border border-slate-300 hover:border-trenddojo-purple-700 text-slate-700 hover:text-trenddojo-purple-700 text-center px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Sign In
                </Link>
              </div>

              {/* Footer Links */}
              <div className="border-t border-slate-200 pt-6">
                <ul className="space-y-1">
                  {footerLinks.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="block px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}