var db = require('../db');
var sm = require('sitemap');

module.exports = {
  generateSitemap
};

function generateSitemap(req, res)
{
  db.find('leaderboards', function(err, docs) {
    db.find('blog', function(err, blogs) {
      var urls = docs.map(function(doc) {
        return {
          url: '/u/' + doc.rlrank_id
        };
      });

      blogs.forEach(function(blog) {
        urls.unshift({ url: '/blog/' + blog.seo_title });
      });

      urls.unshift(
        { url: '/' },
        { url: '/leaderboards' },
        { url: '/rank-tiers' },
        { url: '/blog' },
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
    });
  });
}
