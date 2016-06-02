var db = require('../db');
var sm = require('sitemap');

module.exports = {
  generateSitemap
};

function generateSitemap(req, res)
{
  db.aggregate('profiles', [ { $unwind: '$leaderboard' }, { $group: { '_id': '$leaderboard.rlrank_id' }, { $limit : 10000 }, { $project: 'rlrank_id': '$_id' } ],
    function(err, docs)
    {
      var urls = docs.map(function(doc) {
        return {
          url: '/u/' + doc.rlrank_id
        };
      });

      urls.unshift(
        { url: '/' },
        { url: '/leaderboards' },
        { url: '/rank-tiers' },
        { url: '/status' },
        { url: '/faq' },
        { url: '/contact' },
        { url: '/about' },
        { url: '/privacy' },
        { url: '/advertise' }
      );

      sitemap = sm.createSitemap ({
        hostname: 'https://rocketleaguerank.com',
        cacheTime: 600000,        // 600 sec - cache purge period
        urls: urls
      });

      sitemap.toXML(function (err, xml) {
        if (err) {
          return res.status(500).end();
        }
        res.header('Content-Type', 'application/xml');
        res.send(xml);
      });
    }
  );
}
