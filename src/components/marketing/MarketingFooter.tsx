import Link from "next/link";
import Image from "next/image";
import { footerSections } from "@/lib/navigation";

export default function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Image
              src="/assets/logos/td-logo-s.svg"
              alt="TrendDojo"
              width={200}
              height={44}
              className="h-10 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional trading tools for systematic discipline and risk management.
            </p>
          </div>
          
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-indigo-400 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} TrendDojo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}