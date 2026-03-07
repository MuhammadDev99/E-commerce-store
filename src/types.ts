export type Product = {
  name: string;
  title: string;
  price: number;
  id: number;
  thumbnailUrl: string;
};

export type MessageUI = {
  title: string;
  content: string;
  durationMs: number;
  type: "error" | "warning" | "info" | "success";
  id: number;
};
