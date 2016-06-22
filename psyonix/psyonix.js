var restler = require('restler');

module.exports = {
  callProc: callProc,
  refreshToken: refreshToken
};

function callProc(req, res)
{
    var token = req.body.token;
    var procUrl = req.body.procUrl;
    var procData = req.body.procData;

    console.log(req.body);

    var headers = {
      'SessionID': token,
      'CallProcKey': 'pX9pn8F4JnBpoO8Aa219QC6N7g18FJ0F',
      'Cache-Control': 'no-cache',
      'Environment': 'Prod',
      'User-Agent': 'UE3-TA,UE3Ver(10897)',
      'BuildID': '186761134'
    };

    var time = new Date();

    console.log(time.toTimeString() + ' [PSYONIX] Sending callProc to Psyonix [%s]', JSON.stringify(procData));

    restler.post(procUrl, {data: procData, headers: headers})
      .on('complete',
      function(data, response)
      {
        if (data.indexOf('SessionNotActive') > -1)
        {
          console.log('[PSYONIX] SessionNotActive - Token needs refreshing.');
          res.status(400).send({code: 'token_expired'});
        }
        else if (data.indexOf('403 Sorry...') > -1)
        {
          console.log('[PSYONIX] [ERROR] Psyonix is throttling requests...');
          res.status(400).send({code: 'throttling'});
        }
        else
        {
          res.send(data);
        }
      }
    );
}

function refreshToken(req, res)
{
  var data = {
    'PlayerName': '',
    'PlayerID': '1',
    'Platform': 'PS4',
    'BuildID': '186761134',
    'BuildRegion': '',
    'AuthCode': '',
    'AuthTicket': '',
    'IssuerID': '0'
  };

  var headers = {
    'LoginSecretKey': 'dUe3SE4YsR8B0c30E6r7F2KqpZSbGiVx',
    'Cache-Control': 'no-cache',
    'Environment': 'Prod',
    'User-Agent': 'UE3-TA,UE3Ver(10897)',
    'BuildID': '186761134'
  };

  restler.post('https://psyonix-rl.appspot.com/auth/', {data: data, headers: headers})
    .on('complete',
    function(data, response)
    {
      if (!data)
      {
        console.log('[PSYONIX] [ERROR] There was an error authing with Psyonix', data);
        res.status(400).send({code: 'no_data'});
      }

      if (data.indexOf('403 Sorry...') > -1)
      {
        console.log('[PSYONIX] [ERROR] Psyonix is throttling requests...');
        res.status(400).send({code: 'throttling'});
      }

      console.log('[PSYONIX] Got new token from Psyonix', response.headers.sessionid);
      res.send({token: response.headers.sessionid});
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

function parseMultiResults(results)
{
  var parsedResults = [];
  var groupedResults = [];

  var lines = results.split(/\r?\n/);

  var previousLine = null;
  lines.forEach(
    function(line, index)
    {
      var properties = line.split('&');

      var parsedLine = {};
      properties.forEach(
        function(property)
        {
          property = property.split('=');
          parsedLine[property[0]] = property[1];
        }
      );

      if (properties.length > 1)
      {
        groupedResults.push(parsedLine);
      }
      else if (properties[0] == '')
      {
        properties = [];
      }

      if (line == 'SQL ERROR:' || previousLine == 'SQL ERROR:')
      {
        previousLine = line;
      }
      else if ((line === '' && (previousLine === '' || index === 0) && index != lines.length - 1) || (properties.length == 1 && (previousLine == '' || index === 0)))
      {
        parsedResults.push([]);
        groupedResults = [];
        previousLine = line;
      }
      else if (line === '' && groupedResults.length > 0)
      {

        parsedResults.push(groupedResults);
        groupedResults = [];
        previousLine = line;
      }
      else
      {
        previousLine = line;
      }
    }
  );

  return parsedResults;
}
