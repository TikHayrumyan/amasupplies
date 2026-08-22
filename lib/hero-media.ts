export const HERO_MEDIA_MAX_BYTES = 3 * 1024 * 1024;
export const HERO_TITLE_MAX = 60;
export const HERO_DESCRIPTION_MAX = 160;

export type HeroMediaKind = "image" | "video";

export function getHeroMediaKind(hero: {
  imageUrl: string | null;
  videoUrl: string | null;
} | null): HeroMediaKind {
  return hero?.videoUrl ? "video" : "image";
}

export function validateHeroCopy(title: string, description: string) {
  if (title.length > HERO_TITLE_MAX) {
    return `Title must be at most ${HERO_TITLE_MAX} characters.`;
  }
  if (description.length > HERO_DESCRIPTION_MAX) {
    return `Description must be at most ${HERO_DESCRIPTION_MAX} characters.`;
  }
  return null;
}
