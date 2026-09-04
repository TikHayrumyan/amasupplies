"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { HeroBanner } from "@/components/hero-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  HERO_DESCRIPTION_MAX,
  HERO_MEDIA_MAX_BYTES,
  HERO_TITLE_MAX,
  getHeroMediaKind,
  validateHeroCopy,
  type HeroMediaKind,
} from "@/lib/hero-media";
import { cn } from "@/lib/utils";

const ACCEPT: Record<HeroMediaKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif",
  video: "video/mp4,video/webm,video/quicktime",
};

type Result = {
  error: string | null;
  saved?: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
};

type HeroValues = {
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  updatedAt: Date | string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function CharCount({ value, max }: { value: number; max: number }) {
  return (
    <span className="text-xs text-muted-foreground">
      {value}/{max}
    </span>
  );
}

function formatSavedAt(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function HeroEditor({
  hero,
  action,
}: {
  hero: HeroValues | null;
  action: (formData: FormData) => Promise<Result>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const [kind, setKind] = useState<HeroMediaKind>(getHeroMediaKind(hero));
  const [title, setTitle] = useState(hero?.title ?? "");
  const [description, setDescription] = useState(hero?.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [published, setPublished] = useState(hero);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  fileRef.current = file;

  const [state, formAction, pending] = useActionState(
    async (_prev: Result, formData: FormData) => {
      if (fileRef.current) {
        formData.set("media", fileRef.current);
      }
      const result = await action(formData);
      if (result.saved) {
        setPublished({
          title: title.trim(),
          description: description.trim(),
          imageUrl: result.imageUrl ?? null,
          videoUrl: result.videoUrl ?? null,
          updatedAt: new Date(),
        });
        setFile(null);
        fileRef.current = null;
        setLocalUrl(null);
        setRemoveMedia(false);
        setLocalError(null);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
      return result;
    },
    { error: null },
  );

  useEffect(() => {
    return () => {
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [localUrl]);

  const savedUrl =
    kind === "video"
      ? (published?.videoUrl ?? null)
      : (published?.imageUrl ?? null);
  const previewUrl = removeMedia ? null : (localUrl ?? savedUrl);
  const mediaLabel = file?.name ?? (savedUrl && !removeMedia ? "Current file" : null);
  const titleCount = title.trim().length;
  const descriptionCount = description.trim().length;
  const copyError = validateHeroCopy(title.trim(), description.trim());

  function chooseKind(next: HeroMediaKind) {
    if (next === kind) {
      return;
    }
    setKind(next);
    setFile(null);
    setLocalUrl(null);
    setRemoveMedia(false);
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function assignFile(next: File | null) {
    if (!next) {
      return;
    }
    if (next.size > HERO_MEDIA_MAX_BYTES) {
      setLocalError("File is larger than 3 MB.");
      return;
    }
    const isImage = next.type.startsWith("image/");
    const isVideo = next.type.startsWith("video/");
    if (kind === "image" && !isImage) {
      setLocalError("Choose an image file.");
      return;
    }
    if (kind === "video" && !isVideo) {
      setLocalError("Choose a video file.");
      return;
    }

    const objectUrl = URL.createObjectURL(next);
    setFile(next);
    setLocalUrl(objectUrl);
    setRemoveMedia(false);
    setLocalError(null);

    const transfer = new DataTransfer();
    transfer.items.add(next);
    if (inputRef.current) {
      inputRef.current.files = transfer.files;
    }
  }

  function clearBackground() {
    setFile(null);
    setLocalUrl(null);
    setRemoveMedia(true);
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)] xl:items-start">
      <div className="xl:sticky xl:top-20">
        <p className="caption mb-3 tracking-[0.16em] text-muted-foreground uppercase">
          Live preview
        </p>
        <div className="overflow-hidden border border-border/80">
          <HeroBanner
            preview
            title={title}
            description={description}
            imageUrl={kind === "image" ? previewUrl : null}
            videoUrl={kind === "video" ? previewUrl : null}
            className="h-[52vh] xl:h-144"
          />
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-8">
        <input type="hidden" name="mediaKind" value={kind} />
        <input type="hidden" name="clearMedia" value={removeMedia ? "on" : ""} />
        <input
          ref={inputRef}
          type="file"
          name="media"
          accept={ACCEPT[kind]}
          className="sr-only"
          onChange={(event) => assignFile(event.target.files?.[0] ?? null)}
        />

        {state.error || localError ? (
          <p className="text-sm text-danger">{localError ?? state.error}</p>
        ) : state.saved ? (
          <p className="text-sm text-success">Saved. The homepage is updated.</p>
        ) : null}

        <div>
          <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Background
          </p>
          <ToggleGroup
            type="single"
            value={kind}
            onValueChange={(value) => {
              if (value === "image" || value === "video") {
                chooseKind(value);
              }
            }}
            aria-label="Background type"
            className="mt-4 flex gap-6 rounded-none bg-transparent"
          >
            {(["image", "video"] as const).map((option) => (
              <ToggleGroupItem
                key={option}
                value={option}
                className="caption h-auto min-w-0 rounded-none border-0 border-b bg-transparent px-0 pb-1 tracking-[0.16em] uppercase shadow-none hover:bg-transparent hover:text-foreground focus-visible:ring-0 data-[state=off]:border-transparent data-[state=off]:text-muted-foreground data-[state=on]:border-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground first:rounded-none last:rounded-none"
              >
                {option}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            assignFile(event.dataTransfer.files[0] ?? null);
          }}
          className={cn(
            "border border-dashed px-5 py-6 transition-colors",
            dragOver ? "border-foreground" : "border-border",
          )}
        >
          {mediaLabel ? (
            <div className="flex flex-col gap-4">
              <div>
                <p className="truncate text-sm">{mediaLabel}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {file
                    ? formatBytes(file.size)
                    : kind === "video"
                      ? "Video background"
                      : "Image background"}
                </p>
              </div>
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  className="caption tracking-[0.14em] text-muted-foreground uppercase hover:text-foreground"
                  onClick={() => inputRef.current?.click()}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className="caption tracking-[0.14em] text-muted-foreground uppercase hover:text-foreground"
                  onClick={clearBackground}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="block w-full text-left"
            >
              <p className="text-sm">
                Drop a {kind} here, or browse
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {kind === "video"
                  ? "MP4 or WebM, up to 3 MB"
                  : "JPG, PNG, or WebP, up to 3 MB"}
              </p>
            </button>
          )}
        </div>

        <label className="flex flex-col gap-3">
          <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Title
          </span>
          <Input
            name="title"
            value={title}
            maxLength={HERO_TITLE_MAX}
            onChange={(event) => setTitle(event.target.value)}
            variant="line"
          />
          <CharCount value={titleCount} max={HERO_TITLE_MAX} />
        </label>

        <label className="flex flex-col gap-3">
          <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
            Description
          </span>
          <textarea
            name="description"
            rows={4}
            maxLength={HERO_DESCRIPTION_MAX}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="resize-none border-0 border-b border-border bg-transparent px-0 py-2 text-sm outline-none focus-visible:border-foreground"
          />
          <CharCount value={descriptionCount} max={HERO_DESCRIPTION_MAX} />
        </label>

        <div className="flex items-center justify-between gap-4">
          <Button
            type="submit"
            disabled={pending || Boolean(copyError)}
            className="h-11 rounded-none px-8 text-sm tracking-[0.16em] uppercase"
          >
            {pending ? "Saving…" : "Save"}
          </Button>
          {published ? (
            <p className="caption text-muted-foreground">
              Saved {formatSavedAt(published.updatedAt)}
            </p>
          ) : (
            <p className="caption text-muted-foreground">Not on the site yet</p>
          )}
        </div>
      </form>
    </div>
  );
}
