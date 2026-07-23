import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import ValuesSection from "@/components/ValuesSection";
import CoverageSection from "@/components/CoverageSection";
import FAQSection from "@/components/FAQSection";
import BlogSection from "@/components/BlogSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

// ISR : rafraîchit la section blog de la page d'accueil au plus toutes les 60 s.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Maysanté — Soins à domicile à Bruxelles",
  description:
    "Soins infirmiers et garde malade à domicile à Bruxelles et périphérie. Prise en charge personnalisée, disponible 7j/7 par des professionnels qualifiés.",
  alternates: { canonical: "https://maysante.be" },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <ValuesSection />
        <CoverageSection />
        <FAQSection />
        <BlogSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
