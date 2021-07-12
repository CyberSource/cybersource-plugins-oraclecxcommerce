/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

// Open extension ext.json and add extension id
async function updateExtensionJSON(extensionName, extensionId) {
  return new Promise((resolve, reject) => {
    const extensionFile = `./packages/${extensionName}/ext.json`;
    fs.readFile(extensionFile, (err, data) => {
      if (err) reject(err);
      const ext = JSON.parse(data);

      //Update extension ID
      ext['extensionID'] = extensionId;
      ext['timeCreated'] = new Date().toISOString().slice(0, 10);

      //Write file
      fs.writeFile(extensionFile, JSON.stringify(ext), (err) => {
        if (err) reject(err);
        resolve(`Data written to file: ./packages/${extensionName}/ext.json`);
      });
    });
  });
}

// Get extension id from ext.json
async function getExtensionId(extensionName) {
  return new Promise((resolve, reject) => {
    const extensionFile = `./packages/${extensionName}/ext.json`;
    fs.readFile(extensionFile, (err, data) => {
      if (err) reject(err);
      const ext = JSON.parse(data);

      //Return extension ID
      resolve(ext['extensionID']);
    });
  });
}

/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
async function createArchive(source, out, excludedDirs) {
  var zip = new JSZip();
  const stream = fs.createWriteStream(out);

  buildZipFromDirectory(excludedDirs, source, zip);
  return new Promise((resolve, reject) => {
    zip
      .generateNodeStream({
        type: 'nodebuffer',
        streamFiles: true,
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9
        }
      })
      .pipe(stream)
      .on('error', (err) => reject(err))
      .on('finish', function () {
        stream.on('close', () => resolve(`Archive file completed: ${out}`));
      });
  });
}

function buildZipFromDirectory(excludedDirs, dir, zip, root = dir) {
  const list = fs.readdirSync(dir);

  for (let file of list) {
    file = path.resolve(dir, file);
    if (excludedDirs.indexOf(path.relative(root, file)) < 0) {
      if (fs.existsSync(file)) {
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
          buildZipFromDirectory(excludedDirs, file, zip, root);
        } else {
          const filedata = fs.readFileSync(file);
          zip.file(path.relative(root, file), filedata);
        }
      }
    }
  }
}

module.exports = {
  updateExtensionJSON,
  getExtensionId,
  createArchive
};
