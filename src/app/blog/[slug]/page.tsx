import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllPostIds, getPostData } from '@/lib/blogPosts'
import BlogPostTemplate from '@/components/blog/BlogPostTemplate'

interface BlogPostParams {
  params: Promise<{
    slug: string;
  }>
}

// Generate static paths for all blog posts
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const posts = getAllPostIds();
    return posts.map(post => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("[generateStaticParams] Failed to generate blog post paths:", error);
    return [];
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: BlogPostParams): Promise<Metadata> {
   const { slug } = await params;
   const postData = await getPostData(slug);
   if (!postData) {
    return { title: 'Post Not Found' }; 
   }

   const { frontmatter } = postData; 

   return {
     title: `${frontmatter.title} | TrendDojo Blog`,
     description: frontmatter.postSummary,
     openGraph: {
        title: frontmatter.title,
        description: frontmatter.postSummary,
        images: frontmatter.mainImage ? [frontmatter.mainImage] : [],
     }
   };
}

export default async function BlogPostPage({ params }: BlogPostParams) {
  const { slug } = await params;
  const postData = await getPostData(slug);
  
  if (!postData) {
    notFound();
  }
  
  return <BlogPostTemplate postData={postData} />;
}