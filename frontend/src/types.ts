export type UserType = {
  id: number;
  name: string;
  role: "borrower" | "investor";
  email: string;
  blockchain_address: string;
  trust_score?: number;
};
