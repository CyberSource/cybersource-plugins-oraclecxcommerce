import { populateError } from '@oracle-cx-commerce/endpoints/utils';
import { CHANNEL, FLEX_URL } from '../../components/constants';
import { createEndpoint, getBodyAsJson } from '@oracle-cx-commerce/endpoints/factory';

export const processInput = payload => {
    const payloadData = {
        targetOrigin: typeof window != 'undefined' ? window.location.origin : ''
    }
    return {
        params: [FLEX_URL],
        body: payloadData,
        headers: { Channel: payload?.isPreview ? CHANNEL.PREVIEW : CHANNEL.STOREFRONT }
    };
};

export const processOutput = async response => {
    const configuration = await getBodyAsJson(response);
    if (!response.ok) {
        return populateError(response, configuration);
    }
    let jsonCaptureContextProperties = {};
    jsonCaptureContextProperties.captureContext = configuration.captureContext;
    jsonCaptureContextProperties.captureContextCipherEncrypted = configuration.cipher?.encrypted;
    jsonCaptureContextProperties.captureContextCipherIv = configuration.cipher?.iv;
    return ({
        flexMicroformRepository: {
            flexContext: jsonCaptureContextProperties
        }
    });
};

export default createEndpoint('extpost', {
    processInput,
    processOutput
});






