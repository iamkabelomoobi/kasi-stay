import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ArticleStatus,
  CareerPostStatus,
  StaticPageStatus,
} from "@kasistay/db";
import { getArticle } from "../src/modules/advice/queries/index.ts";
import { getCareerPost } from "../src/modules/careers/queries/index.ts";
import { getStaticPageBySlug } from "../src/modules/pages/queries/index.ts";

const createContext = (options: {
  isAdmin?: boolean;
  prisma: Record<string, unknown>;
}) =>
  ({
    isAdmin: options.isAdmin ?? false,
    prisma: options.prisma,
  }) as never;

test("public article access is limited to published records", async () => {
  const publicCtx = createContext({
    prisma: {
      article: {
        findUnique: async () => ({
          id: "article-1",
          status: ArticleStatus.PUBLISHED,
        }),
      },
    },
  });

  const article = await getArticle("article-1", publicCtx);
  assert.equal(article.id, "article-1");

  const draftCtx = createContext({
    prisma: {
      article: {
        findUnique: async () => ({
          id: "article-2",
          status: ArticleStatus.DRAFT,
        }),
      },
    },
  });

  await assert.rejects(() => getArticle("article-2", draftCtx), /Article not found/);

  const adminCtx = createContext({
    isAdmin: true,
    prisma: {
      article: {
        findUnique: async () => ({
          id: "article-2",
          status: ArticleStatus.DRAFT,
        }),
      },
    },
  });

  const adminArticle = await getArticle("article-2", adminCtx);
  assert.equal(adminArticle.id, "article-2");
});

test("public static page access is limited to published records", async () => {
  const publicCtx = createContext({
    prisma: {
      staticPage: {
        findUnique: async () => ({
          id: "page-1",
          slug: "privacy-policy",
          status: StaticPageStatus.PUBLISHED,
        }),
      },
    },
  });

  const page = await getStaticPageBySlug("privacy-policy", publicCtx);
  assert.equal(page.slug, "privacy-policy");

  const draftCtx = createContext({
    prisma: {
      staticPage: {
        findUnique: async () => ({
          id: "page-2",
          slug: "about-us",
          status: StaticPageStatus.DRAFT,
        }),
      },
    },
  });

  await assert.rejects(
    () => getStaticPageBySlug("about-us", draftCtx),
    /Static page not found/,
  );
});

test("public career access is limited to published records", async () => {
  const publicCtx = createContext({
    prisma: {
      careerPost: {
        findUnique: async () => ({
          id: "career-1",
          status: CareerPostStatus.PUBLISHED,
        }),
      },
    },
  });

  const post = await getCareerPost("career-1", publicCtx);
  assert.equal(post.id, "career-1");

  const draftCtx = createContext({
    prisma: {
      careerPost: {
        findUnique: async () => ({
          id: "career-2",
          status: CareerPostStatus.DRAFT,
        }),
      },
    },
  });

  await assert.rejects(() => getCareerPost("career-2", draftCtx), /Career post not found/);
});
