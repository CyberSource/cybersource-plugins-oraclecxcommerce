import { PtsV2PaymentsPost201Response, MerchantConfig } from "cybersource-rest-client";
import { getTransactionWithRetry, doAuthReversal } from "./api/processAutoAuthorizationReversal";
import { Request, Response } from 'express';
import buildPaymentContext from "./paymentContextBuilder";
import { AUTH_REVERSAL } from "./converters/response/common";

const { LogFactory } = require("@isv-occ-payment/occ-payment-factory");
const logger = LogFactory.logger();

export default function autoAuthReversal(req: Request, res: Response) {
    (async function (req, res) {
        const context = buildPaymentContext(req);
        try {
            let isAuthReversalExists = false;
            const response = <DeepRequired<PtsV2PaymentsPost201Response>>context.data.response;
            const merchantConfig = <MerchantConfig>context.requestContext.merchantConfig;
            if ("AUTHORIZED_RISK_DECLINED" === response?.status) {
                const authTransactionId = response.id;
                logger.debug(`Auto AuthReversal : Transaction Id for AuthReversal : ${authTransactionId}`);
                const relatedTransactionsResponse = await getTransactionWithRetry(merchantConfig, authTransactionId);
                const relatedTransactions = relatedTransactionsResponse?._links?.relatedTransactions || [];
                for (const transaction of relatedTransactions) {
                    const transactionUrl = transaction.href;
                    const transactionId = transactionUrl.split("/").pop();
                    const applications = transactionId && (await getTransactionWithRetry(merchantConfig, transactionId))?.applicationInformation?.applications || [];
                    for (const application of applications) {
                        if (AUTH_REVERSAL.NAME === application.name && AUTH_REVERSAL.RCODE === application.rCode && AUTH_REVERSAL.RFLAG === application.rFlag) {
                            isAuthReversalExists = true;
                            logger.debug("Auto AuthReversal : Auth Reversal Already Executed");
                            break;
                        }
                    }
                    if (isAuthReversalExists) {
                        break;
                    }
                }
                if (!isAuthReversalExists) {
                    doAuthReversal(context, merchantConfig, authTransactionId);
                }
            }
        }
        catch (error) {
            logger.debug("Auto AuthReversal : " + error.message);
        }
    })(req, res);
}
