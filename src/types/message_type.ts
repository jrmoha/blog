type Message = {
  message_id?: number;
  inbox_id: number;
  sender: string;
  receiver: string;
  message: string;
  created_at: string;
};
export default Message;
