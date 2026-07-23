import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { listPublishedArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";

const BlogSection = async () => {
  const posts = await listPublishedArticles(3);

  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-card">
      <div className="max-w-6xl mx-auto px-5">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl text-foreground mb-3">Nos derniers articles</h2>
            <p className="text-muted-foreground max-w-lg">
              Conseils santé, actualités et guides pratiques pour prendre soin de vous et de vos proches.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline shrink-0"
          >
            Voir tous les articles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <ArticleCard
              key={post.id}
              post={post}
              headingTag="h3"
              surface="background"
              excerptLines={2}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
