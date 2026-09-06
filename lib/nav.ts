export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/blog", label: "Blog" },
] as const;

export const FOOTER_COMPANY = [
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_RESOURCES = [
  { href: "/faq", label: "FAQ" },
  { href: "#", label: "Reviews" },
  { href: "/blog", label: "Blog" },
] as const;

export type NavCategory = {
  title: string;
  slug: string;
};
