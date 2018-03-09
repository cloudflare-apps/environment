(function () {
  'use strict'

  CloudflareApps.matchPage = function matchPage (patterns) {
    if (!patterns || !patterns.length) {
      return true
    }

    var loc = document.location.host + document.location.pathname
    if (window.CloudflareApps && CloudflareApps.proxy && CloudflareApps.proxy.originalURL) {
      var url = CloudflareApps.proxy.originalURL.parsed
      loc = url.host + url.path
    }

    for (var i = 0; i < patterns.length; i++) {
      var re = new RegExp(patterns[i], 'i')

      if (re.test(loc)) {
        return true
      }
    }

    return false
  }
}())
