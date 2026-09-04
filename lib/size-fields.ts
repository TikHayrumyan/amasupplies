export type SizeRecord = {
  id: number;
  title: string;
  sortOrder: number;
  updatedAt: Date | string;
};

export const SIZE_TITLE_MAX = 40;

export function validateSizeCopy(title: string) {
  if (!title) {
    return "Name is required.";
  }
  if (title.length > SIZE_TITLE_MAX) {
    return `Name must be at most ${SIZE_TITLE_MAX} characters.`;
  }
  return null;
}
