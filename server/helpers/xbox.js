var config = require('../../config.js');
var restler = require('restler');
var db = require('../db');
var swiftping = require('./swiftping');

module.exports = {
  getXuidFromGamertag
};

function getXuidFromGamertag(gamertag, callback)
{
  db.findOneWhere('xuids', {gamertag: gamertag}, {},
    function(err, doc)
    {
      if (err)
      {
        return callback({code: 0, msg: 'Error getting XUID from database', data: err});
      }

      if (!doc)
      {
        restler.get('https://xboxapi.com/v2/xuid/' + gamertag, {headers:{'X-AUTH': config.xboxapi.key, 'Content-Type': 'application/json'}})
          .on('complete',
            function(xuid)
            {
              if (xuid.success === false)
              {
                return callback({code: 1, msg: 'XUID search returned no result', data: xuid});
              }

              callback(null, xuid);
              db.insert('xuids', {gamertag: gamertag, xuid: xuid},
                function(err, doc)
                {
                  if (err)
                  {
                    return callback({code: 2, msg: 'Error saving XUID to database', data: err});
                  }
                }
              );
            }
          ).on('error',
            function(err)
            {
              return callback({code: 3, msg: 'Error getting XUID from Gamertag', data: err.rawEncoded});
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
