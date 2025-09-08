"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Calculator, Shield, TrendingUp, BarChart3, Zap,
  Settings, AlertTriangle, Link as LinkIcon, 
  Lock
} from "lucide-react";
import TrendDojoHeader from "@/components/ui/TrendDojoHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AnimatedPolygonBackground from "@/components/marketing/AnimatedPolygonBackground";

const heroFeatures = [
  {
    icon: Calculator,
    title: "Smart Position Sizing",
    description: "Automatically calculate optimal position sizes based on your risk tolerance, account balance, and stop-loss levels. Never risk more than you can afford to lose."
  },
  {
    icon: Shield, 
    title: "Advanced Risk Management",
    description: "Multi-layered risk controls including position limits, correlation analysis, drawdown protection, and automatic stop-loss management."
  },
  {
    icon: TrendingUp,
    title: "Broker Integration",
    description: "Connect seamlessly to major brokers like Alpaca, Interactive Brokers, and TD Ameritrade for automated trade execution."
  }
];

const detailedFeatures = [
  {
    category: "Risk Management",
    icon: Shield,
    features: [
      {
        name: "Position Size Calculator",
        description: "Calculate exact position sizes based on risk percentage, stop loss, and account balance",
        highlight: "Prevent account-destroying trades"
      },
      {
        name: "Portfolio Risk Monitor",
        description: "Real-time monitoring of total portfolio exposure and correlation risk",
        highlight: "Stay within risk limits"
      },
      {
        name: "Stop Loss Automation",
        description: "Automatic stop-loss placement and adjustment based on market conditions",
        highlight: "Emotionless exits"
      },
      {
        name: "Correlation Analysis",
        description: "Identify and limit correlated positions to reduce portfolio risk",
        highlight: "Avoid concentration risk"
      }
    ]
  },
  {
    category: "Trade Execution",
    icon: Zap,
    features: [
      {
        name: "One-Click Trading",
        description: "Execute pre-planned trades instantly with all parameters calculated",
        highlight: "Speed and precision"
      },
      {
        name: "Order Management",
        description: "Advanced order types, bracket orders, and conditional execution",
        highlight: "Professional-grade tools"
      },
      {
        name: "Multi-Broker Support",
        description: "Connect multiple brokerage accounts and manage them from one platform",
        highlight: "Unified control"
      },
      {
        name: "Paper Trading",
        description: "Test strategies and practice with real market data, zero risk",
        highlight: "Risk-free learning"
      }
    ]
  },
  {
    category: "Analytics & Insights",
    icon: BarChart3,
    features: [
      {
        name: "Performance Tracking",
        description: "Detailed P&L analysis, win rates, risk-adjusted returns, and Sharpe ratios",
        highlight: "Know your edge"
      },
      {
        name: "Trade Journal",
        description: "Automatic trade logging with notes, screenshots, and performance metrics",
        highlight: "Learn from every trade"
      },
      {
        name: "Advanced Charts",
        description: "Professional charting with 100+ technical indicators and drawing tools",
        highlight: "Market analysis"
      },
      {
        name: "Custom Dashboards",
        description: "Create personalized views of your most important metrics and data",
        highlight: "Your trading at a glance"
      }
    ]
  },
  {
    category: "Market Data",
    icon: TrendingUp,
    features: [
      {
        name: "Real-Time Quotes",
        description: "Live market data from major exchanges with sub-second latency",
        highlight: "Professional data feeds"
      },
      {
        name: "Fundamental Data",
        description: "Company financials, earnings, ratios, and analyst recommendations",
        highlight: "Make informed decisions"
      },
      {
        name: "Economic Calendar",
        description: "Track major economic events and their impact on your positions",
        highlight: "Stay ahead of news"
      },
      {
        name: "Options Data",
        description: "Complete options chains, Greeks, and volatility analysis",
        highlight: "Advanced strategies"
      }
    ]
  }
];

