import { Inter } from "next/font/google";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import PreviewBanner from "@/components/PreviewBanner";

const inter = Inter({ subsets: ["latin"] });

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 ${inter.className}`}>
      <PreviewBanner />
      <MarketingNav />
      <main>
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}