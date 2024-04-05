const { ApiClient } = require("cybersource-rest-client");
const { WEBHOOK_SUBSCRIPTION } = require("../request/common");
(function (ApiClient) {
  "use strict";
  class exports {
    constructor(configObject, apiClient) {
      this.apiClient = apiClient || ApiClient.instance;
      this.apiClient.setConfiguration(configObject);
      this.keyGeneration = function (KeyGenerationRequest, callback) {
        var postBody = KeyGenerationRequest;
        var response = {};
        // verify the required parameter 'KeyGenerationRequest' is set
        if (
          KeyGenerationRequest === undefined ||
          KeyGenerationRequest === null
        ) {
          throw new Error(
            "Missing the required parameter 'KeyGenerationRequest' when calling keyGeneration"
          );
        }
        var pathParams = {};
        var queryParams = {};
        var headerParams = {};
        var formParams = {};

        var authNames = [];
        var contentTypes = ["application/json;charset=utf-8"];
        var accepts = ["application/hal+json;charset=utf-8"];
        var returnType = response;
        return this.apiClient.callApi(
          "/kms/egress/v2/keys-sym",
          "POST",
          pathParams,
          queryParams,
          headerParams,
          formParams,
          postBody,
          authNames,
          contentTypes,
          accepts,
          returnType,
          callback
        );
      };
      this.webhookSubscription = function (
        webhookSubscriptionRequest,
        callback
      ) {
        var postBody = webhookSubscriptionRequest;
        var response = {};
        // verify the required parameter 'webhookSubscriptionRequest' is set
        if (
          webhookSubscriptionRequest === undefined ||
          webhookSubscriptionRequest === null
        ) {
          throw new Error(
            "Missing the required parameter 'webhookSubscriptionRequest' when calling webhookSubscription"
          );
        }
        var pathParams = {};
        var queryParams = {};
        var headerParams = {};
        var formParams = {};

        var authNames = [];
        var contentTypes = ["application/json;charset=utf-8"];
        var accepts = ["application/json"];
        var returnType = response;
        return this.apiClient.callApi(
          "/notification-subscriptions/v1/webhooks",
          "POST",
          pathParams,
          queryParams,
          headerParams,
          formParams,
          postBody,
          authNames,
          contentTypes,
          accepts,
          returnType,
          callback
        );
      };
      this.deleteWebhookSubscription = function (webhookId, callback) {
        var postBody = null;
        if ("GET" == "POST") {
          postBody = "{}";
        }

        // verify the required parameter 'keyId' is set
        if (webhookId === undefined || webhookId === null) {
          throw new Error(
            "Missing the required parameter 'webhookId' when calling deleteWebhookSubscription"
          );
        }

        var pathParams = {
          webhookId
        };
        var queryParams = {};
        var headerParams = {};
        var formParams = {};

        var authNames = [];
        var contentTypes = ["application/json;charset=utf-8"];
        var accepts = ["application/json"];
        var returnType = {};

        return this.apiClient.callApi(
          "/notification-subscriptions/v1/webhooks/{webhookId}",
          "DELETE",
          pathParams,
          queryParams,
          headerParams,
          formParams,
          postBody,
          authNames,
          contentTypes,
          accepts,
          returnType,
          callback
        );
      };

      this.retreiveAllSubscriptions = function (organizationId, callback) {
        var postBody = null;
        if ("GET" == "POST") {
          postBody = "{}";
        }

        // verify the required parameter 'keyId' is set
        if (organizationId === undefined || organizationId === null) {
          throw new Error(
            "Missing the required parameter 'organizationId' when calling getSubscriptionDetails"
          );
        }

        var pathParams = {};
        var queryParams = {
          organizationId: organizationId,
          productId: WEBHOOK_SUBSCRIPTION.PRODUCT_ID,
          eventType: WEBHOOK_SUBSCRIPTION.EVENT_TYPE,
        };
        var headerParams = {};
        var formParams = {};

        var authNames = [];
        var contentTypes = ["application/json;charset=utf-8"];
        var accepts = ["application/json"];
        var returnType = {};

        return this.apiClient.callApi(
          "/notification-subscriptions/v1/webhooks",
          "GET",
          pathParams,
          queryParams,
          headerParams,
          formParams,
          postBody,
          authNames,
          contentTypes,
          accepts,
          returnType,
          callback
        );
      };
    }
  }
  return (module.exports = exports);
})(ApiClient);
