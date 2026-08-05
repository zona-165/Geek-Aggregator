import { integer, sqliteTable, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  feedUrl: text("feed_url").notNull(),
  category: text("category").notNull().default("AI 前沿"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({ feedUrlUnique: uniqueIndex("sources_feed_url_unique").on(table.feedUrl) }));

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceId: integer("source_id").references(() => sources.id),
  title: text("title").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  coverImage: text("cover_image"),
  category: text("category").notNull().default("AI 前沿"),
  originalContent: text("original_content").notNull().default(""),
  rewrittenTitle: text("rewritten_title"),
  rewrittenContent: text("rewritten_content"),
  status: text("status", { enum: ["待改写", "已改写", "待审核", "已发布"] }).notNull().default("待改写"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({ statusCreated: index("articles_status_created_idx").on(table.status, table.createdAt), categoryCreated: index("articles_category_created_idx").on(table.category, table.createdAt) }));

export const rewriteVersions = sqliteTable("rewrite_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleId: integer("article_id").notNull().references(() => articles.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  provider: text("provider").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({ articleCreated: index("rewrite_versions_article_created_idx").on(table.articleId, table.createdAt) }));
