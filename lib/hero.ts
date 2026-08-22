import "server-only";

import { db } from "@/prisma/db";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  HERO_MEDIA_MAX_BYTES,
  type HeroMediaKind,
} from "@/lib/hero-media";

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

const HERO_BUCKET = "hero";

async function ensureHeroBucket() {
  const admin = createAdminClient();
  const { data: existing, error: lookupError } =
    await admin.storage.getBucket(HERO_BUCKET);

  if (existing) {
    return admin;
  }

  if (lookupError && !lookupError.message.toLowerCase().includes("not found")) {
    throw new Error(
      `Could not reach Storage. Check SUPABASE_SECRET_KEY. ${lookupError.message}`,
    );
  }

  const { error } = await admin.storage.createBucket(HERO_BUCKET, {
    public: true,
    fileSizeLimit: "3MB",
    allowedMimeTypes: ["image/*", "video/*"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(
      `Could not create the hero Storage bucket. ${error.message}`,
    );
  }

  return admin;
}

export async function uploadHeroMedia(
  file: File | null,
  kind: HeroMediaKind,
) {
  if (!file || file.size === 0) {
    return null;
  }

  if (file.size > HERO_MEDIA_MAX_BYTES) {
    throw new Error("File is larger than 3 MB.");
  }

  const admin = await ensureHeroBucket();
  const ext = file.name.split(".").pop()?.toLowerCase() || (kind === "video" ? "mp4" : "jpg");
  const path = `${kind}-${Date.now()}.${ext}`;
  const { error } = await admin.storage.from(HERO_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) {
    throw new Error(`Could not upload the ${kind}. ${error.message}`);
  }
  return admin.storage.from(HERO_BUCKET).getPublicUrl(path).data.publicUrl;
}

function heroObjectPath(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  const marker = `/storage/v1/object/public/${HERO_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(index + marker.length));
}

export async function removeHeroMedia(
  urls: Array<string | null | undefined>,
) {
  const paths = [...new Set(urls.map(heroObjectPath).filter(Boolean))] as string[];
  if (paths.length === 0) {
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin.storage.from(HERO_BUCKET).remove(paths);
  if (error) {
    throw new Error(`Could not delete the file. ${error.message}`);
  }
}
