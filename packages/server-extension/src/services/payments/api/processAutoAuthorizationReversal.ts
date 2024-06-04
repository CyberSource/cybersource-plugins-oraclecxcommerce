import { PaymentContext, maskRequestData } from "@server-extension/common";
import { MerchantConfig, AuthReversalRequest, PtsV2PaymentsReversalsPost201Response, ReversalApi, TransactionDetailsApi } from "cybersource-rest-client";
import { convertRequest, twoDecimal } from "../converters/request/common";
import { delay } from "../converters/response/common";
import makeRequest from "./paymentCommand";
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

export async function doAuthReversal(context: PaymentContext, merchantConfig: MerchantConfig, transactionId: string) {
    try {
        const { webhookRequest } = context;
        const request = convertRequest<AuthReversalRequest>(context, {
            clientReferenceInformation: {
                code: webhookRequest.orderId
            },
            reversalInformation: {          
                amountDetails: {
                    totalAmount: twoDecimal(webhookRequest.amount),
                    currency: webhookRequest.currencyCode
                }
            }
        });
        logger.debug(`Auto AuthReversal API Request: ${JSON.stringify(maskRequestData(request))}`);
        await makeRequest<PtsV2PaymentsReversalsPost201Response>(
            merchantConfig,
            ReversalApi,
            'authReversal',
            transactionId,
            request
        );
        logger.debug("Auto AuthReversal : Successfully Processed");
    }
    catch (error) {
        logger.debug("Auto AuthReversal : " + error.message);
    }
}
export async function getTransactionWithRetry(merchantConfig: MerchantConfig, transactionId: string): Promise<OCC.GetTransactionResponse | null> {
    return new Promise(async (resolve) => {
    let attempt = 0; 
    let getTransactionDetails:OCC.GetTransactionResponse|null = null;
    while (attempt < 3) {
        await delay(5000);
        try {
            getTransactionDetails = await makeRequest(
                merchantConfig,
                TransactionDetailsApi,
                "getTransaction",
                transactionId);
            logger.debug(`Get Transaction Details Response : ${JSON.stringify(getTransactionDetails)}`);
            resolve(getTransactionDetails);
            break;
        } catch (error) {
            attempt++;
            logger.debug(`Get Transaction Details : Attempt ${attempt}: Error occurred while getting transaction details: ${error}`);
            (attempt > 2) && logger.debug('Get Transaction Details : Failed to get transaction details after three attempts.');
        }
    }
})
}