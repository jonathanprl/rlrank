var rest = require('restler');

module.exports = {
  auth: auth,
  getPlayerRanks: getPlayerRanks
};

function auth(req, res)
{
  rest.post('https://psyonix-rl.appspot.com/auth/', {
    data: {
      'PlayerName': req.body.name,
      'PlayerID': req.body.id,
      'Platform': req.body.platform,
      'BuildID': '-1543484724',
      'AuthCode': '14000000C6887D24EAC690B8944A920001001001F1D3CC5618000000010000000200000066A88151000000006E9A0F0004000000C40000004400000004000000944A92000100100116DC030066A881510121A8C000000000A255CB562205E7560100E4780000030000FA05000000721906000000B22E0600000000003F0BE1D7318B238188B872A506FBED60D2325588BFF1D93B33B34DAEBB1F68FE620B33F2D5D3871F650ECCF0617E3535A0CCC8B32E86EF06848EADD45768D8268A30501A861B7B9579A781CD122F00DF1BD2F7F4089DF6DBC22A8F4C9D032F40B3A15BFA962471AE94694FEB980C3384CCF8487996CCD454B2A5CE9E3CA4E575',
      'IssuerID': '0'
    },
    headers: {
      'LoginSecretKey': 'dUe3SE4YsR8B0c30E6r7F2KqpZSbGiVx'
    }
  }).on('complete', function(result, response)
    {
      console.log(response.headers);
      var sessionid = response.headers.sessionid;

      if (result instanceof Error || result != 1)
      {
        res.status(404).end();
        return false;
      }
      //SCRIPT ERROR SessionNotActive:

      rest.post('https://psyonix-rl.appspot.com/callproc105/', {
        data: {
          'Proc[]': 'GetPlayerSkillSteam',
          'P0P[]': req.body.id
        },
        headers: {
          'CallProcKey': 'pX9pn8F4JnBpoO8Aa219QC6N7g18FJ0F',
          'SessionID': 'a113792f3046339904250f7670853710'
        }
      }).on('complete', function(result, response)
        {
          console.log(result);
          if (result instanceof Error)
          {
            res.status(404).end();
            return false;
          }

          res.send({result: result});
        }
      );

      // res.send({authed: true, session: response.headers.sessionid});
    }
  );
}

// 1v1:10, 2v2:11, 3v3S:12, 3v3:13

function getPlayerRanks(req, res)
{
  rest.post('https://psyonix-rl.appspot.com/callproc105/', {
    data: {
      'Proc[]': 'GetPlayerSkillSteam',
      'P0P[]': req.body.id
    },
    headers: {
      'LoginSecretKey': 'dUe3SE4YsR8B0c30E6r7F2KqpZSbGiVx',
      'SessionID': req.body.session,
      'CallProcKey': 'pX9pn8F4JnBpoO8Aa219QC6N7g18FJ0F'
    }
  }).on('complete', function(result)
    {
      console.log(result);
      if (result instanceof Error || result != 1)
      {
        res.status(404).end();
        return false;
      }

      res.send({authed: true});
    }
  );
}

function getLoginSecret()
{
  // One day this will launch RL, sniff packets and get the BuildID, AuthCode and LoginSecretKey.
}
