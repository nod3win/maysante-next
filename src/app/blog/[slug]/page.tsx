import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import sanitizeHtml from "sanitize-html";
import { getPublishedArticleBySlug } from "@/lib/articles";
import { formatDateFr } from "@/lib/format";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

// ISR : chaque article est mis en cache et rafraîchi au plus toutes les 60 s.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedArticleBySlug(slug);
  if (!post) return { title: "Article introuvable" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `https://maysante.be/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} — Maysanté`,
      description: post.excerpt ?? undefined,
      url: `https://maysante.be/blog/${post.slug}`,
      type: "article",
      publishedTime: post.published_at,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedArticleBySlug(slug);
  if (!post) notFound();

  const safeBody = sanitizeHtml(post.body, {
    allowedTags: ["h2", "h3", "p", "ul", "ol", "li", "strong", "em", "a", "blockquote", "br"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
  });

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-5">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Tous les articles
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
            )}
            <p className="text-sm text-muted-foreground mt-6 pt-6 border-t border-border">
              {formatDateFr(post.published_at)}
            </p>
          </div>

          <div
            className="prose prose-lg prose-gray max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-li:text-muted-foreground
              prose-blockquote:border-primary prose-blockquote:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: safeBody }}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
