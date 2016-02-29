var db = require('../db');
var swiftping = require('../helpers/swiftping');
var psyonix = require('../services/psyonix');
var rest = require('restler');
var cheerio = require('cheerio');

module.exports = {
  getDetailsFromURL: getDetailsFromURL
};

/**
 *
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
function getDetailsFromURL(url, callback)
{
  if (!url)
  {
    return callback({code: "missing_url",message: "No URL entered"});
  }

  var urlArray = url.split('/');

  if (urlArray[0] == "http:" || urlArray[0] == "https:")
  {
    if (urlArray[2] == "steamcommunity.com" || urlArray[2] == "www.steamcommunity.com")
    {
      if (urlArray[3] != "id" && urlArray[3] != "profiles")
      {
        return callback({code: "invalid_url",message: "URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>"});
      }
    }
    else
    {
      return callback({code: "invalid_url",message: "URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>"});
    }
  }
  else if (urlArray[0] == "steamcommunity.com" || urlArray[0] == "www.steamcommunity.com")
  {
    if (urlArray[1] != "id" || urlArray[1] != "profiles")
    {
      return callback({code: "invalid_url",message: "URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>"});
    }
  }
  else
  {
    return callback({code: "invalid_url",message: "URL must be of the format: https://steamcommunity.com/profiles/<id> or https://steamcommunity.com/id/<name>"});
  }

  rest.get(url)
    .on('complete', function(result)
    {
      var $ = cheerio.load(result);

      var targetScript = $('.responsive_page_template_content script').html();

      if (!targetScript)
      {
        callback({code: "not_found",message: "No Steam profile could be found"});
        return false;
      }

      targetScript = targetScript.split('g_rgProfileData =');console.log(targetScript);
      targetScript = targetScript[1].split('"};');console.log(targetScript);
      targetScript = targetScript[0].trim();
      targetScript += "\"}";

      var profileData = JSON.parse(targetScript);

      callback(null, profileData);
    }
  );
}
