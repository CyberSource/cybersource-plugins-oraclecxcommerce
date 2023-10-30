import { RequestContext, asyncMiddleware, maskRequestData } from '@server-extension/common';
import occClientStorefront from '@server-extension/services/occ/occClientStorefront';
import makeRequest from '@server-extension/services/payments/api/paymentCommand';
import { InstrumentIdentifierApi, PostInstrumentIdentifierRequest } from 'cybersource-rest-client';
import { NextFunction, Request, Response, Router } from 'express';
import nconf from 'nconf';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();
const router = Router();

router.post('/tokenUpdate', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const webhookRequestData: OCC.Notification = req.body;
        let savedWebhookConfiguration = nconf.get("networkSubcriptionConfigurations") || [];
        logger.debug("WebhookRouter tokenUpdate: Saved Webhook Configuration details " + JSON.stringify(savedWebhookConfiguration));
        const requestContext: RequestContext = req.app.locals;
        if (!requestContext.gatewaySettings?.networkTokenUpdates) {
            logger.debug("WebhookRouter tokenUpdate: Network token option not enabled");
            return;
        }
        if ("tms.networktoken.updated" === webhookRequestData?.eventType && webhookRequestData?.payloads[0]?.data) {
            for (const payload of webhookRequestData.payloads) {
                try {
                    const isConfigurationMatch = savedWebhookConfiguration.find((configuration: any) => configuration.MerchantID === payload.organizationId) || false;
                    if (isConfigurationMatch) {
                        let paymentInstrumentUrl = payload.data._links.paymentInstruments?.[0].href;
                        let paymentInstrument = paymentInstrumentUrl && paymentInstrumentUrl.split("/").pop();
                        if (!paymentInstrument) {
                            throw Error("Missing payment Instrument url, paymentInstrumentUrl: " + paymentInstrumentUrl);
                        };
                        let instrumentIdentifierUrl = payload.data._links.instrumentIdentifiers?.[0].href;
                        let instrumentIdentifier = instrumentIdentifierUrl && instrumentIdentifierUrl.split("/").pop();
                        if (!instrumentIdentifier) {
                            throw Error("Missing Instrument Identifier url, instrumentIdentifierUrl: " + instrumentIdentifierUrl);
                        }
                        await updateCardDetails(instrumentIdentifier, paymentInstrument, req);
                    }
                    else {
                        logger.debug("WebhookRouter tokenUpdate: Configurations doesn't exists in SSE");
                    };
                } catch (e) {
                    logger.debug(("WebhookRouter tokenUpdate: " + e.message));
                }
            }
        }
        else {
            logger.debug("WebhookRouter tokenUpdate: Request event is not tms.networktoken.updated");
        }
    }
    catch (error) {
        logger.debug("WebhookRouter tokenUpdate: " + error.message);
    }
    finally{
        res.status(204).send();
    }
}
));
async function updateCardDetails(instrumentIdentifier: string, paymentInstrument: string, req: Request) {
    const requestContext: RequestContext = req.app.locals;
    let retrieveInstrumentIdResponse: PostInstrumentIdentifierRequest | null = null;
    logger.debug("WebhookRouter tokenUpdate: calling InstrumentIdentifierApi with id: " + instrumentIdentifier);
    retrieveInstrumentIdResponse = await makeRequest(
        requestContext.merchantConfig,
        InstrumentIdentifierApi,
        "getInstrumentIdentifier",
        instrumentIdentifier,
        {}
    )
    logger.debug("WebhookRouter tokenUpdate: Fetching card details with Payment Instrument: " + paymentInstrument);
    const getCreditCardResponse = await occClientStorefront.getProfileWithToken(paymentInstrument);
    logger.debug("WebhookRouter tokenUpdate: Get Profile Response :" + JSON.stringify(maskRequestData(getCreditCardResponse)));
    const { creditCards = [], id } = <{ creditCards: OCC.card[], id: string }>getCreditCardResponse?.items?.[0] || {};
    const indexOfUpdateCard = creditCards.findIndex((cardDetail: OCC.card) => cardDetail.token === paymentInstrument);
    if (indexOfUpdateCard !== -1 && retrieveInstrumentIdResponse?.tokenizedCard) {
        logger.debug("WebhookRouter tokenUpdate: Matching creditCard found " + indexOfUpdateCard);
        const tokenizedCard = retrieveInstrumentIdResponse.tokenizedCard;
        if ("ACTIVE" === tokenizedCard.state) {
            logger.debug("WebhookRouter tokenUpdate: updating card details in payload");
            creditCards[indexOfUpdateCard].expirationMonth = tokenizedCard.card?.expirationMonth || creditCards[indexOfUpdateCard].expirationMonth;
            creditCards[indexOfUpdateCard].expirationYear = tokenizedCard.card?.expirationYear || creditCards[indexOfUpdateCard].expirationYear;
            creditCards[indexOfUpdateCard].creditCardNumber = creditCards[indexOfUpdateCard].creditCardNumber.slice(0, -4) + tokenizedCard?.card?.suffix;
            logger.debug("WebhookRouter tokenUpdate: calling update service for profile id: " + id);
            await occClientStorefront.updateProfile(creditCards, id);
            logger.debug("WebhookRouter tokenUpdate: update successful");
        } else {
            logger.debug("WebhookRouter tokenUpdate: card state is " + tokenizedCard.state);
        }
    }
    else {
        logger.debug(`WebhookRouter tokenUpdate: No matching card found for paymentInstrumentId: ${paymentInstrument}`);
    }
}

export default router;