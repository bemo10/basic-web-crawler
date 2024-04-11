
const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const stream = require('stream');
const path = require('path');
const archiver = require('archiver');
const { URLManager } = require('./URLManager.js')
const { ReplaceManager } = require('./ReplaceManager.js')


function getTransformStream(url, recLevel, replaceManager, doCrawlAndDownloadResource) {
    let transformStream = new stream.Transform();
    let buffer = '';

    transformStream._transform = function (chunk, encoding, callback) {
        buffer += chunk.toString();
        callback();
    };

    transformStream._flush = function (callback) {
        this.push(transformStream._replace(buffer));
        callback();
    }

    transformStream._replace = function (chunk) {
        $ = cheerio.load(chunk);
        $('a').each(function (i, link) {
            let href = $(this).attr('href');
            let downloadableURL = URLManager.getDownloadableURL(url, href);
            let newhref = replaceManager.lookupName(downloadableURL);
            $(this).attr('href', newhref);

            doCrawlAndDownloadResource(downloadableURL, recLevel - 1, newhref);

        }); //end $a.each
        return $.html();
    };

    return transformStream;
}//end getTransformStream


// URLManager() tests
/*
console.log( URLManager.getResourceExtension("a.png") );
console.log( URLManager.getDownloadableURL("http://stw.deic-docencia.uab.cat/nodeJS/webArchiver/test.html", "test_1_1.html") );
*/


// ReplaceManager(maxFiles) tests
/*
var rep = new ReplaceManager(3);
console.log(rep.lookupName("site1.html"));
console.log(rep.lookupName("site2.html"));
console.log(rep.lookupName("site4.html"));
console.log(rep.lookupName("site5.html"));
*/


// Start Crawling
function startCrawling(req, res) {
    let downloadedFiles = [];
    console.log("Crawling started");
    var url = req.query.uri;
    var recLevel = req.query.rec;
    var maxFiles = req.query.maxFiles;
    var replaceManager = new ReplaceManager(maxFiles);
    var archive = archiver('zip');
    var finalizeCounter = 0;

    archive.pipe(res);

    doCrawlAndDownloadResource(url, recLevel, "index.html")

    function doCrawlAndDownloadResource(url, recLevel, entryName) {
        // return in these cases
        if (downloadedFiles.includes(entryName)) {
            console.log("entry name already exists ", entryName);
            return;
        }
        if (recLevel == 0) {
            console.log("max recursion reached");
            return;
        }
        if (downloadedFiles.length >= maxFiles) {
            console.log("max files reached");
            return;
        }

        console.log("pushing: ", entryName);
        downloadedFiles.push(entryName);
        var transformStream = getTransformStream(url, recLevel, replaceManager, doCrawlAndDownloadResource)

        fetch(url)
            .then(fetchRes => {
                console.log("fetching ", url.pathname);
                fetchRes.body.pipe(transformStream).on('finish', () => {
                    console.log("finished = ", finalizeCounter);
                    console.log("files length = ", downloadedFiles.length);
                    finalizeCounter++;
                    if (finalizeCounter == downloadedFiles.length) {
                        archive.finalize();
                    }
                })
            })
            .catch(err => console.error(err));

        archive.append(transformStream, { name: entryName });
    }
}



const app = express()
const port = 3000


app.use(express.static(path.join(__dirname, 'public')));

//here goes the routing 
app.get('/crawler', startCrawling);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
