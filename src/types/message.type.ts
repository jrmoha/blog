type Message = {
  message_id?: number;
  inbox_id: number;
  sender: string;
  receiver: string;
  message: string;
  sent_at: string;
  sender_image?: string;
};
export default Message;
