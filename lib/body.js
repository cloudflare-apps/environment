(function () {
  'use strict'

  window.parent.postMessage({
    type: 'cfapps-preview:body-loaded',
    url: document.location.toString()
  }, '*')
}())
