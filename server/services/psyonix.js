var db = require('../db');
var http = require('http');
var querystring = require('querystring');
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

    refreshToken(function()
    {

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

    var data = {
      'Proc[]': 'GetPlayerSkillSteam',
      'P0P[]': id
    };

    var headers = {
      'SessionID': doc.value,
      'CallProcKey': 'pX9pn8F4JnBpoO8Aa219QC6N7g18FJ0F'
    };

    _psyonixPost('https://psyonix-rl.appspot.com/callproc105/', data, headers,
      function(err, res, headers)
      {
        if (err)
        {
          return callback(err);
        }

        console.log("Result", res);

        if (res.indexOf('SessionNotActive') > -1)
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
          callback(null, res);
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
    'AuthCode': '14000000087A6E6C38F87C9AC0C43B0C010010017159CF561800000001000000020000003DCAB956000000001E8EC50010000000B20000003200000004000000C0C43B0C0100100116DC03003DCAB9564201A8C001000000B42FCE5634DFE9560100E4780000000000004C8DDFE2B0DEE5486684DFC761D33CEE637BC81F8EC0EE7CB8185ECF26D1A096AD8DBA8EF5545DD556BA1B3641C54DDC53599E0C7758FD76183F46D17D939DED0EB3DBE7EB57E80EAF6D3024308B80FE7D03C7382BCB7369D9C86D9BEE9F034988F45291C8E6FBD58C8BEB35522552B76AB451F1714706E8CB5E693776721B92',
    'IssuerID': '0'
  };

  var headers = {
    'LoginSecretKey': 'dUe3SE4YsR8B0c30E6r7F2KqpZSbGiVx'
  };

  _psyonixPost('https://psyonix-rl.appspot.com/auth/', data, headers,
    function(err, res, headers)
    {
      if (err)
      {
        console.log(err);
        return callback(true);
      }

      db.modify('config', {name: 'token'}, {$set: {value: headers.sessionid}},
      function(err, doc)
        {
          if (err)
          {
            callback(true);
          }

          callback(null, headers.sessionid);
        }
      );
    }
  );
}

function _psyonixPost(url, data, headers, callback)
{
  var postData = querystring.stringify(data);

  var postHeaders = {};

  postHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
  postHeaders['Environment'] = 'Prod';

  Object.keys(headers).forEach(function(type)
  {
    postHeaders[type] = headers[type];
  });

  postHeaders['Content-Length'] = postData.length + 1;
  postHeaders['User-Agent'] = 'UE3-TA,UE3Ver(10897)';
  postHeaders['Host'] = 'psyonix-rl.appspot.com';
  postHeaders['Cache-Control'] = 'no-cache';

  console.log(postHeaders);

  var options = {
    method: 'POST',
    host: '127.0.0.1',
    port: 8888,
    path: url,
    headers: postHeaders
  };

  console.log(options);

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    var data = [];

    res.on('data', function(chunk) {
      data.push(chunk);
    });

    res.on('end', function() {
      console.log({headers: res.headers, data: data.join('')});
      callback(null, data.join(''), res.headers);
    })
  }).on('error', function(err) {
    callback(err);
  });

  req.write('&' + postData);
  req.end();
}
