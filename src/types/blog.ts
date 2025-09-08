// Blog post types for TrendDojo

export interface PostFrontmatter {
  title: string;
  slug: string;         
  lastUpdated: string;  // Expecting 'YYYY-MM-DD' or similar parseable date string
  category: string;     // Categories like 'trading', 'education', 'updates' etc.
  hero?: boolean;       // Optional flag for hero display
  featured?: boolean;   // Optional flag for featured display
  draft?: boolean;      // Optional flag to exclude posts from production
  mainImage?: string;   // Path or URL to the main image (now optional)
  postSummary: string;  // Short excerpt/summary
  fullArticleIntro?: string; // Optional longer intro for the post page
  readTime: number;     // Manually set reading time
  author?: string;      // Optional author name
  [key: string]: any;  // Allows for any other fields if needed
}

// Represents the data structure often used for listing posts (includes id/slug)
export interface PostData extends PostFrontmatter {
  id: string; // Usually the slug derived from filename
}

// Represents the full data for a single post page, including processed MDX content
export interface FullPostData {
  id: string;         // Slug
  mdxSource: any;     // Serialized MDX result from next-mdx-remote/serialize
  frontmatter: PostFrontmatter; // The parsed frontmatter object
  content?: string;   // Raw MDX content as fallback
}