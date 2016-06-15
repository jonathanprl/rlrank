var amazon = require('amazon-product-api');
var maxmind = require('maxmind');
var path = require('path');

var db = require('../db');
var swiftping = require('../helpers/swiftping');

module.exports = {
  getClient,
  getProduct,
  getBanner,
  getRedirectUrl
};

function getClient(req, res, next)
{
  var geoLookup = maxmind.open(path.normalize(__dirname + '/../resources/GeoLite2-Country.mmdb'));
  var geo = geoLookup.get(req.ip);

  var countryCode = 'US';

  var amazonAffiliate = {};

  if (geo && 'country' in geo)
  {
    countryCode = geo.country.iso_code;
  }

  switch (countryCode) {
    case 'GB':
      amazonAffiliate = { id: 'rocketleaguerank-21', site: 'Amazon.co.uk', domain: 'webservices.amazon.co.uk', country_code: 'GB' };
      break;
    case 'FR':
      amazonAffiliate = { id: 'rocketleaguerankfr-21', site: 'Amazon.fr', domain: 'webservices.amazon.fr', country_code: 'FR' };
      break;
    case 'DE':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', domain: 'webservices.amazon.de', country_code: 'DE' };
      break;
    case 'CH':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', domain: 'webservices.amazon.de', country_code: 'DE' };
      break;
    case 'CA':
      amazonAffiliate = { id: 'rocketleaguerankca-20', site: 'Amazon.ca', domain: 'webservices.amazon.ca', country_code: 'CA' };
      break;
    case 'NL':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', domain: 'webservices.amazon.de', country_code: 'DE' };
      break;
    case 'FI':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', domain: 'webservices.amazon.de', country_code: 'DE' };
      break;
    case 'NO':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', domain: 'webservices.amazon.de', country_code: 'DE' };
      break;
    case 'BE':
      amazonAffiliate = { id: 'rocketleaguerankfr-21', site: 'Amazon.fr', domain: 'webservices.amazon.fr', country_code: 'FR' };
      break;
    case 'SE':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', domain: 'webservices.amazon.de', country_code: 'DE' };
      break;
    case 'PL':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', domain: 'webservices.amazon.de', country_code: 'DE' };
      break;
    case 'DK':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', domain: 'webservices.amazon.de', country_code: 'DE' };
      break;
    case 'IE':
      amazonAffiliate = { id: 'rocketleaguerank-21', site: 'Amazon.co.uk', domain: 'webservices.amazon.co.uk', country_code: 'UK' };
      break;
    case 'ES':
      amazonAffiliate = { id: 'rocketleaguerankes-21', site: 'Amazon.es', domain: 'webservices.amazon.es', country_code: 'ES' };
      break;
    case 'PT':
      amazonAffiliate = { id: 'rocketleaguerankes-21', site: 'Amazon.es', domain: 'webservices.amazon.es', country_code: 'ES' };
      break;
    case 'IT':
      amazonAffiliate = { id: 'rocketleaguerankit-21', site: 'Amazon.it', domain: 'webservices.amazon.it', country_code: 'IT' };
      break;
    default:
      amazonAffiliate = { id: 'rocketleaguerank-20', site: 'Amazon.com', domain: 'webservices.amazon.com', country_code: 'US' };
      break;
  }

  res.locals.amazon = amazonAffiliate;

  res.locals.amazon.client = amazon.createClient({
    awsId: 'AKIAJ3Z36PLOH4GGSO3A',
    awsSecret: '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',
    awsTag: amazonAffiliate.id
  });

  next();
}

function getProduct(req, res)
{
  db.findOneWhere('amazon', {code: req.params.code, type: 'product'}, {}, function(err, doc) {
    if (err)
    {
      swiftping.logger('error', 'amazon', 'Error retrieving product ASINs from DB', {code: code, mongoError: err});
      res.status(500).send({code: 'server_error', msg: 'There was an error.'});
    }

    if (!doc || doc.length === 0)
    {
      return res.status(404).send({code: 'not_found', msg: 'Code not found.'});
    }

    var client = res.locals.amazon.client;
    client.itemLookup({
      idType: 'ASIN',
      itemId: doc.asin[res.locals.amazon.country_code],
      responseGroup: 'ItemAttributes,Images,OfferSummary',
      domain: res.locals.amazon.domain
    }).then(function(results){
      var product = results[0];
      res.send({
        name: product.ItemAttributes[0].Title[0],
        image: product.LargeImage[0].URL[0].replace('http://ecx.images-amazon.com', 'https://images-na.ssl-images-amazon.com'),
        images: product.ImageSets[0].ImageSet.map(function(imageSet) { return imageSet.LargeImage[0].URL[0].replace('http://ecx.images-amazon.com', 'https://images-na.ssl-images-amazon.com'); }),
        link: '/amazon/redirect/' + product.ASIN[0] + '/product',
        price: product.OfferSummary[0].LowestNewPrice[0].FormattedPrice[0],
        source: res.locals.amazon.site
      });
    }).catch(function(err){
      swiftping.logger('error', 'amazon', 'Error looking up item.', err);
      res.status(500).send({code: 'server_error', msg: 'Error connecting to Amazon servers.'});
    });
  });
}

function getBanner(req, res)
{
  db.findOneWhere('amazon', {code: req.params.code, type: 'banner'}, {}, function(err, doc) {
    if (err)
    {
      swiftping.logger('error', 'amazon', 'Error retrieving banners from DB', {code: code, mongoError: err});
      return res.status(500).send({code: 'server_error', msg: 'There was an error.'});
    }

    if (!doc || doc.length === 0)
    {
      return res.status(404).send({code: 'not_found', msg: 'Code not found.'});
    }

    res.send({
      link: '/amazon/redirect/' + req.params.code + '/banner',
      image: doc.images[res.locals.amazon.country_code],
      title: doc.titles[res.locals.amazon.country_code]
    });
  });
}

function getRedirectUrl(req, res)
{
  if (req.params.type == 'banner')
  {
    db.findOneWhere('amazon', {code: req.params.code, type: 'banner'}, {}, function(err, doc) {
      if (err)
      {
        swiftping.logger('error', 'amazon', 'Error retrieving banners from DB', {code: code, mongoError: err});
        return res.status(500).send({code: 'server_error', msg: 'There was an error.'});
      }

      if (!doc || doc.length === 0)
      {
        return res.status(404).send({code: 'not_found', msg: 'Code not found.'});
      }

      res.send(doc.links[res.locals.amazon.country_code]);
    });
  }
  else if (req.params.type == 'product')
  {
    var client = res.locals.amazon.client;

    client.itemLookup({
      idType: 'ASIN',
      itemId: req.params.code,
      responseGroup: '',
      domain: res.locals.amazon.domain
    }).then(function(results){
      swiftping.logger('info', 'amazon', 'Redirecting to Amazon!', results[0].DetailPageURL[0]);
      res.send(results[0].DetailPageURL[0]);
    }).catch(function(err){
      swiftping.logger('critical', 'amazon', 'Could not redirect to Amazon', err);
      res.status(500).send('/');
    });
  }
}
