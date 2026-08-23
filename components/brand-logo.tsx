import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo/ama-logo.png"
      alt="AmaSupplies"
      width={130}
      height={80}
      priority={priority}
      className={cn("h-8 w-auto md:h-9", className)}
    />
  );
}
