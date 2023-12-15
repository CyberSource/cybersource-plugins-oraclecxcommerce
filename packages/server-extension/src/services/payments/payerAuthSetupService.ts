import { maskRequestData, RequestContext } from "@server-extension/common";
import { MerchantConfig, PayerAuthenticationApi, RiskV1AuthenticationSetupsPost201Response } from "cybersource-rest-client";
import nconf from 'nconf';
import makeRequest from "./api/paymentCommand";
import occClientStorefront from "../occ/occClientStorefront";

const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

const DEVELOPER_ID_KEY = 'partner.developerId';
const SOLUTION_ID_KEY = 'partner.solutionId';

async function buildSetupPayload(setupRequestPayload: OCC.PayerAuthSetupRequest) {
    const { orderId, savedCardId, profileId, transientToken } = setupRequestPayload || {};
    let customerId = null;
    if (savedCardId && profileId) {

        const response = await occClientStorefront.getUserProfile(profileId);

        const { creditCards = [] } = response || {};
        const cardDetails = creditCards.find((cardDetails: Record<string, string>) => cardDetails.id === savedCardId) || {};
        logger.debug("Card details" + JSON.stringify(maskRequestData(cardDetails)));

        customerId = cardDetails.cardProps?.customerId;
        if (!customerId) {
            logger.debug("Payer Auth Setup Missing customerId for cardId: " + savedCardId + " profileId: " + profileId);
            logger.debug("get profile response: " + JSON.stringify(response));
        }

    }

    return {
        clientReferenceInformation: {
            partner: {
                developerId: nconf.get(DEVELOPER_ID_KEY),
                solutionId: nconf.get(SOLUTION_ID_KEY)
            },
            code: orderId
        },
        ...transientToken && { tokenInformation: { transientToken: transientToken } },
        //For saved card
        ...customerId && { paymentInformation: { customer: { customerId } } },
    }
}


export default async function getPayerAuthSetup(
    setupRequestPayload: OCC.PayerAuthSetupRequest,
    requestContext: RequestContext
): Promise<OCC.PayerAuthSetupResponse> {

    const setupRequestAPIPayload = await buildSetupPayload(setupRequestPayload);
    const merchantConfig: MerchantConfig = requestContext.merchantConfig;

    logger.debug('Payer Auth Setup API Request Payload: ' + JSON.stringify(maskRequestData(setupRequestAPIPayload)));

    const setupResponse: DeepRequired<RiskV1AuthenticationSetupsPost201Response> = await makeRequest(
        merchantConfig,
        PayerAuthenticationApi,
        'payerAuthSetup',
        setupRequestAPIPayload
    )

    return {
        status: setupResponse.status,
        accessToken: setupResponse.consumerAuthenticationInformation.accessToken,
        referenceId: setupResponse.consumerAuthenticationInformation.referenceId,
        deviceDataCollectionUrl: setupResponse.consumerAuthenticationInformation.deviceDataCollectionUrl
    };
}
