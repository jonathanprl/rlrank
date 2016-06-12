var amazon = require('amazon-product-api');
var swiftping = require('../helpers/swiftping');

var client = amazon.createClient({
  awsId: 'AKIAJ3Z36PLOH4GGSO3A',
  awsSecret: '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',
  awsTag: 'rocketleaguerank-20'
});

module.exports = {
  getProduct,
  getRedirectUrl
};

function getProduct(req, res)
{
  client.itemLookup({
    idType: 'ASIN',
    itemId: req.params.asin,
    responseGroup: 'ItemAttributes,Images,OfferSummary'
  }).then(function(results){
    var product = results[0];
    res.send({
      name: product.ItemAttributes[0].Title[0],
      image: product.LargeImage[0].URL[0],
      images: product.ImageSets[0].ImageSet.map(function(imageSet) { return imageSet.LargeImage[0].URL[0]; }),
      link: '/amazon/redirect/' + product.ASIN[0],
      price: product.OfferSummary[0].LowestNewPrice[0].FormattedPrice[0],
      source: 'Amazon.com'
    });
  }).catch(function(err){
    swiftping.logger('error', 'amazon', 'Error looking up item.', err);
    res.status(500).send({code: 'server_error', msg: 'Error connecting to Amazon servers.'});
  });
}

function getRedirectUrl(req, res)
{
  client.itemLookup({
    idType: 'ASIN',
    itemId: req.params.asin,
    responseGroup: ''
  }).then(function(results){
    swiftping.logger('info', 'amazon', 'Redirecting to Amazon!', results[0].DetailPageURL[0]);
    res.send(results[0].DetailPageURL[0]);
  }).catch(function(err){
    swiftping.logger('critical', 'amazon', 'Could not redirect to Amazon', err);
    res.status(500).send({code: 'server_error', msg: 'Error connecting to Amazon servers.'});
  });
}
