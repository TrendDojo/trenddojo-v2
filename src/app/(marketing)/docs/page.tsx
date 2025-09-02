"use client";

import { motion } from "framer-motion";
import { BookOpen, Code, Zap, Users, Video, HelpCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

const docCategories = [
  {
    title: "Getting Started",
    icon: BookOpen,
    description: "Everything you need to start trading systematically",
    articles: [
      { title: "Quick Start Guide", description: "Set up your first account in 5 minutes", time: "5 min read" },
      { title: "Connecting Your Broker", description: "Link Alpaca, IBKR, or TD Ameritrade", time: "8 min read" },
      { title: "Your First Trade", description: "Step-by-step trade execution walkthrough", time: "12 min read" },
      { title: "Risk Management Basics", description: "Essential concepts for protecting your capital", time: "15 min read" }
    ]
  },
  {
    title: "Risk Management",
    icon: Zap,
    description: "Master position sizing and risk control techniques", 
    articles: [
      { title: "Position Sizing Calculator", description: "How to use our advanced position sizing tools", time: "10 min read" },
      { title: "Stop Loss Strategies", description: "Different approaches to cutting losses", time: "18 min read" },
      { title: "Portfolio Risk Monitoring", description: "Keep track of your total exposure", time: "12 min read" },
      { title: "Correlation Analysis", description: "Avoid concentration risk in your positions", time: "15 min read" }
    ]
  },
  {
    title: "API Documentation", 
    icon: Code,
    description: "Build custom integrations and automated strategies",
    articles: [
      { title: "API Overview", description: "RESTful API for programmatic trading", time: "8 min read" },
      { title: "Authentication", description: "Secure API key management and OAuth flows", time: "6 min read" },
      { title: "Webhooks", description: "Real-time notifications for trade events", time: "10 min read" },
      { title: "SDKs & Libraries", description: "Python, JavaScript, and Go client libraries", time: "5 min read" }
    ]
  },
  {
    title: "Advanced Features",
    icon: Users,
    description: "Professional tools for experienced traders",
    articles: [
      { title: "Custom Indicators", description: "Build and backtest your own indicators", time: "25 min read" },
      { title: "Strategy Automation", description: "Automate your trading strategies", time: "30 min read" },
      { title: "Multi-Account Management", description: "Manage multiple trading accounts", time: "12 min read" },
      { title: "Performance Analytics", description: "Deep dive into your trading metrics", time: "20 min read" }
    ]
  }
];

const quickLinks = [
  { title: "Trading Tutorial Videos", icon: Video, href: "/docs/videos" },
  { title: "FAQ", icon: HelpCircle, href: "/docs/faq" },
  { title: "API Reference", icon: Code, href: "/docs/api" },
  { title: "Support Center", icon: Users, href: "/support" }
];

const popularArticles = [
  {
    title: "How to Size Your Positions Like a Pro",
    description: "The complete guide to systematic position sizing",
    category: "Risk Management",
    readTime: "15 min read",
    views: "12.5k views"
  },
  {
    title: "Connecting to Interactive Brokers",
    description: "Step-by-step IBKR integration guide",
    category: "Getting Started", 
    readTime: "10 min read",
    views: "8.2k views"
  },
  {
    title: "Building Your First Trading Bot",
    description: "Automate trades with our Python SDK",
    category: "API Documentation",
    readTime: "25 min read", 
    views: "6.8k views"
  }
];

export default function DocsPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-white mb-6">
              Documentation
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Everything you need to master systematic trading with TrendDojo. 
              From beginner guides to advanced API documentation.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-slate-900/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="flex items-center space-x-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg p-4 transition-colors duration-200"
                >
                  <link.icon className="w-6 h-6 text-blue-400" />
                  <span className="text-white font-medium">{link.title}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Categories */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Documentation Categories
            </h2>
            <p className="text-xl text-gray-300">
              Find exactly what you&apos;re looking for
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {docCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 rounded-xl p-6 border border-slate-700"
              >
                <div className="flex items-center mb-4">
                  <category.icon className="w-8 h-8 text-blue-400 mr-3" />
                  <h3 className="text-2xl font-semibold text-white">{category.title}</h3>
                </div>
                <p className="text-gray-400 mb-6">{category.description}</p>
                
                <div className="space-y-3">
                  {category.articles.map((article) => (
                    <Link
                      key={article.title}
                      href={`/docs/${category.title.toLowerCase().replace(/\s+/g, '-')}/${article.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block p-3 rounded-lg hover:bg-slate-700/50 transition-colors duration-200 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-gray-400 text-sm mt-1">{article.description}</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-4">{article.time}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Popular Articles
            </h2>
            <p className="text-xl text-gray-300">
              Most read documentation by the TrendDojo community
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {popularArticles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 rounded-lg p-6 mb-4 border border-slate-700 hover:border-slate-600 transition-colors duration-200"
              >
                <Link href={`/docs/${article.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded-full mr-3">
                          {article.category}
                        </span>
                        <span className="text-gray-500 text-sm">{article.views}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-white hover:text-blue-400 transition-colors mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-400">{article.description}</p>
                    </div>
                    <span className="text-sm text-gray-500 ml-4">{article.readTime}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Help CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-center"
          >
            <HelpCircle className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help 
              you succeed with systematic trading.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/support"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Contact Support
              </Link>
              <Link
                href="/community"
                className="border border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 backdrop-blur-sm"
              >
                Join Community
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}