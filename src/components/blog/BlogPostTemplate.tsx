"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, Clock, User, Share2 } from "lucide-react";
import TrendDojoHeader from "@/components/ui/TrendDojoHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { PostFrontmatter } from "@/types/blog";

interface BlogPostTemplateProps {
  postData: {
    id: string;
    rawSource: string;
    frontmatter: PostFrontmatter;
  }
}

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

// MDX Components
const mdxComponents = {
  h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold text-slate-900 mt-8 mb-6 first:mt-0" {...props} />
  ),
  h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-bold text-slate-900 mt-8 mb-4" {...props} />
  ),
  h3: (props: React.HTMLProps<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-semibold text-slate-900 mt-6 mb-3" {...props} />
  ),
  p: (props: React.HTMLProps<HTMLParagraphElement>) => (
    <p className="text-slate-700 leading-relaxed mb-6" {...props} />
  ),
  ul: (props: React.HTMLProps<HTMLUListElement>) => (
    <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2" {...props} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside text-slate-700 mb-6 space-y-2" {...props} />
  ),
  li: (props: React.HTMLProps<HTMLLIElement>) => (
    <li className="mb-2" {...props} />
  ),
  a: (props: React.HTMLProps<HTMLAnchorElement>) => (
    <a className="text-trenddojo-purple-700 hover:text-trenddojo-purple-800 underline transition-colors" {...props} />
  ),
  blockquote: (props: React.HTMLProps<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-trenddojo-purple-700 bg-slate-50 p-6 my-6 italic text-slate-700" {...props} />
  ),
  code: (props: React.HTMLProps<HTMLElement>) => (
    <code className="bg-slate-100 text-trenddojo-purple-800 px-2 py-1 rounded text-sm font-mono" {...props} />
  ),
  pre: (props: React.HTMLProps<HTMLPreElement>) => (
    <pre className="bg-slate-900 text-slate-100 p-6 rounded-lg overflow-x-auto mb-6 font-mono text-sm" {...props} />
  ),
  img: (props: React.HTMLProps<HTMLImageElement>) => {
    const { src, alt } = props;
    if (!src) {
      return null;
    }
    return (
      <div className="my-8">
        <Image
          src={src}
          alt={alt || 'Blog post image'}
          width={800}
          height={400}
          className="rounded-lg shadow-sm w-full h-auto"
        />
      </div>
    );
  },
};

export default function BlogPostTemplate({ postData }: BlogPostTemplateProps) {
  const { rawSource, frontmatter } = postData;
  
  const categoryDisplay = getCategoryDisplayName(frontmatter.category);
  const categoryColor = getCategoryColor(frontmatter.category);
  
  let displayDate = '';
  try {
    displayDate = format(parseISO(frontmatter.lastUpdated), 'MMMM d, yyyy');
  } catch {
    displayDate = 'Recently published';
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: frontmatter.title,
        text: frontmatter.postSummary,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      // You might want to show a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <TrendDojoHeader variant="internal" showBackButton={false} />

      <article className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Back to Blog */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-trenddojo-purple-700 hover:text-trenddojo-purple-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          {/* Category */}
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}>
              {categoryDisplay}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {frontmatter.title}
          </h1>

          {/* Article Intro */}
          {frontmatter.fullArticleIntro && (
            <div className="bg-trenddojo-purple-50 border-l-4 border-trenddojo-purple-700 p-6 rounded-r-lg mb-8">
              <p className="text-lg text-slate-700 leading-relaxed">
                {frontmatter.fullArticleIntro}
              </p>
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8">
            {frontmatter.author && (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{frontmatter.author}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{displayDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{frontmatter.readTime} min read</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 hover:text-trenddojo-purple-700 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Hero Image */}
          {frontmatter.mainImage && (
            <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-lg mb-8">
              <div className="bg-gradient-to-br from-trenddojo-purple-600 to-trenddojo-primary-600 w-full h-full flex items-center justify-center">
                <div className="text-white text-8xl font-bold opacity-20">TD</div>
              </div>
            </div>
          )}
        </motion.header>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg prose-slate max-w-none"
        >
          <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 border border-slate-200">
            <MDXRemote 
              source={rawSource} 
              components={mdxComponents}
            />
          </div>
        </motion.div>

        {/* Article Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-slate-200"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex gap-4">
              <Link
                href="/blog"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                More Articles
              </Link>
              <Link
                href="/signup"
                className="bg-trenddojo-primary-600 hover:bg-trenddojo-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try TrendDojo
              </Link>
            </div>
          </div>
        </motion.footer>
      </article>

      <MarketingFooter />
    </div>
  );
}