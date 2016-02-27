var db = require('../db');
var https = require('http');
var Url = require('url');
var querystring = require('querystring');
var steam = require('../helpers/steam');
var restler = require('restler');

module.exports = {
  auth,
  getPlayerRanks,
  refreshToken,
  getLeaderboard
};

function auth(req, res)
{
  steam.getDetailsFromURL(req.body.url, function(err, steamProfile)
  {
    if (err)
    {
        return res.status(500).send(err);
    }

    res.send({
      profile: steamProfile
    });
  });
}

// 1v1:10, 2v2:11, 3v3S:12, 3v3:13

function getPlayerRanks(id, callback)
{
  var procData = {
    'Proc[]': 'GetPlayerSkillSteam',
    'P0P[]': id
  };

  callProc(procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }

    var data = parseResults(data);
    callback(null, data);
  });
}

function getLeaderboard(playlist, callback)
{
  var procData = {
    'Proc[]': 'GetSkillLeaderboard_v2',
    'P0P[]': playlist
  };

  callProc(procData, function(err, data)
  {
    if (err)
    {
      return callback(err);
    }

    var data = parseResults(data);
    callback(null, data);
  });
}

function callProc(procData, callback)
{
  db.findOne('config', {name: 'token'}, function(err, doc)
  {
    if (err)
    {
      return callback(err);
    }

    var headers = {
      'SessionID': doc.value,
      'CallProcKey': 'pX9pn8F4JnBpoO8Aa219QC6N7g18FJ0F'
    };

    restler.post('https://psyonix-rl.appspot.com/callproc105/', {data: procData, headers: headers})
      .on('complete',
      function(data, res)
      {
        console.log(data);
        if (data.indexOf('SessionNotActive') > -1)
        {
          console.log("Refreshing Psyonix token...");
          refreshToken(function(err, token)
          {
            console.log("New token:", token);
          });
        }
        else
        {
          callback(null, data);
        }
      }
    );
  });
}

function refreshToken(callback)
{
  var data = {
    'PlayerName': 'Mugabe',
    'PlayerID': '76561198165509312',
    'Platform': 'Steam',
    'BuildID': '-178744029',
    'AuthCode': '14000000FE0D71197299A6A7C0C43B0C01001001D2FAD156180000000100000002000000F5A8815100000000D4DF000001000000B20000003200000004000000C0C43B0C0100100116DC03003DCAB9564201A8C001000000B42FCE5634DFE9560100E4780000000000004C8DDFE2B0DEE5486684DFC761D33CEE637BC81F8EC0EE7CB8185ECF26D1A096AD8DBA8EF5545DD556BA1B3641C54DDC53599E0C7758FD76183F46D17D939DED0EB3DBE7EB57E80EAF6D3024308B80FE7D03C7382BCB7369D9C86D9BEE9F034988F45291C8E6FBD58C8BEB35522552B76AB451F1714706E8CB5E693776721B92',
    'IssuerID': '0'
  };

  var headers = {
    'LoginSecretKey': 'dUe3SE4YsR8B0c30E6r7F2KqpZSbGiVx'
  };

  restler.post('https://psyonix-rl.appspot.com/auth/', {data: data, headers: headers})
    .on('complete',
    function(data, res)
    {
      if (!data)
      {
        console.log(err);
        return callback(true);
      }

      db.modify('config', {name: 'token'}, {$set: {value: res.headers.sessionid}},
        function(err, doc)
        {
          if (err)
          {
            return callback(true);
          }

          callback(null, res.headers.sessionid);
        }
      );
    }
  );
}

function parseResults(results)
{
  var parsedResults = [];

  var lines = results.split(/\r?\n/);

  lines.forEach(function(line)
  {
    var properties = line.split('&');

    var parsedLine = {};
    properties.forEach(function(property)
    {
      property = property.split('=');
      parsedLine[property[0]] = property[1];
    });

    if (properties.length > 1)
    {
      parsedResults.push(parsedLine);
    }
  });

  return parsedResults;
}
