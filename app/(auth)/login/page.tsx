import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fieldClass =
  "h-12 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-foreground focus-visible:ring-0";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const error =
    typeof params.error === "string" ? params.error : undefined;
  const next = typeof params.next === "string" ? params.next : "/dashboard";

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div
        className="absolute inset-0 bg-cover bg-center lg:hidden"
        style={{ backgroundImage: "url('/dashboard/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/40 lg:hidden" />

      <div className="relative hidden flex-col justify-between overflow-hidden px-12 py-12 text-white lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/dashboard/login-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <p className="relative text-sm font-semibold tracking-[0.22em] uppercase">
          AmaSupplies
        </p>
        <div className="relative max-w-sm">
          <p className="text-4xl font-medium leading-tight tracking-tight">
            Quiet rooms.
            <br />
            Clear work.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-white/75">
            Sign in to edit the storefront.
          </p>
        </div>
        <p className="relative caption text-white/70">Staff only</p>
      </div>

      <div className="relative z-10 flex items-center justify-center px-6 py-16 lg:bg-background lg:px-16">
        <div className="w-full max-w-sm bg-background px-6 py-10 lg:bg-transparent lg:p-0">
          <p className="text-sm font-semibold tracking-[0.22em] uppercase lg:hidden">
            AmaSupplies
          </p>
          <h1 className="mt-10 text-[28px] font-medium tracking-tight lg:mt-0">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your staff email and password.
          </p>

          {error ? (
            <p className="mt-6 text-sm text-danger">
              {error === "forbidden"
                ? "This account does not have dashboard access."
                : error}
            </p>
          ) : null}

          <form action={login} className="mt-10 flex flex-col gap-8">
            <input type="hidden" name="next" value={next} />
            <label className="flex flex-col gap-3">
              <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
                Email
              </span>
              <Input
                type="email"
                name="email"
                required
                autoComplete="email"
                className={fieldClass}
              />
            </label>
            <label className="flex flex-col gap-3">
              <span className="caption tracking-[0.16em] text-muted-foreground uppercase">
                Password
              </span>
              <Input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                className={fieldClass}
              />
            </label>
            <Button
              type="submit"
              className="mt-2 h-12 rounded-none text-sm tracking-[0.16em] uppercase"
            >
              Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
