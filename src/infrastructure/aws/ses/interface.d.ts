export interface ISES {
  sendAuthEmail: (userEmail: string, code: string, isSignup: boolean, baseURL: string) => Promise<void>;
}
