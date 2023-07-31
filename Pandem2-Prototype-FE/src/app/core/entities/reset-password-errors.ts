export interface ResetPasswordErrors {
  new_password: string;
  confirm_new_password: string;
}

export interface EmailErrors {
  email: string;
  recaptcha: string;
}