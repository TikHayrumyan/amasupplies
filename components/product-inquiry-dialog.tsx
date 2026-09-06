"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendProductInquiry } from "@/lib/product-inquiry-actions";
import { INITIAL_PRODUCT_INQUIRY_STATE } from "@/lib/product-inquiry-fields";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-fit rounded-none px-8 text-sm tracking-[0.16em] uppercase"
    >
      {pending ? "Sending…" : "Send Message"}
    </Button>
  );
}

export function ProductInquiryDialog({
  productId,
  productTitle,
}: {
  productId: number;
  productTitle: string;
}) {
  const [state, formAction] = useActionState(
    sendProductInquiry,
    INITIAL_PRODUCT_INQUIRY_STATE,
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-8 h-11 rounded-none px-8 text-sm tracking-[0.16em] uppercase">
          Get product
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none border-border bg-background p-6 shadow-none sm:max-w-lg sm:p-8">
        {state.ok ? (
          <DialogHeader>
            <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
              Sent
            </p>
            <DialogTitle className="mt-3 text-2xl font-medium tracking-tight">
              Thank you. We will get back to you shortly.
            </DialogTitle>
          </DialogHeader>
        ) : (
          <>
            <DialogHeader>
              <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
                Inquiry
              </p>
              <DialogTitle className="mt-3 text-2xl font-medium tracking-tight">
                Get product
              </DialogTitle>
              <DialogDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Contact us for pricing and bulk purchasing information. Tell us
                what you need and we will follow up with details for this
                product.
              </DialogDescription>
            </DialogHeader>

            <form action={formAction} className="mt-6 flex flex-col gap-5" noValidate>
              <p className="hidden" aria-hidden>
                <label>
                  Leave this empty
                  <input
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </p>
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="productTitle" value={productTitle} />

              {state.error ? (
                <p className="text-sm text-danger" role="alert" aria-live="polite">
                  {state.error}
                </p>
              ) : null}

              <Field
                label="Name"
                htmlFor="product-inquiry-name"
                error={state.fieldErrors?.name}
                className="gap-2"
              >
                <Input
                  id="product-inquiry-name"
                  name="name"
                  maxLength={80}
                  autoComplete="name"
                  variant="box"
                  className="h-10"
                  defaultValue={state.values?.name}
                  aria-invalid={Boolean(state.fieldErrors?.name)}
                />
              </Field>
              <Field
                label="Email"
                htmlFor="product-inquiry-email"
                error={state.fieldErrors?.email}
                className="gap-2"
              >
                <Input
                  id="product-inquiry-email"
                  type="email"
                  name="email"
                  maxLength={120}
                  autoComplete="email"
                  variant="box"
                  className="h-10"
                  defaultValue={state.values?.email}
                  aria-invalid={Boolean(state.fieldErrors?.email)}
                />
              </Field>
              <Field
                label="Message"
                htmlFor="product-inquiry-message"
                error={state.fieldErrors?.message}
                className="gap-2"
              >
                <Textarea
                  id="product-inquiry-message"
                  name="message"
                  maxLength={2000}
                  className="min-h-24 py-2.5"
                  defaultValue={state.values?.message}
                  aria-invalid={Boolean(state.fieldErrors?.message)}
                />
              </Field>
              <SubmitButton />
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
