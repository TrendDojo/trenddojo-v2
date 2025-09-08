// lib/blogPosts.ts - Blog post utilities for TrendDojo
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { PostFrontmatter, PostData } from '@/types/blog'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export function getSortedPostsData(): PostData[] {
  let fileNames: string[] = [];
  try {
    fileNames = fs.readdirSync(postsDirectory);
  } catch (_err) {
    console.warn("Blog directory not found or empty:", postsDirectory);
    return [];
  }

  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx') || fileName.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.(mdx|md)$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      let fileContents = '';
      try {
        fileContents = fs.readFileSync(fullPath, 'utf8');
      } catch (_readErr) {
          console.error(`[getSortedPostsData] Error reading file ${fullPath}:`, _readErr);
          return null; // Skip this file if read error
      }
      
      try {
        const matterResult = matter(fileContents);
        const frontmatter = matterResult.data as PostFrontmatter;

        // Skip draft posts in production
        if (process.env.NODE_ENV === 'production' && frontmatter.draft === true) {
          return null;
        }

        // Create the PostData object
        const postDataObject: PostData = {
            id,
            title: frontmatter.title ?? 'Untitled Post',
            slug: frontmatter.slug ?? id,
            lastUpdated: frontmatter.lastUpdated ?? new Date().toISOString().split('T')[0],
            category: frontmatter.category ?? 'Trading',
            hero: frontmatter.hero ?? false,
            featured: frontmatter.featured ?? false,
            mainImage: frontmatter.mainImage,
            postSummary: frontmatter.postSummary ?? '',
            fullArticleIntro: frontmatter.fullArticleIntro,
            readTime: frontmatter.readTime ?? 3,
            author: frontmatter.author ?? 'TrendDojo Team'
        };
        return postDataObject;

      } catch (_parseErr) {
          console.error(`[getSortedPostsData] Error parsing frontmatter for ${fileName}:`, _parseErr);
          return null; // Skip this file if frontmatter parse error
      }
    })
    .filter((post): post is PostData => post !== null); // Filter out nulls from errors

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => {
    try {
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    } catch (_dateErr) {
        console.error("Error comparing dates during sort:", _dateErr);
        return 0; // Keep original order if dates are invalid
    }
  });
}

export function getAllPostIds() {
   let fileNames: string[] = [];
   try {
      fileNames = fs.readdirSync(postsDirectory);
   } catch (_err) {
       console.warn("Blog directory not found or empty:", postsDirectory);
       return []; 
   }

  return fileNames
    .filter((fileName) => fileName.endsWith('.mdx') || fileName.endsWith('.md'))
    .map((fileName) => {
      const id = fileName.replace(/\.(mdx|md)$/, '');
      
      // Skip draft posts in production
      if (process.env.NODE_ENV === 'production') {
        const fullPath = path.join(postsDirectory, fileName);
        try {
          const fileContents = fs.readFileSync(fullPath, 'utf8');
          const matterResult = matter(fileContents);
          if (matterResult.data.draft === true) {
            return null;
          }
        } catch (_err) {
          console.error(`Error reading file ${fullPath}:`, _err);
        }
      }
      
      return { slug: id };
    })
    .filter((item): item is { slug: string } => item !== null);
}

export async function getPostData(slug: string): Promise<{ id: string; rawSource: string; frontmatter: PostFrontmatter } | null> {
  const filePathMdx = path.join(postsDirectory, `${slug}.mdx`);
  const filePathMd = path.join(postsDirectory, `${slug}.md`);
  let fileContents;
  let filePath = filePathMdx; // Assume mdx first

  try {
    if (fs.existsSync(filePath)) {
        fileContents = fs.readFileSync(filePath, 'utf8');
    } else if (fs.existsSync(filePathMd)) {
        filePath = filePathMd;
        fileContents = fs.readFileSync(filePath, 'utf8');
    } else {
        console.error(`Blog post file not found for slug: ${slug} (Checked .mdx and .md)`);
        return null;
    }
  } catch (_err) {
      console.error(`Error reading blog post ${slug}:`, _err);
      return null;
  }

  try {
    const matterResult = matter(fileContents);
    
    let cleanContent = matterResult.content;
    if (cleanContent.endsWith('%')) {
      cleanContent = cleanContent.slice(0, -1).trim();
    }
    if (!cleanContent.endsWith('\n')) {
      cleanContent += '\n';
    }
    
    return {
      id: slug,
      rawSource: cleanContent, // Return the raw, cleaned content
      frontmatter: matterResult.data as PostFrontmatter, 
    };
  } catch (_err) {
      console.error(`Error parsing frontmatter for ${slug}:`, _err);
      return null;
  }
}