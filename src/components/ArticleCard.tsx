import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicArticleSummary } from "@/lib/articles";
import { formatDateFr } from "@/lib/format";

export default function ArticleCard({
  post,
  headingTag: Heading = "h3",
  surface = "card",
  excerptLines = 3,
}: {
  post: PublicArticleSummary;
  headingTag?: "h2" | "h3";
  surface?: "card" | "background";
  excerptLines?: 2 | 3;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group border border-border rounded-2xl overflow-hidden flex flex-col transition-all hover:border-primary/40 hover:shadow-lg p-6 ${
        surface === "card" ? "bg-card" : "bg-background"
      }`}
    >
      <div className="flex flex-col gap-3 flex-1">
        <Heading className="text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
          {post.title}
        </Heading>
        {post.excerpt && (
          <p
            className={`text-sm text-muted-foreground leading-relaxed ${
              excerptLines === 2 ? "line-clamp-2" : "line-clamp-3"
            }`}
          >
            {post.excerpt}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{formatDateFr(post.published_at)}</span>
          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
            Lire <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
