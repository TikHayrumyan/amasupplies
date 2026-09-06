export type ContactFields = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactState = {
  ok: boolean;
  error: string | null;
  fieldErrors: Partial<Record<keyof ContactFields, string>>;
  values: ContactFields;
};

export const INITIAL_CONTACT_STATE: ContactState = {
  ok: false,
  error: null,
  fieldErrors: {},
  values: {
    name: "",
    email: "",
    phone: "",
    message: "",
  },
};
