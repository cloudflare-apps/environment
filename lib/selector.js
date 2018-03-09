(function () {
  'use strict'

  CloudflareApps.internal = CloudflareApps.internal || {}

  var errors = []
  CloudflareApps.internal.placementErrors = errors

  var errorHashes = {}
  function noteError (options) {
    var hash = options.selector + '::' + options.type + '::' + (options.installId || '')
    if (errorHashes[hash]) { return }

    errorHashes[hash] = true
    errors.push(options)
  }

  var initializedSelectors = {}

  var currentInit = false
  CloudflareApps.internal.markSelectors = function markSelectors () {
    if (!currentInit) {
      check()
      currentInit = true
      setTimeout(function () {
        currentInit = false
      })
    }
  }

  function check () {
    var installs = window.CloudflareApps.installs

    for (var installId in installs) {
      if (!installs.hasOwnProperty(installId)) { continue }

      var selectors = installs[installId].selectors
      if (!selectors) { continue }

      for (var key in selectors) {
        if (!selectors.hasOwnProperty(key)) { continue }

        var hash = installId + '::' + key
        if (initializedSelectors[hash]) { continue }

        var els = document.querySelectorAll(selectors[key])
        if (els && els.length > 1) {
          noteError({
            type: 'init:too-many',
            option: key,
            selector: selectors[key],
            installId: installId
          })

          initializedSelectors[hash] = true

          continue
        } else if (!els || !els.length) {
          continue
        }

        initializedSelectors[hash] = true
        els[0].setAttribute('cfapps-selector', selectors[key])
      }
    }
  }

  CloudflareApps.querySelector = function querySelector (selector) {
    if (selector === 'body' || selector === 'head') {
      return document[selector]
    }

    CloudflareApps.internal.markSelectors()

    var els = document.querySelectorAll('[cfapps-selector="' + selector + '"]')

    if (!els || !els.length) {
      noteError({
        type: 'select:not-found:by-attribute',
        selector: selector
      })

      els = document.querySelectorAll(selector)
      if (!els || !els.length) {
        noteError({
          type: 'select:not-found:by-query',
          selector: selector
        })

        return null
      } else if (els.length > 1) {
        noteError({
          type: 'select:too-many:by-query',
          selector: selector
        })
      }

      return els[0]
    }

    if (els.length > 1) {
      noteError({
        type: 'select:too-many:by-attribute',
        selector: selector
      })
    }

    return els[0]
  }
}())
