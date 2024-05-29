import { RequestContext, asyncMiddleware, maskRequestData } from '@server-extension/common';
import { validateISVWebhook } from '@server-extension/middlewares/validateWebhook';
import occClientStorefront from '@server-extension/services/occ/occClientStorefront';
import makeRequest from '@server-extension/services/payments/api/paymentCommand';
import { WEBHOOK_SUBSCRIPTION } from '@server-extension/services/payments/converters/request/common';
import { getSavedNetworkTokenConfigurations } from '@server-extension/services/payments/converters/response/mappers';
import { InstrumentIdentifierApi, PostInstrumentIdentifierRequest } from 'cybersource-rest-client';
import { NextFunction, Request, Response, Router } from 'express';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();
const router = Router();

router.get('/tokenUpdate', asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    logger.debug("WebhookRouter tokenUpdate: Health check URL called");
    return res.status(200).send();
}))

router.post('/tokenUpdate', asyncMiddleware(validateISVWebhook), asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const webhookRequestData: OCC.Notification = req.body;
        const requestContext: RequestContext = req.app.locals;
        const savedWebhookConfiguration = await getSavedNetworkTokenConfigurations();
        if (requestContext.gatewaySettings?.networkTokenUpdates && WEBHOOK_SUBSCRIPTION.EVENT_TYPE === webhookRequestData?.eventType && webhookRequestData?.payload[0]?.data) {
            for (const payload of webhookRequestData.payload) {
                    const isConfigurationMatch = savedWebhookConfiguration.find((configuration: any) => configuration.merchantId === payload.organizationId) || false;
                    if (isConfigurationMatch) {
                        let paymentInstrumentUrl = payload.data._links.paymentInstruments?.[0].href;
                        let paymentInstrument = paymentInstrumentUrl && paymentInstrumentUrl.split("/").pop();
                        let instrumentIdentifierUrl = payload.data._links.instrumentIdentifiers?.[0].href;
                        let instrumentIdentifier = instrumentIdentifierUrl && instrumentIdentifierUrl.split("/").pop();
                        if(!paymentInstrument || !instrumentIdentifier){
                            throw Error("Missing Instrument Identifier URL or Payment Instrument URL");
                        }
                        await updateCardDetails(instrumentIdentifier, paymentInstrument, req);
                    }
                    else {
                        logger.debug("WebhookRouter tokenUpdate: Configurations doesn't exists in SSE"); 
                        res.status(404).send();
                    }
            }
            res.status(200).send(); 
        }
        else {
            throw Error(`WebhookRouter tokenUpdate: Network token update not enabled or Request eventType is [${webhookRequestData?.eventType}]`);
        }
    }
    catch (error) {
        logger.error("WebhookRouter tokenUpdate: " + error.message + `STACK TRACE: ${error.stack}`);
        res.status(404).send(); 
    };
}
));
async function updateCardDetails(instrumentIdentifier: string, paymentInstrument: string, req: Request) {
    try{
    const requestContext: RequestContext = req.app.locals;
    let retrieveInstrumentIdResponse: PostInstrumentIdentifierRequest | null = null;
    logger.debug("WebhookRouter tokenUpdate: Calling getInstrumentIdentifier with id: " + instrumentIdentifier);
    retrieveInstrumentIdResponse = await makeRequest(
        requestContext.merchantConfig,
        InstrumentIdentifierApi,
        "getInstrumentIdentifier",
        instrumentIdentifier,
        {}
    )
    logger.debug("WebhookRouter tokenUpdate: Fetching card details with Payment Instrument: " + paymentInstrument);
    const profileSavedCards = await occClientStorefront.getProfileWithCardDetails(paymentInstrument);
    logger.debug("WebhookRouter tokenUpdate: Profile response :" + JSON.stringify(maskRequestData(profileSavedCards)));
    const { creditCards = [], id } = <{ creditCards: OCC.card[], id: string }>profileSavedCards?.items?.[0] || {};
    const indexOfUpdateCard = creditCards.findIndex((cardDetail: OCC.card) => cardDetail.token === paymentInstrument);
    if (indexOfUpdateCard !== -1 && retrieveInstrumentIdResponse?.tokenizedCard) {
        logger.debug("WebhookRouter tokenUpdate: Matching creditCard found at " + indexOfUpdateCard);
        const tokenizedCard = retrieveInstrumentIdResponse.tokenizedCard;
        if ("ACTIVE" === tokenizedCard.state) {
            logger.debug("WebhookRouter tokenUpdate: Updating card details in payload");
            creditCards[indexOfUpdateCard].expirationMonth = tokenizedCard.card?.expirationMonth || creditCards[indexOfUpdateCard].expirationMonth;
            creditCards[indexOfUpdateCard].expirationYear = tokenizedCard.card?.expirationYear || creditCards[indexOfUpdateCard].expirationYear;
            creditCards[indexOfUpdateCard].creditCardNumber = creditCards[indexOfUpdateCard].creditCardNumber.slice(0, -4) + tokenizedCard?.card?.suffix;
            logger.debug("WebhookRouter tokenUpdate: Calling updateProfile with id: " + id);
            await occClientStorefront.updateProfile(creditCards, id);
            logger.debug("WebhookRouter tokenUpdate: Update successful");
        } else {
            logger.debug("WebhookRouter tokenUpdate: Card state is " + tokenizedCard.state);
        }
    }
    else {
        logger.debug(`WebhookRouter tokenUpdate: No matching card found for paymentInstrumentId: ${paymentInstrument}`);
    }
}
catch (error) {
    logger.error(("WebhookRouter tokenUpdate: " + error.message + `STACK TRACE: ${error.stack}`));
}
}

export default router;