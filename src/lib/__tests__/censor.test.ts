import { describe, it, expect } from 'vitest';
import { censorText } from '../censor';

describe('censorText', () => {
  it('should censor default Bengali prohibited words', () => {
    const input = 'গাজা এবং ফিলিস্তিন সংবাদের হত্যা ও ধর্ষণ সংক্রান্ত তথ্য।';
    const output = censorText(input);
    expect(output).toContain('গা*জা');
    expect(output).toContain('ফিলি*স্তিন');
    expect(output).toContain('হ*ত্যা');
    expect(output).toContain('ধ*র্ষণ');
  });

  it('should not censor old English words by default', () => {
    const input = 'Killing is bad. Israel and Gaza.';
    const output = censorText(input);
    expect(output).toBe(input);
  });

  it('should use custom mappings when provided', () => {
    const customMappings = { 'Apple': 'A*pple' };
    const input = 'I like Apple.';
    const output = censorText(input, customMappings);
    expect(output).toBe('I like A*pple.');
  });

  it('should preserve case (All Caps) when using English custom mappings', () => {
    const customMappings = { 'Killing': 'ki*lling' };
    const input = 'KILLING IS BAD.';
    const output = censorText(input, customMappings);
    expect(output).toBe('KI*LLING IS BAD.');
  });

  it('should preserve case (Capitalized) when using English custom mappings', () => {
    const customMappings = { 'Rape': 'ra*pe' };
    const input = 'Rape is a crime.';
    const output = censorText(input, customMappings);
    expect(output).toBe('Ra*pe is a crime.');
  });

  it('should preserve case (Mixed Case)', () => {
    const customMappings = { 'Rape': 'ra*pe' };
    const input = 'rAPe';
    const output = censorText(input, customMappings);
    expect(output).toBe('rA*Pe');
  });

  it('should sort mappings by length descending', () => {
    const customMappings = {
      'Murder': 'M*rder',
      'Murdered': 'M*rdered'
    };
    const input = 'He was Murdered.';
    const output = censorText(input, customMappings);
    expect(output).toBe('He was M*rdered.');
  });
});
