//client.js
const https = require('https');

/**
 * REST client for the OCCS Admin server.
 *
 * @class
 */
class Client {
  /**
   * Create a new OCCS Admin REST client instance.
   *
   * @param  {string}  baseURL                       The base URL, or hostname.
   * @param  {string}  appKey                        The application key obtained from OCCS Admin server.
   * @param  {Object}  [options={}]                  The options to modify the instance's default behavior.
   * @param  {number}  options.tokenRenewalInterval  Overrides the authorization token's expiration time. Unit is seconds.
   */
  constructor(url, appKey) {
    this.url = url;
    this.appKey = appKey;
    this.accessToken = null;
    this.expiresIn = null;
    this.timer = null;
    this.startTime = null;
  }

  async listApps() {
    const oauth = await this.login();
    console.log(`OAuth = ${oauth}`);
    const response = await this.listSSEFiles(oauth);
    return response;
    //var promise = login();
    //this.login().then(
    //  return this.listSSEFiles();
    //  //return result;
    //);
  }

  async listSSEFiles(accessToken) {
    let result = '';
    let json = {};

    console.log(`listSSEFiles.Connecting to ${this.url}`);
    console.log(`Token ${accessToken}`);

    const options = {
      method: 'GET',
      hostname: this.url,

      port: 443,
      path: '/ccadmin/v1/serverExtensions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken
      },
      responseType: 'json'
    };

    // Return new promise
    return new Promise(function (resolve, reject) {
      // Make request
      const request = https.request(options, (response) => {
        response.on('data', function (chunk) {
          result += chunk;
        });
        response.on('end', function () {
          try {
            console.log(result);
            json = JSON.parse(result);
            resolve(json);
          } catch (error) {
            console.error(error.message);
          }
        });
        response.on('error', function (err) {
          console.log(err);
          reject(err);
        });
      });

      request.on('error', (error) => {
        console.error(error);
      });

      request.end();
    });
  }

  async login() {
    var result = '';

    console.log(`Connecting to ${this.url}`);

    // form data
    var postData = 'grant_type=client_credentials';

    // request option
    var options = {
      host: this.url,
      port: 443,
      method: 'POST',
      path: '/ccadmin/v1/login',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length,
        Authorization: 'Bearer ' + this.appKey
      }
    };

    // Return new promise
    return new Promise(function (resolve, reject) {
      // request object
      var req = https.request(options, function (res) {
        res.on('data', function (chunk) {
          result += chunk;
        });
        res.on('end', function () {
          try {
            let json = JSON.parse(result);
            this.startTime = new Date();
            this.accessToken = json.access_token;
            console.debug(`Got an Admin authorization token, value: '${this.accessToken}'`);
            this.expiresIn = parseInt(json.expires_in, 10);
            resolve(this.accessToken);
          } catch (error) {
            console.error(error.message);
          }
        });
        res.on('error', function (err) {
          console.log(err);
          reject(err);
        });
      });

      // req error
      req.on('error', function (err) {
        console.log(err);
      });

      //send request with the postData form
      req.write(postData);
      req.end();
    });
  }
}

module.exports = {
  Client
};
