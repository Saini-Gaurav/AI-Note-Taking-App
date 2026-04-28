export interface CurrentUser {
  id: string;
  email: string;
  name: string;
}

export interface ValidationStore {
  "validated:json"?: unknown;
  "validated:query"?: unknown;
  "validated:param"?: unknown;
}
