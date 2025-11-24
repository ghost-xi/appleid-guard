export const VERSION = 'v3.0-20241124';

export const URLS = {
  IFORGOT: 'https://iforgot.apple.com/password/verify/appleid?language=en_US',
  APPLEID_SIGNIN: 'https://appleid.apple.com/sign-in',
  APPLEID_DEVICES: 'https://appleid.apple.com/account/manage/section/devices',
  IP_CHECK: 'https://api.ip.sb/ip',
  IP_CHECK_FALLBACK: 'https://myip.ipip.net/s',
};

export const SELECTORS = {
  APPLEID_INPUT: '.iforgot-apple-id',
  CAPTCHA_IMAGE: 'img',
  CAPTCHA_INPUT: '.captcha-input',
  DATE_INPUT: '.date-input',
  QUESTION: '.question',
  ANSWER_INPUT: '.generic-input-field',
  PASSWORD_INPUT: '.form-textbox-input',
  BUTTON_PRIMARY: '.button-primary',
  LOADING: '.loading',
  ERROR_MESSAGE: '.error-content',
};

export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
];

export const PASSWORD_LENGTH = 10;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
