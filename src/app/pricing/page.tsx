"use client";

import { motion } from "framer-motion";
import { Check, Star, TrendingUp } from "lucide-react";
import TrendDojoHeader from "@/components/ui/TrendDojoHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AnimatedPolygonBackground from "@/components/marketing/AnimatedPolygonBackground";
import Link from "next/link";

const pricingTiers = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for getting started with systematic trading",
    features: [
      "1 trading account",
      "1 active position", 
      "5 screener results",
      "15-minute data refresh",
      "Basic charts & analytics",
      "Email support"
    ],
    limitations: [
      "Limited position tracking",
      "No broker integrations",
      "Basic risk management"
    ],
    cta: "Start Free",
    href: "/signup?plan=free",
    popular: false
  },
  {
    name: "Starter", 
    price: 4.99,
    description: "Essential tools for active traders",
    features: [
      "2 trading accounts",
      "5 active positions",
      "25 screener results", 
      "5-minute data refresh",
      "Broker integrations (Alpaca)",
      "Advanced risk controls",
      "Trade journaling",
      "Priority email support"
    ],
    cta: "Start 7-Day Free Trial",
    href: "/signup?plan=starter",
    popular: false
  },
  {
    name: "Basic",
    price: 14.99,
    description: "Professional tools for serious traders",
    features: [
      "3 trading accounts",
      "15 active positions",
      "50 screener results",
      "1-minute data refresh", 
      "All broker integrations",
      "Fundamental data access",
      "Advanced analytics",
      "Custom alerts & notifications",
      "Phone support"
    ],
    cta: "Start 7-Day Free Trial", 
    href: "/signup?plan=basic",
    popular: true
  },
  {
    name: "Pro",
    price: 39.99,
    description: "Everything you need for institutional-level trading",
    features: [
      "10 trading accounts",
      "100 active positions", 
      "200 screener results",
      "Real-time data feeds",
      "All fundamental data",
      "API access & webhooks",
      "Custom indicators",
      "Advanced backtesting",
      "Priority phone support",
      "Account manager"
    ],
    cta: "Start 14-Day Free Trial",
    href: "/signup?plan=pro", 
    popular: false
  }
];

const faqs = [
  {
    question: "Can I change plans at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact support for a full refund."
  },
  {
    question: "What brokers do you support?",
    answer: "We support Alpaca, Interactive Brokers, TD Ameritrade, and more. Check our integrations page for the complete list."
  },
  {
    question: "Is my trading data secure?",
    answer: "Absolutely. We use bank-level encryption and never store your broker credentials. All data is encrypted in transit and at rest."
  },
  {
    question: "Do you offer educational resources?",
    answer: "Yes! All plans include access to our trading education center with courses on risk management, position sizing, and systematic trading."
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TrendDojoHeader variant="pricing" showBackButton={false} />

      {/* Hero Section with Polygons */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 overflow-hidden">
        {/* Polygon Background - Much Higher Density and Brightness */}
        <div className="absolute inset-0 opacity-70">
          <AnimatedPolygonBackground density={1.5} />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Choose Your Trading <span className="text-trenddojo-purple-300">Plan</span>
            </h1>
            <p className="text-xl text-slate-200 mb-8 max-w-3xl mx-auto drop-shadow-md">
              From beginner-friendly tools to institutional-grade infrastructure. 
              Start free and scale as your trading grows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/demo"
                className="bg-trenddojo-primary-600 hover:bg-trenddojo-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                View Live Demo
              </Link>
              <Link
                href="#plans"
                className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 backdrop-blur-sm hover:bg-white/5"
              >
                Compare Plans
              </Link>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-300">
              <span className="flex items-center">✓ 30-day money back guarantee</span>
              <span className="flex items-center">✓ No setup fees</span>
              <span className="flex items-center">✓ Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="plans" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl p-8 border-2 ${
                  tier.popular
                    ? 'border-trenddojo-purple-700 bg-gradient-to-b from-trenddojo-purple-50 to-white shadow-xl'
                    : 'border-slate-200 bg-white hover:border-trenddojo-purple-200 shadow-lg hover:shadow-xl'
                } transition-all duration-300`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-trenddojo-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">${tier.price}</span>
                    {tier.price > 0 && <span className="text-slate-500 ml-2">/month</span>}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-trenddojo-purple-700 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </li>
                  ))}
                  {tier.limitations && (
                    <>
                      <li className="border-t border-slate-200 pt-4 mt-4">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Limitations
                        </span>
                      </li>
                      {tier.limitations.map((limitation, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                          </div>
                          <span className="text-slate-500 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </>
                  )}
                </ul>

                <Link
                  href={tier.href}
                  className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                    tier.popular
                      ? 'bg-trenddojo-purple-700 hover:bg-trenddojo-purple-800 text-white'
                      : tier.name === 'Free'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      : 'bg-trenddojo-primary-600 hover:bg-trenddojo-primary-700 text-white'
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-100">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-700">
              Everything you need to know about TrendDojo pricing and features
            </p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  {faq.question}
                </h3>
                <p className="text-slate-700 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-20 bg-gradient-to-r from-trenddojo-primary-600 to-trenddojo-purple-700">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <TrendingUp className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              You can be wrong more than right and still be profitable
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Smart position management means you can profit even when wrong more than 50% of the time!
            </p>
            <Link
              href="/signup"
              className="bg-white text-trenddojo-purple-700 hover:bg-gray-100 hover:text-trenddojo-purple-800 px-8 py-4 rounded-lg font-semibold transition-colors duration-200 inline-block shadow-lg"
            >
              Start Trading Smarter
            </Link>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}