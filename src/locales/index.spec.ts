import { getLocale } from './index';
import { zh_cn } from './zh_cn';
import { en_us } from './en_us';

describe('Locales', () => {
  it('should return Chinese locale for zh_cn', () => {
    const locale = getLocale('zh_cn');
    expect(locale).toBe(zh_cn);
  });

  it('should return English locale for en_us', () => {
    const locale = getLocale('en_us');
    expect(locale).toBe(en_us);
  });

  it('should return English locale for vi_vn (fallback)', () => {
    const locale = getLocale('vi_vn');
    expect(locale).toBe(en_us);
  });

  it('should have all required properties in zh_cn', () => {
    expect(zh_cn.normal).toBeDefined();
    expect(zh_cn.login).toBeDefined();
    expect(zh_cn.updateSuccess).toBeDefined();
    expect(typeof zh_cn.nextRun).toBe('function');
    expect(typeof zh_cn.totalDevices).toBe('function');
  });

  it('should have all required properties in en_us', () => {
    expect(en_us.normal).toBeDefined();
    expect(en_us.login).toBeDefined();
    expect(en_us.updateSuccess).toBeDefined();
    expect(typeof en_us.nextRun).toBe('function');
    expect(typeof en_us.totalDevices).toBe('function');
  });
});
