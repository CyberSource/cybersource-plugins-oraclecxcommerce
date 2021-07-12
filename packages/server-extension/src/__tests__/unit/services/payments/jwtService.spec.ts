import jwtService from '@server-extension/services/jwtService';
import { JWK } from 'jwk-to-pem';

describe('Services - JwtService', () => {
  it('Should convert jwk to pem', () => {
    const res = jwtService.jwkToPem(jwk);

    expect(res).toMatch(pem);
  });

  it('Should decode jwt', () => {
    const res = jwtService.decode(jwt);

    expect(res).toMatchObject({
      header: {
        kid: '08UXqmf243kLAObINad0ZuIcgHxQ6aMy',
        alg: 'RS256'
      },
      payload: {
        data: {
          expirationYear: '2023',
          number: '411111XXXXXX1111',
          expirationMonth: '03',
          type: '001'
        },
        iss: 'Flex/08',
        exp: 1597044206,
        type: 'mf-0.11.0',
        iat: 1597043306,
        jti: '1E17MOFNBVFXFG3PRPTO51FG3JHOM1JPDYFSG48ACN8596DBBV8E5F30F5EE1A81'
      }
    });
  });

  it('Should fail verification for wrong key', async () => {
    const token = jwtService.sign({ test: 'test' }, '1234');

    expect(() => jwtService.verify(token, 'wrong')).toThrow(new Error('invalid signature'));
  });

  it('Should fail verification for expired jwt', async () => {
    const token = jwtService.sign(
      { test: 'test', exp: Math.floor(Date.now() / 1000) - 1000 },
      '1234'
    );

    expect(() => jwtService.verify(token, '1234')).toThrow(new Error('jwt expired'));
  });

  it('Should fail verification if jwt is tampered', async () => {
    let token = jwtService.sign({ test: 'test' }, '1234');
    token = token + 'wrong';

    expect(() => jwtService.verify(token, '1234')).toThrow(new Error('invalid signature'));
  });

  it('Verification should succeed for valid token', async () => {
    const token = jwtService.sign({ test: 'test' }, '1234');

    expect(jwtService.verify(token, '1234')).toMatchObject({
      test: 'test'
    });
  });

  it('Should get kid from the header', async () => {
    const res = jwtService.getKid(jwt);

    expect(res).toMatch('08UXqmf243kLAObINad0ZuIcgHxQ6aMy');
  });

  it('Should sign jwt', async () => {
    const res = jwtService.sign({ test: 'test' }, '1234', {
      keyid: '666'
    });
    const decodedRes = jwtService.decode(res);

    expect(decodedRes).toMatchObject({
      header: {
        kid: '666'
      },
      payload: {
        test: 'test'
      }
    });
  });
});

const jwt =
  'eyJraWQiOiIwOFVYcW1mMjQza0xBT2JJTmFkMFp1SWNnSHhRNmFNeSIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjp7ImV4cGlyYXRpb25ZZWFyIjoiMjAyMyIsIm51bWJlciI6IjQxMTExMVhYWFhYWDExMTEiLCJleHBpcmF0aW9uTW9udGgiOiIwMyIsInR5cGUiOiIwMDEifSwiaXNzIjoiRmxleC8wOCIsImV4cCI6MTU5NzA0NDIwNiwidHlwZSI6Im1mLTAuMTEuMCIsImlhdCI6MTU5NzA0MzMwNiwianRpIjoiMUUxN01PRk5CVkZYRkczUFJQVE81MUZHM0pIT00xSlBEWUZTRzQ4QUNOODU5NkRCQlY4RTVGMzBGNUVFMUE4MSJ9.hWPSC4cu0jCqLZauB-TWtv4bdx1bfX1ROMf3g4r4VVdWzhwCojnFoShVJuPSIKepY35ddV68vCA5dEz4pdTCYMnv4DumRqYhPRPxJFlJF-Yr7JiZTuOzgkJ1qMfWhC99AKWvYUQb86GaJGB7Y8XMn2qwTjprLIfJuw_n7EljYCromHTkABK5ik6bx7SFi_Jnup_b6zgxy6SkZBts0PkdXtf4EpEUqlZ-WMsJrsg_TSHRJaNd_YtbgenMxjhmHDUzHdD_HuK_wXOGsVX-Gm3KO18MATQd3ri324KSNOz-0NNUG2DOMLc-jr2-3FYVaV9YlR_UjFB5jfQGAi9VO3YXmw';

const jwk = {
  kty: 'RSA',
  e: 'AQAB',
  n:
    'yNwteA9owZDQjudJkqyv_TPtBWpYNt9TCvr-IaR5qVdhrGhlWeK3X1VcOGAWNc1G9jJCYsf76AkHrTt6iqUr2FFJUDS2UjYKOvLJLzIMFO7w--hU_nsmOuaNCiSph4SyH7fRuoemxfjedzHo1CSz4nRiGN-fIMNMpSYPzZ-Z0rAlfVYZc-uBvLAKrU9YQuWorxn2bjACXb6e701IZDd5Vwf6WnSrcfW-E57NaiHRqWws1bLnIzRJfwOYSD58T41dExmLW19woCeKLImv0JxBI7JmGZ6yK94UucPxXgGRSLKPp2AD_7sUi25O20YOw3O-mLnvrFGKee3IWNzLJeLOEw'
} as JWK;

const pem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyNwteA9owZDQjudJkqyv
/TPtBWpYNt9TCvr+IaR5qVdhrGhlWeK3X1VcOGAWNc1G9jJCYsf76AkHrTt6iqUr
2FFJUDS2UjYKOvLJLzIMFO7w++hU/nsmOuaNCiSph4SyH7fRuoemxfjedzHo1CSz
4nRiGN+fIMNMpSYPzZ+Z0rAlfVYZc+uBvLAKrU9YQuWorxn2bjACXb6e701IZDd5
Vwf6WnSrcfW+E57NaiHRqWws1bLnIzRJfwOYSD58T41dExmLW19woCeKLImv0JxB
I7JmGZ6yK94UucPxXgGRSLKPp2AD/7sUi25O20YOw3O+mLnvrFGKee3IWNzLJeLO
EwIDAQAB
-----END PUBLIC KEY-----`;
