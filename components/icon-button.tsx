import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function IconButton({
  className,
  danger = false,
  ...props
}: React.ComponentProps<typeof Button> & { danger?: boolean }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "size-8 shrink-0 rounded-none text-muted-foreground hover:bg-transparent hover:text-foreground",
        danger && "hover:text-danger",
        className,
      )}
      {...props}
    />
  );
}
