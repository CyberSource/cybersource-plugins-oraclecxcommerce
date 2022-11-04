const https = require('https');
const fs = require('fs');

async function login(url, appKey) {
  var result = '';

  console.debug(`[login]Connecting to ${url}`);

  // form data
  var postData = 'grant_type=client_credentials';

  // request option
  var options = {
    host: url,
    port: 443,
    method: 'POST',
    path: '/ccadmin/v1/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length,
      Authorization: 'Bearer ' + appKey
    }
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // request object
    let req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        result += chunk;
      });
      res.on('end', function () {
        try {
          let json = JSON.parse(result);
          //console.debug(`Got an Admin authorization token, value: '${json.access_token}'`);
          resolve(json.access_token);
        } catch (error) {
          console.error(error.message);
        }
      });
      res.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    // req error
    req.on('error', function (err) {
      console.error(err);
    });

    //send request with the postData form
    req.write(postData);
    req.end();
  });
}

async function mfalogin(url, username, password, passcode) {
  let result = '';

  console.debug(`[login]Connecting to ${url}`);

  // form data
  const postData = `grant_type=password&username=${username}&password=${password}&totp_code=${passcode}`;

  // request option
  const options = {
    host: url,
    port: 443,
    method: 'POST',
    path: '/ccadmin/v1/mfalogin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // request object
    const req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        result += chunk;
      });
      res.on('end', function () {
        try {
          const json = JSON.parse(result);
          //console.debug(`Got an Admin authorization token, value: '${json.access_token}'`);
          resolve(json.access_token);
        } catch (error) {
          console.error(error.message);
        }
      });
      res.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    // req error
    req.on('error', function (err) {
      console.error(err);
    });

    //send request with the postData form
    req.write(postData);
    req.end();
  });
}

async function createFolder(url, location, accessToken) {
  console.debug(`[createFolder]Creating ${location}`);

  const payload = JSON.stringify({ folder: location });

  // request option
  const options = {
    host: url,
    port: 443,
    method: 'POST',
    path: '/ccadmin/v1/files/createFolder',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      Authorization: 'Bearer ' + accessToken
    }
  };

  //Return new promise
  return new Promise(function (resolve, reject) {
    var req = https.request(options, function (res) {
      res.on('data', function (_chunk) {
        /*empty*/
      });
      res.on('end', function () {
        resolve(res.statusCode);
      });
      res.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    // req error
    req.on('error', function (err) {
      console.error(err);
    });

    //send request with the payload
    req.write(payload);
    req.end();
  });
}

async function uploadFile(url, accessToken, fileName) {
  let result = '';

  console.debug(`[uploadFile]Connecting to ${url}`);

  // Form data. Assume each file requires only 1 segment to upload
  const payload = JSON.stringify({ segments: '1', filename: fileName });

  // request option
  const options = {
    host: url,
    port: 443,
    method: 'PUT',
    path: '/ccadmin/v1/files',
    headers: {
      'Content-Type': 'application/json',
      //'X-CCAsset-Language': 'en',
      'Content-Length': payload.length,
      Authorization: 'Bearer ' + accessToken
    }
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // request object
    const req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        result += chunk;
      });
      res.on('end', function () {
        try {
          console.log(result);
          const json = JSON.parse(result);
          //Return file token

          resolve(json['token']);
        } catch (error) {
          console.error(error.message);
        }
      });
      res.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    // req error
    req.on('error', function (err) {
      console.error(err);
    });

    //send request with the postData form
    req.write(payload);
    req.end();
  });
}

async function doFileSegmentUpload(url, accessToken, fileToken, fileName, base64String) {
  let result = '';

  console.debug(`[doFileSegmentUpload]Connecting to ${url}`);

  // Form data. Assume each file requires only 1 segment to upload
  const payload = JSON.stringify({
    index: '0',
    token: fileToken,
    filename: fileName,
    file: base64String
  });

  // request option
  const options = {
    host: url,
    port: 443,
    method: 'POST',
    path: '/ccadmin/v1/files/' + fileToken,
    headers: {
      'Content-Type': 'application/json',
      'X-CCAsset-Language': 'en',
      'Content-Length': payload.length,
      Authorization: 'Bearer ' + accessToken
    }
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // request object
    const req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        result += chunk;
      });
      res.on('end', function () {
        try {
          resolve(result);
        } catch (error) {
          console.error(error.message);
        }
      });
      res.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    // req error
    req.on('error', function (err) {
      console.error(err);
    });

    //send request with the postData form
    req.write(payload);
    req.end();
  });
}

// function to encode file data to base64 encoded string
function base64Encode(file) {
  return new Promise((resolve, reject) => {
    // read binary data
    fs.readFile(file, (err, data) => {
      if (err) reject(err);
      resolve(Buffer.from(data).toString('base64').toString('ascii'));
    });
  });
}

module.exports = {
  login,
  mfalogin,
  createFolder,
  uploadFile,
  doFileSegmentUpload,
  base64Encode
};
