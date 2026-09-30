import * as fs from 'fs';
import * as path from 'path';
const forge = require('node-forge');
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

const logger = LogFactory.logger();

export function withP12Extension(fileName: string): string {
  return fileName.toLowerCase().endsWith('.p12') ? fileName : `${fileName}.p12`;
}

/**
 * Decrypts a CyberSource MLE encrypted response JWE token using a P12 private key.
 * Handles both raw JWE tokens and {"encryptedResponse":"<JWE>"} wrapped format.
 * Uses the CyberSource SDK's JWEUtility for the actual decryption.
 *
 * @param encryptedResponseBody - Raw JWE token or JSON string with encryptedResponse field
 * @param p12FilePath - Absolute path to the P12 private key file
 * @param p12Passphrase - Passphrase for the P12 file
 * @returns Decrypted plaintext string or undefined if decryption fails
 */
export async function decryptMleResponse(
  encryptedResponseBody: string,
  p12FilePath: string,
  p12Passphrase: string
): Promise<string | undefined> {
  let decryptedString: string | undefined;

  try {
    if (!encryptedResponseBody) {
      logger.error('[MLE] Empty encrypted response body provided for decryption');
    } else if (!fs.existsSync(p12FilePath)) {
      logger.error(`[MLE] P12 file not found at: ${p12FilePath}`);
    } else {
      // Extract JWE from {"encryptedResponse":"..."} wrapper if present
      let jweToken = encryptedResponseBody;
      try {
        const parsed = JSON.parse(encryptedResponseBody);
        if (parsed.encryptedResponse && typeof parsed.encryptedResponse === 'string') {
          jweToken = parsed.encryptedResponse;
          logger.debug('[MLE] Extracted JWE token from encryptedResponse field');
        }
      } catch {
        logger.debug('[MLE] Response body is not JSON, treating as raw JWE token');
      }

      logger.debug(`[MLE] Loading P12 for decryption: ${path.basename(p12FilePath)}`);

      // Read and parse P12 file using node-forge
      const p12Buffer = fs.readFileSync(p12FilePath);
      const p12Der = forge.util.binary.raw.encode(new Uint8Array(p12Buffer));
      const p12Asn1 = forge.asn1.fromDer(p12Der);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, p12Passphrase);

      // Extract private key — try shrouded key bag first
      let privateKeyBag: any = null;
      const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

      if (keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.length > 0) {
        privateKeyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0];
      }

      // Fall back to any bag that contains a key
      if (!privateKeyBag) {
        const allBags = p12.getBags({});
        for (const bagType in allBags) {
          const bags = allBags[bagType] as any[];
          if (Array.isArray(bags)) {
            for (const bag of bags) {
              if (bag.key) {
                privateKeyBag = bag;
                break;
              }
            }
          }
          if (privateKeyBag) break;
        }
      }

      if (!privateKeyBag?.key) {
        logger.error('[MLE] No private key found in P12 file');
      } else {
        // Convert to PEM for SDK JWEUtility
        const privatePem = forge.pki.privateKeyToPem(privateKeyBag.key);
        logger.debug(`[MLE] Decrypting JWE token (first 50 chars): ${jweToken.substring(0, 50)}...`);

        // Use CyberSource SDK JWEUtility for decryption
        const JWEUtility = require('cybersource-rest-client/src/authentication/util/JWEUtility');
        decryptedString = await JWEUtility.decryptJWEUsingPrivateKey(privatePem, jweToken);

        logger.debug(`[MLE] Successfully decrypted response. Length: ${decryptedString?.length}`);
      }
    }
  } catch (error: any) {
    logger.error(`[MLE] Failed to decrypt MLE response: ${error.message}`);
    decryptedString = undefined;
  }

  return decryptedString;
}

/**
 * Checks if a response body is an MLE encrypted response.
 */
export function isMleEncryptedResponse(responseBody: any): boolean {
  let isEncrypted = false;

  if (responseBody) {
    if (typeof responseBody === 'string') {
      try {
        const parsed = JSON.parse(responseBody);
        isEncrypted = typeof parsed.encryptedResponse === 'string';
      } catch (error: any) {
        logger.debug(`[MLE] Response body is not JSON, not an encrypted response: ${error.message}`);
        isEncrypted = false;
      }
    } else {
      isEncrypted = typeof responseBody.encryptedResponse === 'string';
    }
  }

  return isEncrypted;
}
