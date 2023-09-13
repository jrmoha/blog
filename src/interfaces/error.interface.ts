interface IError {
  name?: string;
  message: string;
  stack?: string;
  status: number;
}
export default IError;
