const yauzl = require('yauzl');
const JSONStream = require('JSONStream');
const archiver = require('archiver');
const fs = require('fs-extra');

/**
 * Save custom app zip archive and parse package.json stream to return lists of publicUrls and authenticated Urls
 *
 * @param  {string}  archiveFile  The custom app archive file.
 */
function streamArchivePackageToJson(archiveFile) {
  return new Promise((resolve, reject) => {
    let response = {
      publicUrls: [],
      authenticatedUrls: []
    };

    yauzl.open(archiveFile, { lazyEntries: true }, function (err, zipfile) {
      if (err) {
        console.log(err);
        reject(err);
      }
      zipfile.readEntry();
      zipfile
        .on('entry', function (entry) {
          if (entry.fileName === 'package.json') {
            // Read package.json
            zipfile.openReadStream(entry, function (err, readStream) {
              if (err) {
                console.log(err);
                reject(err);
              }
              readStream.on('end', function () {
                zipfile.readEntry();
              });

              //Pipe output to JSON stream - parse for publicUrls
              //Test JSONPath here http://jsonpath.herokuapp.com/
              //This works for https://goessner.net/articles/JsonPath/ {Goessner} parser - $..[publicUrls,authenticatedUrls]
              let parser = JSONStream.parse('publicUrls.*'); //'$..[publicUrls,authenticatedUrls]'
              readStream.pipe(parser);

              parser.on('data', function (data) {
                console.log('received:', data);
                //Add to publicUrls array
                response.publicUrls.push(data);
              });

              //Pipe output to JSON stream - parse for authenticatedUrls
              parser = JSONStream.parse('authenticatedUrls.*'); //'$..[publicUrls,authenticatedUrls]'
              readStream.pipe(parser);

              parser.on('data', function (data) {
                console.log('received:', data);
                //Add to authenticatedUrls array
                response.authenticatedUrls.push(data);
              });
            });
          } else {
            // Ignore all other files.
            zipfile.readEntry();
          }
        })
        .on('close', function () {
          console.log(`Successfully saved file ${archiveFile}`);
          resolve(response);
        });
    });
  });
}

/**
 * Creates zip archive from server-extension package excluding list of pre-defined directories
 *
 * @param  {string}  source         Path to server-side extension.
 * @param  {string}  out            The output archive file name.
 * @param  {string}  excludedDirs   List of excluded directories.
 */
async function packageSSEExtension(source, out, excludedDirs) {
  return new Promise((resolve, reject) => {
    // create a file to stream archive data to.
    const output = fs.createWriteStream(out);

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => resolve('Archive finalized and output file created: ' + out));

    // catch error explicitly
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    // append files from a glob pattern
    // follow is set to true to resolve symbolic links in node_modules and replace them with real pathes
    // dot is set to true to include node_modules/.bin and other hidden files & directories
    // ignore will receive list of directories to exclude during archive creation
    archive.glob('**/*', {
      cwd: `${source}`,
      follow: true,
      dot: true,
      ignore: excludedDirs
    });

    archive.finalize();
  });
}

module.exports = { streamArchivePackageToJson, packageSSEExtension };
