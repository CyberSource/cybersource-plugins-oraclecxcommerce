import cryptoService from '@server-extension/services/cryptoService';

describe('Services - CryptoService', () => {
  it('should encrypt and decrypt given text', () => {
    const cipher = cryptoService.encrypt('hello');

    expect('hello').toEqual(cryptoService.decrypt(cipher));
  });

  it('should fail decrypting given text', () => {
    const cipher = cryptoService.encrypt('hello');
    cipher.encrypted = 'B' + cipher.encrypted;

    expect(() => cryptoService.decrypt(cipher)).toThrow();
  });
});
