import { generatePassword } from './password';
import { PASSWORD_LENGTH, PASSWORD_PATTERN } from '../constants';

describe('Password Utils', () => {
  describe('generatePassword', () => {
    it('should generate a password with correct length', () => {
      const password = generatePassword();
      expect(password).toHaveLength(PASSWORD_LENGTH);
    });

    it('should generate a password matching the required pattern', () => {
      const password = generatePassword();
      expect(password).toMatch(PASSWORD_PATTERN);
    });

    it('should generate different passwords on multiple calls', () => {
      const password1 = generatePassword();
      const password2 = generatePassword();
      expect(password1).not.toBe(password2);
    });

    it('should contain at least one lowercase letter', () => {
      const password = generatePassword();
      expect(password).toMatch(/[a-z]/);
    });

    it('should contain at least one uppercase letter', () => {
      const password = generatePassword();
      expect(password).toMatch(/[A-Z]/);
    });

    it('should contain at least one digit', () => {
      const password = generatePassword();
      expect(password).toMatch(/\d/);
    });
  });
});
