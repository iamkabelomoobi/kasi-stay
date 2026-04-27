import {
  ArticleCategoryCode,
  StaticPageStatus,
  StaticPageType,
  prisma,
} from "../index";

const articleCategories = [
  {
    code: ArticleCategoryCode.PROPERTY_ADVICE,
    name: "Property Advice",
    slug: "property-advice",
  },
  {
    code: ArticleCategoryCode.PROPERTY_NEWS,
    name: "Property News",
    slug: "property-news",
  },
  {
    code: ArticleCategoryCode.RENTING_GUIDE,
    name: "Renting Guide",
    slug: "renting-guide",
  },
  {
    code: ArticleCategoryCode.SELLERS_GUIDE,
    name: "Sellers Guide",
    slug: "sellers-guide",
  },
  {
    code: ArticleCategoryCode.BUY_TO_LET,
    name: "Buy to Let",
    slug: "buy-to-let",
  },
  {
    code: ArticleCategoryCode.PROPERTY_DEVELOPER,
    name: "Property Developer",
    slug: "property-developer",
  },
  {
    code: ArticleCategoryCode.PROPERTY_FLIPPING,
    name: "Property Flipping",
    slug: "property-flipping",
  },
  {
    code: ArticleCategoryCode.LIFESTYLE_DECOR,
    name: "Lifestyle & Decor",
    slug: "lifestyle-decor",
  },
  {
    code: ArticleCategoryCode.NEIGHBOURHOOD,
    name: "Neighbourhood",
    slug: "neighbourhood",
  },
];

const staticPages = [
  {
    slug: "about-us",
    type: StaticPageType.ABOUT_US,
    title: "About Kasi Stay",
    summary: "How Kasi Stay helps people buy, rent, share, and move locally.",
    content:
      "Kasi Stay connects property seekers, roommates, service professionals, and local businesses through one trusted platform.",
  },
  {
    slug: "privacy-policy",
    type: StaticPageType.PRIVACY_POLICY,
    title: "Privacy Policy",
    summary: "How we collect, use, and protect personal information.",
    content:
      "This privacy policy explains what data Kasi Stay collects, why it is collected, and how users can request access, correction, or deletion.",
  },
  {
    slug: "terms-and-conditions",
    type: StaticPageType.TERMS_AND_CONDITIONS,
    title: "Terms and Conditions",
    summary: "Platform terms for buyers, renters, agents, and service providers.",
    content:
      "These terms govern use of Kasi Stay listings, messaging, marketplace postings, professional services, and editorial content.",
  },
  {
    slug: "cookie-policy",
    type: StaticPageType.COOKIE_POLICY,
    title: "Cookie Policy",
    summary: "How cookies and similar technologies are used on the platform.",
    content:
      "Kasi Stay uses cookies for authentication, security, analytics, and experience improvements. Users can manage browser cookie preferences at any time.",
  },
  {
    slug: "paia-manual",
    type: StaticPageType.PAIA_MANUAL,
    title: "PAIA Manual",
    summary: "Promotion of Access to Information Act manual.",
    content:
      "This PAIA manual sets out the information records held by Kasi Stay and the process for access requests under applicable South African law.",
  },
];

const seedArticleCategories = async () => {
  await Promise.all(
    articleCategories.map((category) =>
      prisma.articleCategory.upsert({
        where: { code: category.code },
        update: {
          name: category.name,
          slug: category.slug,
        },
        create: category,
      }),
    ),
  );
};

const seedStaticPages = async () => {
  await Promise.all(
    staticPages.map((page) =>
      prisma.staticPage.upsert({
        where: { slug: page.slug },
        update: {
          type: page.type,
          title: page.title,
          summary: page.summary,
          content: page.content,
          status: StaticPageStatus.PUBLISHED,
          publishedAt: new Date(),
          createdById: null,
        },
        create: {
          ...page,
          status: StaticPageStatus.PUBLISHED,
          publishedAt: new Date(),
          createdById: null,
        },
      }),
    ),
  );
};

const main = async () => {
  await seedArticleCategories();
  await seedStaticPages();
};

await main()
  .catch((error) => {
    console.error("[db seed] Failed to seed default content", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
