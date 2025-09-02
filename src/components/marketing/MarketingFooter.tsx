import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, TrendingUp, BarChart3 } from "lucide-react";

export default function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "API", href: "/docs/api" },
      { label: "Integrations", href: "/integrations" },
    ],
    Resources: [
      { label: "Documentation", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
      { label: "Status", href: "/status" },
    ],
    Company: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Partners", href: "/partners" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" },
      { label: "Compliance", href: "/compliance" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/trenddojo", label: "Twitter" },
    { icon: Github, href: "https://github.com/trenddojo", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/trenddojo", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@trenddojo.com", label: "Email" },
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 text-white mb-4">
              <div className="relative">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <BarChart3 className="w-4 h-4 text-indigo-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold">
                Trend<span className="text-blue-400">Dojo</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Professional trading platform for systematic execution. Transform your brokerage 
              account into an intelligent, automated trading engine with disciplined risk management.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} TrendDojo. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span className="text-gray-500 text-sm">
                Made for professional traders
              </span>
              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}