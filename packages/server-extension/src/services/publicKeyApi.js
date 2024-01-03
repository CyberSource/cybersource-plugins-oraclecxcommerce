const { ApiClient } = require("cybersource-rest-client");
(function (ApiClient) {
  "use strict";
  class exports {
    constructor(configObject, apiClient) {
      this.apiClient = apiClient || ApiClient.instance;
      this.apiClient.setConfiguration(configObject);

      this.getPublicKey = function (kid, callback) {
        var postBody = null;
        if ("GET" == "POST") {
          postBody = "{}";
        }
        // verify the required parameter 'kid' is set
        if (kid === undefined || kid === null) {
          throw new Error(
            "Missing the required parameter 'kid' when calling getPublicKey"
          );
        }

        var pathParams = {
          kid: kid,
        };
        var queryParams = {};
        var headerParams = {};
        var formParams = {};

        var authNames = [];
        var contentTypes = ["application/json;charset=utf-8"];
        var accepts = ["application/json"];
        var returnType = {};

        return this.apiClient.callApi(
          "/flex/v2/public-keys/{kid}",
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
