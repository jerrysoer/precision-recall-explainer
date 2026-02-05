import PrecisionRecallExplainer from "@/components/PrecisionRecallExplainer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Precision vs Recall — An Interactive Essay",
  description:
    "Learn the precision-recall tradeoff through interactive examples: spam filters, cancer screening, self-driving cars, fraud detection, and more.",
  author: {
    "@type": "Person",
    name: "jerrysoer",
  },
  publisher: {
    "@type": "Person",
    name: "jerrysoer",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://jerrysoer.github.io/precision-recall-explainer",
  },
  image: "https://jerrysoer.github.io/precision-recall-explainer/og-image.svg",
  articleSection: "Machine Learning",
  keywords: [
    "precision",
    "recall",
    "machine learning",
    "classification",
    "F1 score",
    "confusion matrix",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrecisionRecallExplainer />
    </>
  );
}
