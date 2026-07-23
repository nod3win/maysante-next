import { listPublishedArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

// ISR : la liste est mise en cache et rafraîchie au plus toutes les 60 s,
// ce qui évite une requête MySQL à chaque visite tout en gardant les
// publications quasi immédiates.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Maysanté",
  description:
    "Conseils santé, actualités et guides pratiques pour prendre soin de vous et de vos proches à domicile.",
  alternates: { canonical: "https://maysante.be/blog" },
};

export default async function BlogPage() {
  const posts = await listPublishedArticles();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-3">Blog Maysanté</h1>
            <p className="text-muted-foreground max-w-xl">
              Conseils santé, actualités et guides pratiques pour prendre soin de vous et de vos proches.
            </p>
          </div>

          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post} headingTag="h2" />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>Aucun article publié pour le moment. Revenez bientôt !</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
