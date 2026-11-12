export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} — Tokeni` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — Tokeni` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
