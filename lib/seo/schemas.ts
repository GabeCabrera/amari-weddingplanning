export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Stem",
    url: "https://scribeandstem.com",
    logo: "https://scribeandstem.com/logo.png",
    description: "Stem is an AI wedding planner that helps couples plan their perfect wedding through natural conversation.",
    email: "hello@scribeandstem.com",
    sameAs: [
      "https://twitter.com/scribeandstem",
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Stem",
    url: "https://scribeandstem.com",
    description: "AI Wedding Planner",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://scribeandstem.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Stem",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description: "Stem is an AI wedding planner that helps couples plan their perfect wedding. Get personalized advice on budgets, venues, timelines, vendors, and more.",
    url: "https://scribeandstem.com",
    author: {
      "@type": "Organization",
      name: "Stem",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan available",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "127",
    },
  };
}

export function generateFAQSchema() {
  const faqs = [
    {
      question: "What is Stem?",
      answer: "Stem is an AI wedding planner that helps couples plan their perfect wedding through natural conversation. Instead of overwhelming forms and checklists, you simply chat with Scribe (our AI) about what you need help with.",
    },
    {
      question: "Is Stem free to use?",
      answer: "Yes, Stem offers a free plan that includes basic planning tools and limited AI messages. Premium plans are available for unlimited AI access and additional features.",
    },
    {
      question: "What can Stem help me with?",
      answer: "Stem can help with wedding budgets, timelines, vendor selection, guest management, seating charts, day-of coordination, and general wedding planning advice. Just ask Scribe about whatever you need help with.",
    },
    {
      question: "How is Stem different from other wedding planning apps?",
      answer: "Stem uses conversational AI (Scribe) to provide personalized guidance instead of generic checklists. It feels like talking to a knowledgeable friend who happens to know everything about weddings.",
    },
    {
      question: "Does Stem sell my data to vendors?",
      answer: "No. Stem never sells your data to vendors or advertisers. Your wedding planning information stays private.",
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateAllSchemas() {
  return [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
    generateSoftwareApplicationSchema(),
    generateFAQSchema(),
  ];
}
