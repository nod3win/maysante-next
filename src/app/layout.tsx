import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import StickyCallButton from "@/components/StickyCallButton";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
});

const BASE_URL = "https://maysante.be";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Maysanté — Soins à domicile à Bruxelles",
    template: "%s — Maysanté",
  },
  description:
    "Soins infirmiers et garde malade à domicile à Bruxelles et périphérie. Disponible 7j/7. Prise en charge personnalisée par des professionnels qualifiés.",
  keywords: [
    "soins infirmiers domicile Bruxelles",
    "garde malade Bruxelles",
    "infirmier à domicile",
    "soins à domicile Bruxelles",
    "aide soignant domicile",
    "soins palliatifs domicile",
    "pansements domicile Bruxelles",
    "Maysanté",
  ],
  authors: [{ name: "Maysanté", url: BASE_URL }],
  creator: "Maysanté",
  publisher: "Maysanté",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
    languages: { fr: BASE_URL },
  },
  openGraph: {
    type: "website",
    locale: "fr_BE",
    url: BASE_URL,
    siteName: "Maysanté",
    title: "Maysanté — Soins à domicile à Bruxelles",
    description:
      "Soins infirmiers et garde malade à domicile à Bruxelles et périphérie. Disponible 7j/7.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Maysanté" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maysanté — Soins à domicile à Bruxelles",
    description:
      "Soins infirmiers et garde malade à domicile à Bruxelles et périphérie. Disponible 7j/7.",
    images: ["/twitter-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "MedicalBusiness"],
      "@id": `${BASE_URL}/#business`,
      name: "Maysanté",
      description:
        "Soins infirmiers et garde malade à domicile à Bruxelles et périphérie. Disponible 7j/7.",
      url: BASE_URL,
      telephone: "+32456872138",
      email: "info@maysante.be",
      logo: `${BASE_URL}/icon.png`,
      image: `${BASE_URL}/opengraph-image.png`,
      priceRange: "$$",
      currenciesAccepted: "EUR",
      openingHours: "Mo-Su 00:00-24:00",
      areaServed: {
        "@type": "AdministrativeArea",
        name: "Région de Bruxelles-Capitale et périphérie",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bruxelles",
        addressRegion: "Bruxelles-Capitale",
        addressCountry: "BE",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 50.8503,
        longitude: 4.3517,
      },
      hasMap: "https://maps.google.com/?q=Bruxelles,BE",
      medicalSpecialty: ["Nursing", "HomeHealthcare"],
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Maysanté",
      description: "Soins infirmiers et garde malade à domicile à Bruxelles et périphérie.",
      inLanguage: "fr-BE",
      publisher: { "@id": `${BASE_URL}/#business` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={plusJakartaSans.variable}>
        <Providers>{children}</Providers>
        <StickyCallButton />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
