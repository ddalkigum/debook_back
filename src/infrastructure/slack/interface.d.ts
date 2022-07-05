export interface ISlackClient {
  sendAlaram: (error, request, response, next) => Promise<void>;
}
