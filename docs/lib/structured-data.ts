export function generateStructuredData() {
  const baseUrl = "https://hivecms.online";

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Hive CMS",
    url: baseUrl,
    description:
      "Write content in one place and fetch it from any frontend with a straightforward API, so your team can focus on what to say instead of how to wire it up.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      ratingCount: "1",
    },
    author: {
      "@type": "Person",
      name: "Nirav",
      url: "https://github.com/ni3rav",
    },
    publisher: {
      "@type": "Organization",
      name: "Hive",
      url: baseUrl,
    },
    screenshot: `${baseUrl}/hive-dashboard.png`,
  };
}

export function generateOrganizationData() {
  const baseUrl = "https://hivecms.online";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hive",
    url: baseUrl,
    logo: `${baseUrl}/hive.png`,
    sameAs: ["https://twitter.com/ni3rav", "https://github.com/ni3rav/hive"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Technical Support",
      url: `${baseUrl}/docs`,
    },
  };
}

export function generateWebSiteData() {
  const baseUrl = "https://hivecms.online";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hive",
    url: baseUrl,
    description:
      "A simple CMS for your next project. Write content in one place and fetch it from any frontend.",
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/docs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbData(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateArticleData(params: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: params.title,
    description: params.description,
    image: params.image,
    url: params.url,
    datePublished: params.datePublished || new Date().toISOString(),
    dateModified: params.dateModified || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: "Nirav",
      url: "https://github.com/ni3rav",
    },
    publisher: {
      "@type": "Organization",
      name: "Hive",
      url: "https://hivecms.online",
      logo: {
        "@type": "ImageObject",
        url: "https://hivecms.online/hive.png",
      },
    },
    inLanguage: "en-US",
  };
}
