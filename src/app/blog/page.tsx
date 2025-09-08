"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, User, ArrowRight } from "lucide-react";
import TrendDojoHeader from "@/components/ui/TrendDojoHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import AnimatedPolygonBackground from "@/components/marketing/AnimatedPolygonBackground";
import { getSortedPostsData } from "@/lib/blogPosts";
import type { PostData } from "@/types/blog";
import { format, parseISO } from 'date-fns';

// This would normally be fetched server-side
// For now, we'll use a client component with placeholder data
// TODO: Convert to server component when blog posts are created
const PLACEHOLDER_POSTS: PostData[] = [
  {
    id: "welcome-to-trenddojo-blog",
    title: "Welcome to the TrendDojo Blog",
    slug: "welcome-to-trenddojo-blog",
    lastUpdated: "2024-01-15",
    category: "announcements",
    hero: true,
    featured: true,
    mainImage: "/images/blog/welcome-hero.jpg",
    postSummary: "Welcome to our new blog! Here we'll share trading insights, platform updates, and educational content to help you become a better systematic trader.",
    fullArticleIntro: "We're excited to launch our blog as a resource for the trading community.",
    readTime: 3,
    author: "TrendDojo Team"
  },
  {
    id: "systematic-trading-basics",
    title: "The Fundamentals of Systematic Trading",
    slug: "systematic-trading-basics",
    lastUpdated: "2024-01-10",
    category: "education",
    featured: true,
    postSummary: "Learn the core principles that make systematic trading effective for long-term wealth building.",
    readTime: 8,
    author: "Trading Team"
  },
  {
    id: "position-sizing-guide",
    title: "Position Sizing: The Key to Risk Management",
    slug: "position-sizing-guide",
    lastUpdated: "2024-01-05",
    category: "education",
    postSummary: "Master the art of position sizing to protect your capital and maximize returns.",
    readTime: 6,
    author: "Risk Team"
  }
];

function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    'announcements': 'Announcements',
    'education': 'Education',
    'trading': 'Trading',
    'updates': 'Updates',
    'insights': 'Market Insights'
  };
  return categoryMap[category] || category;
}

function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    'announcements': 'bg-blue-100 text-blue-800',
    'education': 'bg-green-100 text-green-800',
    'trading': 'bg-purple-100 text-purple-800',
    'updates': 'bg-orange-100 text-orange-800',
    'insights': 'bg-indigo-100 text-indigo-800'
  };
  return colorMap[category] || 'bg-gray-100 text-gray-800';
}

export default function BlogPage() {
  const posts = PLACEHOLDER_POSTS; // TODO: Replace with getSortedPostsData()
  const featuredPosts = posts.filter(post => post.featured);
  const recentPosts = posts.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50">
      <TrendDojoHeader variant="internal" showBackButton={false} />

      {/* Hero Section with Animated Polygons */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 overflow-hidden">
        {/* Animated Polygon Background */}
        <div className="absolute inset-0 opacity-60">
          <AnimatedPolygonBackground density={1.2} />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              TrendDojo <span className="text-trenddojo-purple-300">Blog</span>
            </h1>
            <p className="text-xl text-slate-200 mb-8 drop-shadow-md">
              Insights, education, and updates to help you master systematic trading
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-trenddojo-primary-600 hover:bg-trenddojo-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
              >
                Start Trading Systematically
              </Link>
              <Link
                href="/demo"
                className="border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 backdrop-blur-sm hover:bg-white/5"
              >
                See Platform Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Articles</h2>
              <p className="text-xl text-slate-600">Essential reads for systematic traders</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-200"
                >
                  {post.mainImage && (
                    <div className="relative h-48 w-full">
                      <div className="bg-gradient-to-br from-trenddojo-purple-600 to-trenddojo-primary-600 w-full h-full flex items-center justify-center">
                        <div className="text-white text-6xl font-bold opacity-20">TD</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                        {getCategoryDisplayName(post.category)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {post.postSummary}
                    </p>

                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(post.lastUpdated), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime} min read
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-trenddojo-purple-700 hover:text-trenddojo-purple-800 font-medium transition-colors"
                    >
                      Read Article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-16 bg-slate-100">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Latest Articles</h2>
            <p className="text-xl text-slate-600">Stay updated with our latest content</p>
          </motion.div>

          <div className="grid gap-8 max-w-4xl mx-auto">
            {recentPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 group"
              >
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                          {getCategoryDisplayName(post.category)}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-trenddojo-purple-700 transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-slate-600 mb-4 line-clamp-2">
                        {post.postSummary}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(post.lastUpdated), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime} min read
                        </div>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-trenddojo-purple-700 hover:text-trenddojo-purple-800 font-medium transition-colors"
                      >
                        Read Full Article <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {post.mainImage && (
                      <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <div className="bg-gradient-to-br from-trenddojo-purple-600 to-trenddojo-primary-600 w-full h-full flex items-center justify-center">
                          <div className="text-white text-2xl font-bold opacity-30">TD</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}