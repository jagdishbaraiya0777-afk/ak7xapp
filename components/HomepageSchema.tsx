export function HomepageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "ak7x App",
        alternateName: ["ak7x game", "ak7x games app"],
        operatingSystem: "Android",
        applicationCategory: "GameApplication",
        downloadUrl: "https://ak7x.games/download",
        url: "https://ak7x.games",
        description:
          "ak7x App is a fast Android application for mobile players. Download the ak7x APK for quick access to games, wallet management, and promotions.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        publisher: {
          "@type": "Organization",
          name: "ak7x App",
          url: "https://ak7x.games",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is the ak7x game?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The ak7x game is an online gaming platform available as a mobile app for Android devices. Players use the ak7x app to access games, manage their wallet, and participate in promotions.",
            },
          },
          {
            "@type": "Question",
            name: "How do I download the ak7x APK?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Tap the official Download button on ak7x.games to get the ak7x APK file. Enable Unknown Sources in your Android settings, open the file, and tap Install. The process takes under 5 minutes.",
            },
          },
          {
            "@type": "Question",
            name: "Is the ak7x app download safe?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Download only from the official ak7x.games page. The APK is secure and does not require unnecessary permissions. Avoid third-party download mirrors.",
            },
          },
          {
            "@type": "Question",
            name: "Which Android version supports ak7x?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The ak7x app requires Android 5.0 or above and works on most mid-range devices released after 2018.",
            },
          },
        ],
      },
      {
        "@type": "WebSite",
        url: "https://ak7x.games",
        name: "ak7x App",
        description:
          "Official resource for ak7x app download, ak7x APK, and ak7x games.",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://ak7x.games/blog?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
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
