/**
* Original script is created by Lunametrics
* https://www.lunametrics.com/labs/recipes/utmz-cookie-replicator-for-gtm/
* Modified by Analytics Mania https://www.analyticsmania.com/
*
* Data is stored in the __initialTrafficSource cookie in the following format; brackets
* indicate optional data and are aexcluded from the stored string:
*
* utmcsr=SOURCE|utmcmd=MEDIUM[|utmccn=CAMPAIGN][|utmcct=CONTENT]
* [|utmctr=TERM/KEYWORD]
*
* e.g.:
* utmcsr=example.com|utmcmd=affl-link|utmccn=foo|utmcct=bar|utmctr=biz
*/
(function(document) {

  var referrer = document.referrer;
  var gaReferral = {
    'utmcsr': '(direct)',
    'utmcmd': '(none)',
    'utmccn': '(not set)'
  };
  var thisHostname = document.location.hostname;
  var thisDomain = getDomain_(thisHostname);
  var referringDomain = getDomain_(document.referrer);
  var sessionCookie = getCookie_('__utmzzses');
  var cookieExpiration = new Date(+new Date() + 1000 * 60 * 60 * 24 * 30 * 24);
  var qs = document.location.search.replace('?', '');
  var hash = document.location.hash.replace('#', '');
  var gaOrFbParams = parseGoogleOrFbParams(qs + '#' + hash);
  var referringInfo = parseGaReferrer(referrer);
  var storedVals = getCookie_('__utmz') || getCookie_('__utmzz');
  var newCookieVals = [];
  var keyMap = {
    'utm_source': 'utmcsr',
    'utm_medium': 'utmcmd',
    'utm_campaign': 'utmccn',
    'utm_content': 'utmcct',
    'utm_term': 'utmctr',
    'gclid': 'utmgclid',
    'dclid': 'utmdclid',
    'fbclid': 'utmfbclid'
  };

  var keyFilter = ['utmcsr', 'utmcmd', 'utmccn', 'utmcct', 'utmctr'];
  var keyName,
     values,
    _val,
    _key,
    raw,
    key,
    len,
    i;

  if (sessionCookie && referringDomain === thisDomain) {

    gaOrFbParams = null;
    referringInfo = null;

  }

  if (gaOrFbParams && (gaOrFbParams.utm_source || gaOrFbParams.gclid || gaOrFbParams.dclid || gaOrFbParams.fbclid)) {

    for (key in gaOrFbParams) {

      if (typeof gaOrFbParams[key] !== 'undefined') {

        keyName = keyMap[key];
        gaReferral[keyName] = gaOrFbParams[key];

      }

    }

   if (gaOrFbParams.gclid || gaOrFbParams.dclid) {

    gaReferral.utmcsr = '(google)';
    gaReferral.utmcmd = gaReferral.utmgclid ? '(cpc)' : '(cpm)';

   }

   else if (gaOrFbParams.fbclid) {

     gaReferral.utmcsr = '(facebook)';
     gaReferral.utmcmd = '(ppc)';

   }

  } else if (referringInfo) {

    gaReferral.utmcsr = '(' + referringInfo.source + ')';
    gaReferral.utmcmd = '(' + referringInfo.medium + ')';
    if (referringInfo.term) gaReferral.utmctr = '(' + referringInfo.term + ')';

  } else if (storedVals) {

    values = {};
    raw = storedVals.split('|');
    len = raw.length;

    for (i = 0; i < len; i++) {

      _val = raw[i].split('=');
      _key = _val[0].split('.').pop();
      values[_key] = _val[1];

    }

    gaReferral = values;

  }

  for (key in gaReferral) {

    if (typeof gaReferral[key] !== 'undefined' && keyFilter.indexOf(key) >-1) {

      newCookieVals.push(key + '=' + gaReferral[key]);

    }

  }
  
  if (!getCookie_('initialTrafficSource')) {
    writeCookie_('initialTrafficSource', newCookieVals.join('|'), cookieExpiration, '/', thisDomain);
  }

  writeCookie_('__utmzzses', 1, null, '/', thisDomain);

  function parseGoogleOrFbParams(str) {

    var campaignParams = ['source', 'medium', 'campaign', 'term', 'content'];
    var regex = new RegExp('(utm_(' + campaignParams.join('|') + ')|(d|g|fb)clid)=.*?([^&#]*|$)', 'gi');
    var gaOrFbParams = str.match(regex);
    var paramsObj,
      vals,
      len,
      i;

    if (gaOrFbParams) {

      paramsObj = {};
      len = gaOrFbParams.length;

      for (i = 0; i < len; i++) {

        vals = gaOrFbParams[i].split('=');

        if (vals) {

          paramsObj[vals[0]] = vals[1];

        }

       }

     }

     return paramsObj;
   }

  function parseGaReferrer(referrer) {

    if (!referrer) return;

    var searchEngines = {
      'daum.net': {
        'p': 'q',
        'n': 'daum'
      },
      'eniro.se': {
        'p': 'search_word',
        'n': 'eniro '
       },
      'naver.com': {
        'p': 'query',
        'n': 'naver '
      },
      'yahoo.com': {
        'p': 'p',
        'n': 'yahoo'
      },
      'msn.com': {
        'p': 'q',
        'n': 'msn'
      },
      'bing.com': {
        'p': 'q',
        'n': 'live'
      },
      'aol.com': {
        'p': 'q',
        'n': 'aol'
      },
      'lycos.com': {
        'p': 'q',
        'n': 'lycos'
      },
      'ask.com': {
        'p': 'q',
        'n': 'ask'
      },
      'altavista.com': {
        'p': 'q',
        'n': 'altavista'
      },
      'search.netscape.com': {
        'p': 'query',
        'n': 'netscape'
      },
      'cnn.com': {
        'p': 'query',
        'n': 'cnn'
      },
      'about.com': {
        'p': 'terms',
        'n': 'about'
      },
      'mamma.com': {
        'p': 'query',
        'n': 'mama'
      },
      'alltheweb.com': {
        'p': 'q',
        'n': 'alltheweb'
      },
      'voila.fr': {
        'p': 'rdata',
        'n': 'voila'
      },
      'search.virgilio.it': {
        'p': 'qs',
        'n': 'virgilio'
      },
      'baidu.com': {
        'p': 'wd',
        'n': 'baidu'
      },
      'alice.com': {
        'p': 'qs',
        'n': 'alice'
      },
      'yandex.com': {
        'p': 'text',
        'n': 'yandex'
      },
      'najdi.org.mk': {
        'p': 'q',
        'n': 'najdi'
      },
      'seznam.cz': {
        'p': 'q',
        'n': 'seznam'
      },
      'search.com': {
        'p': 'q',
        'n': 'search'
      },
      'wp.pl': {
        'p': 'szukaj ',
        'n': 'wirtulana polska'
      },
      'online.onetcenter.org': {
        'p': 'qt',
        'n': 'o*net'
      },
      'szukacz.pl': {
        'p': 'q',
        'n': 'szukacz'
      },
      'yam.com': {
        'p': 'k',
        'n': 'yam'
      },
      'pchome.com': {
        'p': 'q',
        'n': 'pchome'
      },
      'kvasir.no': {
        'p': 'q',
        'n': 'kvasir'
      },
      'sesam.no': {
        'p': 'q',
        'n': 'sesam'
      },
      'ozu.es': {
        'p': 'q',
        'n': 'ozu '
      },
      'terra.com': {
        'p': 'query',
        'n': 'terra'
      },
      'mynet.com': {
        'p': 'q',
        'n': 'mynet'
      },
     'ekolay.net': {
        'p': 'q',
        'n': 'ekolay'
     },
     'rambler.ru': {
       'p': 'words',
       'n': 'rambler'
     },
     'google': {
       'p': 'q',
       'n': 'google'
     }
   };
   var a = document.createElement('a');
   var values = {};
   var searchEngine,
     termRegex,
     term;

   a.href = referrer;

   // Shim for the billion google search engines
   if (a.hostname.indexOf('google') > -1) {

    referringDomain = 'google';

   }

  if (searchEngines[referringDomain]) {

    searchEngine = searchEngines[referringDomain];
    termRegex = new RegExp(searchEngine.p + '=.*?([^&#]*|$)', 'gi');
    term = a.search.match(termRegex);

    values.source = searchEngine.n;
    values.medium = 'organic';

    values.term = (term ? term[0].split('=')[1] : '') || '(not provided)';

  } else if (referringDomain !== thisDomain) {

    values.source = a.hostname;
    values.medium = 'referral';

  }

   return values;

  }

function writeCookie_(name, value, expiration, path, domain) {

    var str = name + '=' + value + ';';
    if (expiration) str += 'Expires=' + expiration.toGMTString() + ';';
    if (path) str += 'Path=' + path + ';';
    if (domain) str += 'Domain=' + domain + ';';

    document.cookie = str;

}

function getCookie_(name) {

  var cookies = '; ' + document.cookie
  var cvals = cookies.split('; ' + name + '=');

  if (cvals.length > 1) return cvals.pop().split(';')[0];

}

function getDomain_(url) {

  if (!url) return;

  var a = document.createElement('a');
  a.href = url;

  try {

    return a.hostname.match(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/)[0];

  } catch(squelch) {}

 }

})(document);
