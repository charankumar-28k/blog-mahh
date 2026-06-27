import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "./supabase";

export type Category =
  | "Holistic Health"
  | "Mental Health"
  | "Nutrition"
  | "Physical Health"
  | "Self-help"
  | "Wellness";

export interface Comment {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: Category;
  date: string;
  iso: string;
  image_url: string;
  user_id?: string;
  likes_count: number;
  liked_by: string[];
  comments: Comment[];
  is_free?: boolean;
  price?: number | null;
}

// ── Articles ──────────────────────────────────────────────

export const fetchArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("iso", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((a) => ({
    ...a,
    likes_count: a.likes_count ?? 0,
    liked_by: a.liked_by ?? [],
    comments: a.comments ?? [],
  })) as Article[];
});

export const fetchArticle = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { data: article, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return {
      ...article,
      likes_count: article.likes_count ?? 0,
      liked_by: article.liked_by ?? [],
      comments: article.comments ?? [],
    } as Article;
  });

export const fetchPaidArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("is_free", false)
    .order("iso", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((a) => ({
    ...a,
    likes_count: a.likes_count ?? 0,
    liked_by: a.liked_by ?? [],
    comments: a.comments ?? [],
  })) as Article[];
});

export const createArticle = createServerFn({ method: "POST" })
  .validator(z.object({
    title: z.string(),
    excerpt: z.string(),
    content: z.string().optional(),
    category: z.string(),
    date: z.string(),
    iso: z.string(),
    image_url: z.string(),
    user_id: z.string(),
    is_free: z.boolean().optional(),
    price: z.number().nullable().optional(),
  }))
  .handler(async ({ data }) => {
    const { error } = await supabase.from("articles").insert([{
      ...data,
      likes_count: 0,
      liked_by: [],
      comments: [],
    }]);
    if (error) throw new Error(error.message);
  });

export const updateArticle = createServerFn({ method: "POST" })
  .validator(z.object({
    id: z.string(),
    title: z.string(),
    excerpt: z.string(),
    content: z.string().optional(),
    category: z.string(),
    is_free: z.boolean().optional(),
    price: z.number().nullable().optional(),
  }))
  .handler(async ({ data }) => {
    const { id, ...rest } = data;
    const { error } = await supabase.from("articles").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { error } = await supabase.from("articles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
  });
