const path = require('path');


URLManager = {};

URLManager.getResourceExtension = function(uri)
{
    var extension = path.extname(uri.pathname);
    if (!extension)
    {
        return ".html";
    }
    
    return extension;
}

URLManager.getDownloadableURL = function(urlParent, href)
{
    return new URL(href, urlParent);
}

module.exports = {
    URLManager,
}