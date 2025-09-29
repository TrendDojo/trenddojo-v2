import Link from "next/link";
import Image from "next/image";
import { footerSections } from "@/lib/navigation";

export default function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-1">
            <Image
              src="/assets/logos/td-logo-s.svg"
              alt="TrendDojo"
              width={200}
              height={44}
              className="h-10 w-auto mb-4"
            />
            <p className="text-gray-600 text-sm leading-relaxed">
              Professional trading tools for systematic discipline and risk management.
            </p>
          </div>

          {/* Empty spacer column */}
          <div className="hidden md:block"></div>

          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="text-gray-900 font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-trenddojo-purple-700 transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © {currentYear} TrendDojo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}