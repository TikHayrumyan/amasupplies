export type Crumb = {
  label: string;
  href?: string;
};

export const HOME_CRUMB: Crumb = { label: "Home", href: "/" };

export function crumbs(...items: Crumb[]): Crumb[] {
  return [HOME_CRUMB, ...items];
}
