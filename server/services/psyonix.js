var db = require('../db');
var rest = require('restler');
var steam = require('../helpers/steam');

module.exports = {
  auth: auth,
  getPlayerRanks: getPlayerRanks,
  refreshToken: refreshToken
};

function auth(req, res)
{
  steam.getDetailsFromURL(req.body.url, function(err, steamProfile)
  {
    if (err)
    {
        res.status(500).send(err);
    }

    db.findOne('config', {name: 'token'}, function(err, doc)
    {
      if (err)
      {
        res.status(404).send(err);
      }

      res.send({
        authed: true,
        token: doc.value,
        profile: steamProfile
      });

    });
  });
}

// 1v1:10, 2v2:11, 3v3S:12, 3v3:13

function getPlayerRanks(id, token, callback)
{
  db.findOne('config', {name: 'token'}, function(err, doc)
  {
    if (err)
    {
      callback(true);
    }

    token = doc.value;

    rest.post('https://psyonix-rl.appspot.com/callproc105/',{
        data: {
          'Proc[]': 'GetPlayerSkillSteam',
          'P0P[]': id
        },
        headers: {
          'CallProcKey': 'pX9pn8F4JnBpoO8Aa219QC6N7g18FJ0F',
          'SessionID': token
        }
    })
      .on('complete', function(result, response)
      {
        if (result instanceof Error)
        {
          callback(result);
          return false;
        }

        console.log("Result", result);

        if (result.indexOf('SessionNotActive') > -1)
        {
          console.log("Refreshing Psyonix token...");
          refreshToken(function(err, token)
          {
            console.log("New token:", token);
            // getPlayerRanks(id, token, callback);
          });
        }
        else
        {
          callback(null, result);
        }
      });

  });
}

function refreshToken(callback)
{
  rest.post('https://psyonix-rl.appspot.com/auth/', {
      data: {
        'PlayerName': 'Mugabe',
        'PlayerID': '76561198165509312',
        'Platform': 'Steam',
        'BuildID': '-1543484724',
        'AuthCode': '14000000F887D41BC8956048C0C43B0C01001001122FCE561800000001000000020000003DCAB9560000000060DB030001000000B20000003200000004000000C0C43B0C0100100116DC03003DCAB9564201A8C001000000B42FCE5634DFE9560100E4780000000000004C8DDFE2B0DEE5486684DFC761D33CEE637BC81F8EC0EE7CB8185ECF26D1A096AD8DBA8EF5545DD556BA1B3641C54DDC53599E0C7758FD76183F46D17D939DED0EB3DBE7EB57E80EAF6D3024308B80FE7D03C7382BCB7369D9C86D9BEE9F034988F45291C8E6FBD58C8BEB35522552B76AB451F1714706E8CB5E693776721B92',
        'IssuerID': '0'
      },
      headers: {
        'LoginSecretKey': 'dUe3SE4YsR8B0c30E6r7F2KqpZSbGiVx',
        'Host': 'psyonix-rl.appspot.com'
      }
    })
      .on('complete', function(result, response)
      {
        if (result instanceof Error || result != 1)
        {
          callback(true);
        }

        db.modify('config', {name: 'token'}, {$set: {value: response.headers.sessionid}}, function(err, doc)
        {
          if (err)
          {
            callback(true);
          }
        });

        callback(null, response.headers.sessionid);
      });
}
