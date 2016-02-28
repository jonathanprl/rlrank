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
    return callback({authed: false, message: "Missing Steam URL"});
  }

  var urlArray = url.split('/');

  console.log(urlArray);

  if (urlArray[0] == "http:" || urlArray[0] == "https:")
  {
    if (urlArray[2] == "steamcommunity.com" || urlArray[2] == "www.steamcommunity.com")
    {
      if (urlArray[3] != "id" && urlArray[3] != "profiles")
      {
        return callback({authed: false, message: "Invalid URL"});
      }
    }
    else
    {
      return callback({authed: false, message: "Invalid URL"});
    }
  }
  else if (urlArray[0] == "steamcommunity.com" || urlArray[0] == "www.steamcommunity.com")
  {
    if (urlArray[1] != "id" || urlArray[1] != "profiles")
    {
      return callback({authed: false, message: "Invalid URL"});
    }
  }

  rest.get(url)
    .on('complete', function(result)
    {
      var $ = cheerio.load(result);

      var targetScript = $('.responsive_page_template_content script').html();

      if (!targetScript)
      {
        callback({authed: false, message: "Profile not found"});
        return false;
      }

      targetScript = targetScript.split('g_rgProfileData =');console.log(targetScript);
      targetScript = targetScript[1].split('"};');console.log(targetScript);
      targetScript = targetScript[0].trim();
      targetScript += "\"}";

      console.log(targetScript);

      var profileData = JSON.parse(targetScript);

      callback(null, profileData);
    }
  );
}
