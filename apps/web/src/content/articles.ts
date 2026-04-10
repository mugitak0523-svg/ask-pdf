import "server-only";

import fs from "node:fs";
import path from "node:path";

import { routing, type Locale } from "@/i18n/routing";

export type ArticleSlug = string;

export type ArticleHeading = {
  depth: 2 | 3;
  id: string;
  title: string;
};

export type ArticleDocument = {
  slug: ArticleSlug;
  locale: Locale;
  meta: {
    title: string;
    description: string;
    emoji: string;
    publishedAt: string;
    topics: string[];
    tocTitle: string;
  };
  markdown: string;
  headings: ArticleHeading[];
};

const articlesRoot = path.join(process.cwd(), "content", "articles");

function isSupportedLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

function resolveLocale(locale: string): Locale {
  return isSupportedLocale(locale) ? locale : routing.defaultLocale;
}

function readDirectoryNames(dirPath: string) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function readMarkdownSource(filePath: string) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(source: string) {
  if (!source.startsWith("---\n")) {
    return { frontmatter: {}, markdown: source.trim() };
  }

  const endIndex = source.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return { frontmatter: {}, markdown: source.trim() };
  }

  const rawFrontmatter = source.slice(4, endIndex).trim();
  const markdown = source.slice(endIndex + 5).trim();
  const frontmatter: Record<string, string> = {};

  for (const line of rawFrontmatter.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = stripWrappingQuotes(line.slice(separatorIndex + 1).trim());
    frontmatter[key] = value;
  }

  return { frontmatter, markdown };
}

function buildHeadings(markdown: string): ArticleHeading[] {
  const matches = Array.from(markdown.matchAll(/^(##|###)\s+(.+)$/gm));
  return matches.map((match, index) => ({
    depth: match[1].length as 2 | 3,
    id: `heading-${index + 1}`,
    title: match[2].replace(/\s+#+\s*$/, "").trim(),
  }));
}

function parseArticleDocument(slug: string, locale: Locale, source: string): ArticleDocument {
  const { frontmatter, markdown } = parseFrontmatter(source);

  return {
    slug,
    locale,
    meta: {
      title: frontmatter.title ?? slug,
      description: frontmatter.description ?? "",
      emoji: frontmatter.emoji ?? "📝",
      publishedAt: frontmatter.publishedAt ?? "",
      topics: (frontmatter.topics ?? "")
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean),
      tocTitle: frontmatter.tocTitle ?? "Table of Contents",
    },
    markdown,
    headings: buildHeadings(markdown),
  };
}

function getArticleFilePath(slug: string, locale: Locale) {
  return path.join(articlesRoot, slug, `${locale}.md`);
}

function getExistingLocalesForSlug(slug: string) {
  return routing.locales.filter((locale) => fs.existsSync(getArticleFilePath(slug, locale)));
}

export function getArticleSlugs(): ArticleSlug[] {
  return readDirectoryNames(articlesRoot);
}

export function isArticleSlug(value: string): value is ArticleSlug {
  return getArticleSlugs().includes(value);
}

export function getArticleContent(slug: string, locale: string): ArticleDocument | null {
  if (!isArticleSlug(slug)) return null;

  const resolvedLocale = resolveLocale(locale);
  const sourceLocale = fs.existsSync(getArticleFilePath(slug, resolvedLocale))
    ? resolvedLocale
    : routing.defaultLocale;
  const source = readMarkdownSource(getArticleFilePath(slug, sourceLocale));

  if (!source) return null;
  return parseArticleDocument(slug, sourceLocale, source);
}

export function getArticleLocales(slug: string) {
  return isArticleSlug(slug) ? getExistingLocalesForSlug(slug) : [];
}

export function getAllArticleParams() {
  return getArticleSlugs().flatMap((slug) =>
    routing.locales.map((locale) => ({
      slug,
      locale,
    }))
  );
}

export function getArticleSummaries(locale: string) {
  return getArticleSlugs()
    .map((slug) => getArticleContent(slug, locale))
    .filter((article): article is ArticleDocument => Boolean(article));
}