const integrations = [
  { name: "Alpaca", description: "Commission-free stock & crypto trading", status: "live" },
  { name: "Interactive Brokers", description: "Professional trading platform", status: "live" },
  { name: "TD Ameritrade", description: "Full-service brokerage", status: "live" },
  { name: "Schwab", description: "Investment services", status: "coming" },
  { name: "Fidelity", description: "Investment management", status: "coming" },
  { name: "E*TRADE", description: "Online trading", status: "coming" }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <TrendDojoHeader variant="internal" showBackButton={false} />

      {/* Hero Section with Animated Polygons */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 overflow-hidden">
        {/* Animated Polygon Background */}
        <div className="absolute inset-0 opacity-60">
          <AnimatedPolygonBackground density={1.0} />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Professional <span className="text-trenddojo-purple-700">Features</span>
            </h1>
            <p className="text-xl text-slate-200 mb-8 drop-shadow-md">
              Everything you need to trade systematically with discipline. 
              From position sizing to risk management, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-trenddojo-primary-600 hover:bg-trenddojo-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/demo"
                className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 backdrop-blur-sm hover:bg-white/5"
              >
                View Demo
              </Link>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {heroFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center"
              >
                <feature.icon className="w-16 h-16 text-trenddojo-purple-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      {detailedFeatures.map((category, categoryIndex) => (
        <section key={category.category} className={categoryIndex % 2 === 1 ? "py-20 bg-slate-800" : "py-20 bg-slate-900"}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <category.icon className="w-16 h-16 text-trenddojo-purple-400 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">
                {category.category}
              </h2>
              <p className="text-xl text-slate-300">
                {category.category === "Risk Management" && "Protect your capital with systematic risk controls"}
                {category.category === "Trade Execution" && "Execute trades with speed and precision"}
                {category.category === "Analytics & Insights" && "Track performance and improve your edge"}
                {category.category === "Market Data" && "Professional-grade data feeds and analysis"}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {category.features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">{feature.name}</h3>
                    <span className="bg-trenddojo-purple-600/20 text-trenddojo-purple-300 text-xs px-2 py-1 rounded-full">
                      {feature.highlight}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Integrations */}
      <section className="py-20 bg-slate-800">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <LinkIcon className="w-16 h-16 text-trenddojo-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Broker Integrations
            </h2>
            <p className="text-xl text-slate-300">
              Connect to your favorite brokers and trade from one unified platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 text-center"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{integration.name}</h3>
                <p className="text-slate-400 text-sm mb-3">{integration.description}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  integration.status === 'live' 
                    ? 'bg-green-600/20 text-green-300' 
                    : 'bg-yellow-600/20 text-yellow-300'
                }`}>
                  {integration.status === 'live' ? 'Live' : 'Coming Soon'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Lock className="w-16 h-16 text-trenddojo-purple-400 mb-6" />
              <h2 className="text-4xl font-bold text-white mb-6">
                Bank-Level Security
              </h2>
              <p className="text-xl text-slate-200 mb-6">
                Your trading data and account information are protected with the same 
                security standards used by major financial institutions.
              </p>
              <ul className="space-y-4">
                {[
                  "256-bit SSL encryption for all data transmission",
                  "SOC 2 Type II compliant infrastructure", 
                  "Multi-factor authentication required",
                  "Regular security audits and penetration testing",
                  "Never store broker passwords or API keys"
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center text-slate-200"
                  >
                    <Lock className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
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
              className="bg-slate-800/50 rounded-xl p-8 border border-slate-700"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Security Features</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <Lock className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">End-to-End Encryption</h4>
                    <p className="text-slate-300 text-sm">All data encrypted in transit and at rest</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-trenddojo-purple-600/20 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-trenddojo-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">OAuth Integration</h4>
                    <p className="text-slate-300 text-sm">Secure broker connections without passwords</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Fraud Detection</h4>
                    <p className="text-slate-300 text-sm">AI-powered monitoring for suspicious activity</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-trenddojo-primary-600 to-trenddojo-purple-700">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Trade with Discipline?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Start your free trial today and experience professional-grade 
              trading tools designed for consistent results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-white text-trenddojo-purple-700 hover:bg-gray-100 hover:text-trenddojo-purple-800 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Start Free Trial
              </Link>
              <Link
                href="/demo"
                className="border border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 backdrop-blur-sm"
              >
                View Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}