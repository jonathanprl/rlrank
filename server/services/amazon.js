var amazon = require('amazon-product-api');
var maxmind = require('maxmind');
var path = require('path');

var swiftping = require('../helpers/swiftping');

module.exports = {
  getClient,
  getProduct,
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
      amazonAffiliate = { id: 'rocketleaguerank-21', site: 'Amazon.co.uk', asin: 'B01649J65K', domain: 'webservices.amazon.co.uk' };
      break;
    case 'FR':
      amazonAffiliate = { id: 'rocketleaguerankfr-21', site: 'Amazon.fr', asin: 'B01649J65K', domain: 'webservices.amazon.fr' };
      break;
    case 'DE':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', asin: 'B01649J65K', domain: 'webservices.amazon.de' };
      break;
    case 'CH':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', asin: 'B01649J65K', domain: 'webservices.amazon.de' };
      break;
    case 'CA':
      amazonAffiliate = { id: 'rocketleaguerankca-20', site: 'Amazon.ca', asin: 'B015WKY3IM', domain: 'webservices.amazon.ca' };
      break;
    case 'NL':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', asin: 'B01649J65K', domain: 'webservices.amazon.de' };
      break;
    case 'FI':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', asin: 'B01649J65K', domain: 'webservices.amazon.de' };
      break;
    case 'NO':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', asin: 'B01649J65K', domain: 'webservices.amazon.de' };
      break;
    case 'BE':
      amazonAffiliate = { id: 'rocketleaguerankfr-21', site: 'Amazon.fr', asin: 'B01649J65K', domain: 'webservices.amazon.fr' };
      break;
    case 'SE':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', asin: 'B01649J65K', domain: 'webservices.amazon.de' };
      break;
    case 'PL':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', asin: 'B01649J65K', domain: 'webservices.amazon.de' };
      break;
    case 'DK':
      amazonAffiliate = { id: 'rocketleaguerankde-21', site: 'Amazon.de', asin: 'B01649J65K', domain: 'webservices.amazon.de' };
      break;
    case 'IE':
      amazonAffiliate = { id: 'rocketleaguerank-21', site: 'Amazon.co.uk', asin: 'B01649J65K', domain: 'webservices.amazon.co.uk' };
      break;
    case 'ES':
      amazonAffiliate = { id: 'rocketleaguerankes-21', site: 'Amazon.es', asin: 'B01649J65K', domain: 'webservices.amazon.es' };
      break;
    case 'PT':
      amazonAffiliate = { id: 'rocketleaguerankes-21', site: 'Amazon.es', asin: 'B01649J65K', domain: 'webservices.amazon.es' };
      break;
    case 'IT':
      amazonAffiliate = { id: 'rocketleaguerankit-21', site: 'Amazon.it', asin: 'B01649J65K', domain: 'webservices.amazon.it' };
      break;
    default:
      amazonAffiliate = { id: 'rocketleaguerank-20', site: 'Amazon.com', asin: 'B015WKY3IM', domain: 'webservices.amazon.com' };
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
  var client = res.locals.amazon.client;
  client.itemLookup({
    idType: 'ASIN',
    itemId: res.locals.amazon.asin,
    responseGroup: 'ItemAttributes,Images,OfferSummary',
    domain: res.locals.amazon.domain
  }).then(function(results){
    var product = results[0];
    res.send({
      name: product.ItemAttributes[0].Title[0],
      image: product.LargeImage[0].URL[0].replace('http://ecx.images-amazon.com', 'https://images-na.ssl-images-amazon.com'),
      images: product.ImageSets[0].ImageSet.map(function(imageSet) { return imageSet.LargeImage[0].URL[0].replace('http://ecx.images-amazon.com', 'https://images-na.ssl-images-amazon.com'); }),
      link: '/amazon/redirect/' + product.ASIN[0],
      price: product.OfferSummary[0].LowestNewPrice[0].FormattedPrice[0],
      source: res.locals.amazon.site
    });
  }).catch(function(err){
    swiftping.logger('error', 'amazon', 'Error looking up item.', err);
    res.status(500).send({code: 'server_error', msg: 'Error connecting to Amazon servers.'});
  });
}

function getRedirectUrl(req, res)
{
  var client = res.locals.amazon.client;

  client.itemLookup({
    idType: 'ASIN',
    itemId: req.params.asin,
    responseGroup: '',
    domain: res.locals.amazon.domain
  }).then(function(results){
    swiftping.logger('info', 'amazon', 'Redirecting to Amazon!', results[0].DetailPageURL[0]);
    res.send(results[0].DetailPageURL[0]);
  }).catch(function(err){
    swiftping.logger('critical', 'amazon', 'Could not redirect to Amazon', err);
    res.status(500).send({code: 'server_error', msg: 'Error connecting to Amazon servers.'});
  });
}
