"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, Shield, Users, Target } from "lucide-react";
import TrendDojoHeader from "@/components/ui/TrendDojoHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AnimatedPolygonBackground from "@/components/marketing/AnimatedPolygonBackground";

const values = [
  {
    icon: Shield,
    title: "Risk-First Approach",
    description: "We believe risk management is more important than returns. Our tools put capital preservation at the center of every trading decision."
  },
  {
    icon: TrendingUp,
    title: "Systematic Excellence",
    description: "Emotion-driven trading fails. We provide the discipline and tools needed for consistent, rule-based trading strategies."
  },
  {
    icon: Users,
    title: "Trader Community",
    description: "We're building a community of disciplined traders who share knowledge, strategies, and support each other's growth."
  },
  {
    icon: Target,
    title: "Precision Tools",
    description: "Every feature is designed with purpose. No bloat, no complexity – just the essential tools professional traders need."
  }
];

const team = [
  {
    name: "Trading Team",
    role: "Strategy & Risk Management",
    description: "Experienced systematic traders with decades of combined market experience across multiple asset classes.",
    avatar: "TT"
  },
  {
    name: "Engineering Team", 
    role: "Platform & Infrastructure",
    description: "Building robust, scalable systems that can handle the demands of professional trading operations.",
    avatar: "ET"
  },
  {
    name: "Risk Team",
    role: "Compliance & Safety",
    description: "Ensuring our platform meets the highest standards for financial technology and regulatory compliance.",
    avatar: "RT"
  }
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "<50ms", label: "Avg Response" },
  { value: "24/7", label: "Monitoring" },
  { value: "SOC 2", label: "Certified" }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TrendDojoHeader variant="internal" showBackButton={false} />

      {/* Hero Section with Animated Polygons */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 overflow-hidden">
        {/* Animated Polygon Background */}
        <div className="absolute inset-0 opacity-50">
          <AnimatedPolygonBackground density={1.0} />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              About <span className="text-trenddojo-purple-700">TrendDojo</span>
            </h1>
            <p className="text-xl text-slate-200 mb-8 drop-shadow-md">
              We&apos;re building the future of systematic trading – where discipline meets technology 
              to help traders achieve consistent, long-term success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-trenddojo-primary-600 hover:bg-trenddojo-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                Join TrendDojo
              </Link>
              <Link
                href="/demo"
                className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 backdrop-blur-sm hover:bg-white/5"
              >
                See Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                Most traders fail not because they can&apos;t pick winners, but because they lack the 
                discipline and systems needed for consistent execution. Emotions, poor risk management, 
                and inconsistent strategies destroy more trading accounts than market crashes.
              </p>
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                <strong>TrendDojo changes that.</strong> We provide the tools, discipline, and community 
                that transform emotional traders into systematic professionals. Our platform automates 
                the hard parts – risk management, position sizing, and trade journaling – so you can 
                focus on what matters: consistent execution of your strategy.
              </p>
              <div className="bg-trenddojo-purple-50 border-l-4 border-trenddojo-purple-700 p-6 rounded-r-lg">
                <p className="text-trenddojo-purple-900 font-medium">
                  &ldquo;Trading is not about predicting the future. It&apos;s about having a process that works 
                  over time and the discipline to follow it consistently.&rdquo;
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-trenddojo-purple-600 to-trenddojo-primary-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">What We Believe</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                    <p>Discipline beats intuition every time</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                    <p>Risk management is more important than returns</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                    <p>Simple systems executed consistently outperform complex strategies</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-white rounded-full mt-3 flex-shrink-0"></div>
                    <p>Technology should amplify human judgment, not replace it</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-100">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Values</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              These principles guide everything we build and how we serve the trading community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <value.icon className="w-12 h-12 text-trenddojo-purple-700 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Team</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A dedicated group of traders, engineers, and risk management experts 
              working to revolutionize systematic trading
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-50 rounded-xl p-8 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-trenddojo-purple-600 to-trenddojo-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{member.name}</h3>
                <p className="text-trenddojo-purple-700 font-medium mb-4">{member.role}</p>
                <p className="text-slate-600 leading-relaxed">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-trenddojo-primary-600 to-trenddojo-purple-700">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Built for Reliability</h2>
            <p className="text-xl text-white/90">
              Professional-grade infrastructure you can depend on
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Trading?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of traders who&apos;ve discovered the power of systematic, disciplined trading. 
              Start your free trial today and experience the difference proper tools and discipline can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-trenddojo-primary-600 hover:bg-trenddojo-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 backdrop-blur-sm hover:bg-white/5"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}