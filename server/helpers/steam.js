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
    callback({authed: false, message: "Missing Steam URL"});
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

      targetScript = targetScript.split('=');
      targetScript = targetScript[1].split(';');
      targetScript = targetScript[0].trim();

      var profileData = JSON.parse(targetScript);

      callback(null, profileData);
    }
  );
}
