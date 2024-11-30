export type GenericSendResponse =
  | { status: "sent" | string }
  | { error: string };

export interface ISMSClient {
  sendSms: (phone: string, message: string) => Promise<GenericSendResponse>;
}

export interface IEmailClient {
  sendEmail: (email: string, message: string) => Promise<GenericSendResponse>;
}
