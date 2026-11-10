import { z } from "zod";

export const categories = ["카페", "빵집", "식당", "커피", "전망대"] as const;
export const categorySchema = z.enum(categories);
export type Category = z.infer<typeof categorySchema>;
export const destinationSchema = z.enum(["네이버 지도", "Google 지도"]);
export const placeSchema = z.object({
  id: z.number().int(), postId: z.number().int(), name: z.string(), area: z.string(),
  category: categorySchema, destination: destinationSchema, lat: z.number(), lng: z.number(),
  saved: z.boolean(), tags: z.array(z.string()),
});
export type Place = z.infer<typeof placeSchema>;
export const postSchema = z.object({
  id: z.number().int(), kind: z.enum(["릴스", "게시물"]), handle: z.string(), title: z.string(),
  status: z.enum(["저장 전", "확인 필요", "분석 중", "저장됨 (예시)"]),
  evidence: z.array(z.object({ source: z.string(), text: z.string() })),
  candidates: z.array(z.string()), reason: z.string(),
});
export type Post = z.infer<typeof postSchema>;
export const listSchema = z.object({ id: z.enum(["naver", "google"]), provider: z.string(), name: z.string(), sync: z.boolean(), login: z.boolean() });
export const changeSchema = z.object({ id: z.string(), kind: z.enum(["addition", "deletion"]), name: z.string(), deferred: z.boolean() });
export const settingsSchema = z.object({ domestic: destinationSchema, overseas: destinationSchema, notifications: z.boolean(), dmLinked: z.boolean(), signedIn: z.boolean() });
export type Settings = z.infer<typeof settingsSchema>;
export const stateSchema = z.object({ posts: z.array(postSchema), places: z.array(placeSchema), lists: z.array(listSchema), changes: z.array(changeSchema), settings: settingsSchema });
export type AppState = z.infer<typeof stateSchema>;
export const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), places: z.array(z.object({ id: z.number().int(), category: categorySchema, destination: destinationSchema })).min(1) }),
  z.object({ action: z.literal("candidate"), postId: z.literal(4), choice: z.enum(["A", "B"]) }),
  z.object({ action: z.literal("deletion"), id: z.string(), decision: z.enum(["delete", "keep", "later"]) }),
  z.object({ action: z.literal("sync"), id: z.enum(["naver", "google"]), enabled: z.boolean() }),
  z.object({ action: z.literal("login"), id: z.enum(["naver", "google"]) }),
  z.object({ action: z.literal("tag"), id: z.number().int(), tag: z.string().trim().min(1).max(30) }),
  z.object({ action: z.literal("settings"), settings: settingsSchema }),
  z.object({ action: z.literal("account"), operation: z.enum(["sign-in", "sign-out", "unlink", "delete"]) }),
]);
export type Command = z.infer<typeof commandSchema>;
