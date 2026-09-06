export type ProductInquiryFields = {
  name: string;
  email: string;
  message: string;
};

export type ProductInquiryState = {
  ok: boolean;
  error: string | null;
  fieldErrors: Partial<Record<keyof ProductInquiryFields, string>>;
  values: ProductInquiryFields;
};

export const INITIAL_PRODUCT_INQUIRY_STATE: ProductInquiryState = {
  ok: false,
  error: null,
  fieldErrors: {},
  values: {
    name: "",
    email: "",
    message: "",
  },
};
