var config = require('../../config.js');
var restler = require('restler');
var db = require('../db');

module.exports = {
  getXuidFromGamertag
}

function getXuidFromGamertag(gamertag, callback)
{
  console.log("[XBOX] Getting gamertag from xboxapi [%s]", gamertag);

  db.findOneWhere('xuids', {gamertag: gamertag}, {},
    function(err, doc)
    {
      if (err)
      {
        console.log("[XBOX] [ERROR] Error getting xuid from database [%s]", gamertag, err);
        return callback({"code": "server_error", "message": "There was an issue fetching your stats. We have been notified."});
      }

      if (!doc)
      {
        restler.get('https://xboxapi.com/v2/xuid/' + gamertag, {headers:{'X-AUTH': config.xboxapi.key, 'Content-Type': 'application/json'}})
          .on('complete',
            function(xuid)
            {
              callback(null, xuid);
              db.insert('xuids', {gamertag: gamertag, xuid: xuid},
                function(err, doc)
                {
                  if (err)
                  {
                    console.log("[XBOX] [ERROR] Error saving xuid to database [%s]", gamertag, err);
                  }
                }
              );
            }
          ).on('error',
            function(err)
            {
              console.log("[XBOX] [ERROR] Error getting xuid from gamertag [%s]", gamertag, err.rawEncoded);
              callback({"code": "server_error", "message": "There was an issue fetching your stats. We have been notified."});
            }
          );
      }
      else
      {
        return callback(null, doc.xuid);
      }
    }
  );
}
