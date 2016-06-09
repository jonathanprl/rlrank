/**
 * ngAdsense AngularJS module for Google AdSense advertisements.
 * @author Peter Szrnka (szrnka.peter@gmail.com)
 * @version 1.2
 */
var ngAdSense = angular.module('spAdsense', []);
ngAdSense.constant('SCRIPT_URL', '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
/**
 * This directive is necessary for keeping track of Google Ads <script> creation.
 * Creating it twice will result in ads returning a 400 error
 * @directive
 * @since 1.1
 */
ngAdSense.service('AdsenseTracker', [function()
{
    this.isLoaded = false;
    this.mobileAd = false;
}]);
/**
 * This controller is necessary for handling the DOM manipulation.
 * @controller
 * @since 1.0
 */
ngAdSense.controller('AdsenseController', ['SCRIPT_URL', 'AdsenseTracker', function(SCRIPT_URL, AdsenseTracker) {

    if (AdsenseTracker.isLoaded)
    {
      $('script[src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]').remove();
    }

    if (AdsenseTracker.mobileAd == false)
    {
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: 'ca-pub-6993069428952088',
        enable_page_level_ads: true
      });
      AdsenseTracker.mobileAd = true;
    }

    var s = document.createElement('script');
    s.src = SCRIPT_URL;
    document.body.appendChild(s);
    AdsenseTracker.isLoaded = true;

    (window.adsbygoogle = window.adsbygoogle || []).push({});
}]);
/**
 * @directive adsenseDirective
 * @cfg adClient AdSense Client id. (Mandatory field)
 * @cfg adSlot AdSense Slot id. (Mandatory field)
 * @cfg cssStyle CSS customization generated by AdSense website. (Mandatory field)
 */
ngAdSense.directive('adsenseDirective', function() {
    return {
        restrict : 'E',
        replace : true,
        template : '<div><ins class="adsbygoogle" style="{{cssStyle}}" data-ad-client="{{adClient}}" data-ad-slot="{{adSlot}}" data-ad-format="{{adFormat}}"></ins></div>',
        scope : {
            adClient : '@',
            adSlot : '@',
            adFormat : '@',
            cssStyle : '@'
        },
        controller : 'AdsenseController'
    };
});
