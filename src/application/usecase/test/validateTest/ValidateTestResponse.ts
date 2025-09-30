export interface ValidateTestResponse {
  testId: number;
  ticketId: number;
  ticketKey: string;
  isValidated: boolean;
  validatedBy: number;
  validatedByName: string;
  updatedAt: Date;
  message: string;
}