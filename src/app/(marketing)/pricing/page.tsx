"use client";

import { motion } from "framer-motion";
import { Check, Star, Zap } from "lucide-react";
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
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-white mb-6">
              Choose Your Trading Edge
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Start free, then scale with professional tools as your trading grows. 
              All plans include our core risk management and position sizing features.
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm text-gray-400">
              <span>✓ 30-day money back guarantee</span>
              <span>✓ No setup fees</span>
              <span>✓ Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative rounded-2xl p-8 ${
                  tier.popular 
                    ? 'bg-blue-600/10 border-2 border-blue-500' 
                    : 'bg-slate-800/50 border border-slate-700'
                } hover:border-slate-600 transition-colors duration-300`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${tier.price}</span>
                    {tier.price > 0 && <span className="text-gray-400">/month</span>}
                  </div>
                  <p className="text-gray-400">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={`w-full block text-center py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                    tier.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
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
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300">
              Everything you need to know about our pricing and features
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 rounded-lg p-6 mb-6 border border-slate-700"
              >
                <h3 className="text-xl font-semibold text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center"
          >
            <Zap className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Need Enterprise Features?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Custom integrations, dedicated support, and volume pricing for institutions 
              and professional trading firms.
            </p>
            <Link
              href="/contact?type=enterprise"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
            >
              Contact Sales
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}