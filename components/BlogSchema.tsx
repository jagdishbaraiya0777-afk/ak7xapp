interface BlogSchemaProps {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  authorName?: string;
}

export function BlogSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  authorName = "ak7x Editorial Team",
}: BlogSchemaProps) {
  const url = `https://ak7x.games/blog/${slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: title,
        description,
        url,
        datePublished,
        dateModified,
        author: {
          "@type": "Person",
          name: authorName,
        },
        publisher: {
          "@type": "Organization",
          name: "ak7x App",
          url: "https://ak7x.games",
          logo: {
            "@type": "ImageObject",
            url: "https://ak7x.games/icon-512.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://ak7x.games",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://ak7x.games/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
