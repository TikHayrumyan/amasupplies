import { db } from "@/prisma/db";
import { createAdminClient } from "@/lib/supabase/admin";

const HERO_FIELDS = [
  "id",
  "title",
  "description",
  "imageUrl",
  "videoUrl",
  "updatedAt",
] as const;

export type Hero = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  updatedAt: Date;
};

export async function getHero(): Promise<Hero | null> {
  return db.orm.public.Hero.select(...HERO_FIELDS).first();
}

export async function saveHero(input: {
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
}) {
  const existing = await db.orm.public.Hero.select("id").first();
  const values = {
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl,
    videoUrl: input.videoUrl,
    updatedAt: new Date(),
  };

  if (!existing) {
    await db.orm.public.Hero.create(values);
    return;
  }

  await db.orm.public.Hero.where({ id: existing.id }).update(values);
}

async function ensureHeroBucket() {
  const admin = createAdminClient();
  const { data } = await admin.storage.listBuckets();
  if (!data?.some((bucket) => bucket.name === "hero")) {
    const { error } = await admin.storage.createBucket("hero", {
      public: true,
      fileSizeLimit: "32MB",
    });
    if (error && !error.message.toLowerCase().includes("already exists")) {
      throw error;
    }
  }
  return admin;
}

export async function uploadHeroMedia(
  file: File | null,
  kind: "image" | "video",
) {
  if (!file || file.size === 0) {
    return null;
  }

  const admin = await ensureHeroBucket();
  const ext = file.name.split(".").pop()?.toLowerCase() || (kind === "video" ? "mp4" : "jpg");
  const path = `${kind}-${Date.now()}.${ext}`;
  const { error } = await admin.storage.from("hero").upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) {
    throw error;
  }
  return admin.storage.from("hero").getPublicUrl(path).data.publicUrl;
}
