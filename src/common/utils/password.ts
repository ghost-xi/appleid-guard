import { PASSWORD_LENGTH, PASSWORD_PATTERN } from '../constants';

export function generatePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const all = lowercase + uppercase + digits + digits;

  let password = '';
  do {
    password = '';
    for (let i = 0; i < PASSWORD_LENGTH; i++) {
      password += all.charAt(Math.floor(Math.random() * all.length));
    }
  } while (!PASSWORD_PATTERN.test(password));

  return password;
}
