"use client";

import { motion } from "framer-motion";
import { CheckCircle, TrendingUp, Shield, Zap, BarChart3, Calculator, Target } from "lucide-react";
import AnimatedPolygonBackground from "@/components/marketing/AnimatedPolygonBackground";
import TrendDojoHeader from "@/components/ui/TrendDojoHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

const features = [
  {
    icon: Calculator,
    title: "Position Sizing",
    description: "Systematic position sizing based on risk tolerance and account balance. Never risk more than you can afford to lose."
  },
  {
    icon: Shield,
    title: "Risk Management", 
    description: "Advanced stop-loss automation, correlation analysis, and portfolio-level risk monitoring for consistent results."
  },
  {
    icon: TrendingUp,
    title: "Strategy Execution",
    description: "Connect to major brokers and execute trades systematically with discipline and precision."
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Detailed trade journaling, P&L tracking, and risk-adjusted return analysis to improve your edge."
  },
  {
    icon: Target,
    title: "Trade Planning",
    description: "Pre-trade checklists, entry/exit criteria, and systematic trade validation to maintain consistency."
  },
  {
    icon: Zap,
    title: "Real-time Data",
    description: "Live market data feeds, instant position calculations, and real-time risk monitoring."
  }
];

const dataFeatures = [
  "Real-time market prices from multiple exchanges",
  "Institutional-grade data feeds and APIs", 
  "Live position P&L and risk calculations",
  "Advanced charting with technical indicators",
  "Economic calendar and earnings data"
];

const stats = [
  { value: "10,000+", label: "Trades Executed" },
  { value: "95%", label: "Uptime SLA" },
  { value: "2.3s", label: "Avg Response Time" },
  { value: "24/7", label: "Market Monitoring" }
];

const testimonials = [
  {
    quote: "TrendDojo transformed how I manage risk. The systematic approach eliminated my emotional trading mistakes.",
    author: "Sarah Chen",
    role: "Quantitative Analyst",
    company: "Hedge Fund"
  },
  {
    quote: "The position sizing calculator alone saved me from several account-threatening trades. Worth every penny.",
    author: "Michael Rodriguez", 
    role: "Independent Trader",
    company: "Day Trading"
  },
  {
    quote: "Finally, a platform that treats trading like a business. The risk controls are exactly what I needed.",
    author: "David Kim",
    role: "Portfolio Manager", 
    company: "Investment Firm"
  }
];

export default function MarketingHomePage() {
  return (
    <>
      {/* Hero Section with Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
        <TrendDojoHeader variant="homepage" showLogo={true} showBackButton={false} />
        <AnimatedPolygonBackground />

        <div className="relative z-30 container mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 drop-shadow-lg flex items-center justify-center gap-4">
              <Image
                src="/assets/icons/trenddojo-plain-icon.svg"
                alt=""
                width={60}
                height={60}
                className="h-12 md:h-16 w-auto inline-block"
                priority
              />
              Trade with <span className="text-trenddojo-purple-700">Discipline</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 drop-shadow-md">
              Professional position sizing, risk management, and trade journaling
              for <span className="font-bold">Swing Traders</span> and <span className="font-bold">Trend Following Traders</span> — whether professional or amateur, part-time or full-time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/signup">
                <Button variant="primary" size="md">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="ghost" size="md" className="border border-white/20 hover:border-white/40 text-white hover:bg-white/10 dark:border-white/20 dark:hover:border-white/40 dark:text-white dark:hover:bg-white/10">
                  View Features
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4"
                >
                  <div className="text-2xl font-bold text-white mb-1 drop-shadow-md">{stat.value}</div>
                  <div className="text-sm text-gray-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Built for Traders, by Traders
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Every feature is designed to eliminate emotional decisions and enforce
              systematic trading discipline that separates professionals from amateurs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <feature.icon className="w-12 h-12 text-trenddojo-purple-700 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Data Showcase */}
      <section className="py-20 bg-slate-900/80">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-white mb-6">
                Institutional-Grade Market Data
              </h3>
              <p className="text-xl text-gray-200 mb-6">
                Connect to professional data feeds used by hedge funds and institutions. 
                Get accurate prices, live charts, and instant position calculations.
              </p>
              <ul className="space-y-4">
                {dataFeatures.map((item, index) => (
                  <motion.li 
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center text-gray-200"
                  >
                    <CheckCircle className="w-5 h-5 text-trenddojo-purple-700 mr-3 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-semibold text-lg">AAPL</span>
                  <span className="text-green-400 text-3xl font-mono font-bold">$145.32</span>
                </div>
                
                <div className="h-32 bg-slate-950/80 rounded-lg mb-4 flex items-center justify-center border border-slate-700/50">
                  <span className="text-gray-400">📈 Live Chart Placeholder</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-300 text-sm">Position Size</p>
                    <p className="text-white font-bold">342 shares</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Risk</p>
                    <p className="text-white font-bold">1.5%</p>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">R:R Ratio</p>
                    <p className="text-white font-bold">1:2.5</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-100">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Trusted by Professional Traders
            </h2>
            <p className="text-xl text-slate-700">
              Join thousands who&apos;ve transformed their trading discipline
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <p className="text-slate-700 mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                <div>
                  <p className="text-slate-900 font-semibold">{testimonial.author}</p>
                  <p className="text-slate-600 text-sm">{testimonial.role}, {testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trenddojo-primary-600 to-trenddojo-purple-700">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start Trading with Confidence
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of traders who&apos;ve improved their consistency with 
              systematic risk management and disciplined execution.
            </p>
            <Link href="/signup">
              <Button variant="secondary" size="md" className="bg-white hover:bg-gray-100 text-trenddojo-purple-700 border-0 shadow-lg">
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}