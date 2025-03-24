export interface WebhookMessageData {
  sender: {
    id: string;
  };
  recipient: {
    id: string;
  };
  timestamp: number;
  message: {
    mid: string;
    text: string;
  };
}
