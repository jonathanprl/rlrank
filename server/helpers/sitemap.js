var db = require('../db');
var sm = require('sitemap');

module.exports = {
  generateSitemap
};

function generateSitemap(req, res)
{
  db.aggregate('profiles', [ { $group: { _id: '$hash', rlrank_id:  { $first: '$rlrank_id' } } }, { $limit : 10000 } ],
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
