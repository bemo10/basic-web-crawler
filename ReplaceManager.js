

function ReplaceManager(maxFiles)
{
    var _fileCounter = 0;
    var _replaceMap = {};
    var _NOT_FOUND_FILE = "404.html"

    this.lookupName = function(_url)
    {
        
        console.log("ReplaceManager new entry")
        if (_replaceMap[_url] != undefined)
        {
            console.log("ReplaceManager entry already exists: ", _url.pathname, _replaceMap[_url]);
            return _replaceMap[_url];
        }
        else
        {
            var val = "";
            if (_fileCounter < maxFiles)
            {
                /*if (_fileCounter == 0)
                {
                    val = "index" + URLManager.getResourceExtension(_url);
                }
                else
                {
                    val = String(_fileCounter) + URLManager.getResourceExtension(_url);
                }*/

                val = String(_fileCounter) + URLManager.getResourceExtension(_url);
            }
            else
            {
                return _NOT_FOUND_FILE;
            }

            _replaceMap[_url] = val;
        }

        _fileCounter++;

        console.log("ReplaceManager new entry: ", _url.pathname, _replaceMap[_url]);
        return _replaceMap[_url];
    }
}



module.exports = {
    ReplaceManager,
}