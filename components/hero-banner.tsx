import Image from "next/image";
import { cn } from "@/lib/utils";

export type HeroBannerProps = {
  title: string;
  description: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  className?: string;
  preview?: boolean;
};

export function HeroBanner({
  title,
  description,
  imageUrl,
  videoUrl,
  className,
  preview = false,
}: HeroBannerProps) {
  const hasMedia = Boolean(videoUrl || imageUrl);
  const heading = title || (preview ? "Add a title" : "AmaSupplies");
  const copy = description || (preview ? "Add a short description." : "");

  return (
    <div
      className={cn(
        "relative isolate h-[70vh] overflow-hidden",
        hasMedia ? "bg-foreground" : "bg-surface",
        className,
      )}
    >
      {videoUrl ? (
        <video
          key={videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={videoUrl} />
        </video>
      ) : imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          priority={!preview}
          sizes="100vw"
          unoptimized={
            imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")
          }
          className="object-cover"
        />
      ) : null}

      {hasMedia ? (
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/15 to-transparent" />
      ) : null}

      <div
        className={cn(
          "relative z-10 flex h-full items-end",
          hasMedia ? "text-white" : "text-foreground",
        )}
      >
        <div className="container mx-auto px-4 py-16 md:py-24">
          <h1
            className={cn(
              "max-w-2xl text-4xl font-medium tracking-tight md:text-5xl",
              preview && !title && "opacity-40",
            )}
          >
            {heading}
          </h1>
          {copy ? (
            <p
              className={cn(
                "mt-5 max-w-lg text-base leading-relaxed md:text-lg",
                hasMedia ? "text-white/80" : "text-muted-foreground",
                preview && !description && "opacity-50",
              )}
            >
              {copy}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
