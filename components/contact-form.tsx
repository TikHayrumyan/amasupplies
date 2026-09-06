"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage } from "@/lib/contact-actions";
import { INITIAL_CONTACT_STATE } from "@/lib/contact-fields";

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

export function ContactForm() {
  const [state, formAction] = useActionState(
    sendContactMessage,
    INITIAL_CONTACT_STATE,
  );

  if (state.ok) {
    return (
      <div className="border border-border bg-surface px-6 py-10 md:px-8 md:py-12">
        <p className="caption tracking-[0.16em] text-muted-foreground uppercase">
          Sent
        </p>
        <p className="mt-5 text-2xl font-medium tracking-tight md:text-3xl">
          Thank you. We will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
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

      {state.error ? (
        <p className="text-sm text-danger" role="alert" aria-live="polite">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Name"
          htmlFor="contact-name"
          error={state.fieldErrors?.name}
          className="gap-2"
        >
          <Input
            id="contact-name"
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
          htmlFor="contact-email"
          error={state.fieldErrors?.email}
          className="gap-2"
        >
          <Input
            id="contact-email"
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
      </div>
      <Field
        label="Phone"
        htmlFor="contact-phone"
        error={state.fieldErrors?.phone}
        className="gap-2"
      >
        <Input
          id="contact-phone"
          type="tel"
          name="phone"
          maxLength={40}
          autoComplete="tel"
          variant="box"
          className="h-10"
          defaultValue={state.values?.phone}
          aria-invalid={Boolean(state.fieldErrors?.phone)}
        />
      </Field>
      <Field
        label="Message"
        htmlFor="contact-message"
        error={state.fieldErrors?.message}
        className="gap-2"
      >
        <Textarea
          id="contact-message"
          name="message"
          maxLength={2000}
          className="min-h-24 py-2.5"
          defaultValue={state.values?.message}
          aria-invalid={Boolean(state.fieldErrors?.message)}
        />
      </Field>
      <SubmitButton />
    </form>
  );
}
