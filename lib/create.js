(function () {
  'use strict'

  var prevEls = {}

  CloudflareApps.createElement = function createElement (options, prevEl) {
    options = options || {}
    CloudflareApps.internal.markSelectors()

    try {
      if (prevEl && prevEl.parentNode) {
        var replacedEl

        if (prevEl.cfAppsElementId) {
          replacedEl = prevEls[prevEl.cfAppsElementId]
        }

        if (replacedEl) {
          prevEl.parentNode.replaceChild(replacedEl, prevEl)
          delete prevEls[prevEl.cfAppsElementId]
        } else {
          prevEl.parentNode.removeChild(prevEl)
        }
      }

      var element = document.createElement('cloudflare-app')
      var container

      if (options.pages && options.pages.URLPatterns && !CloudflareApps.matchPage(options.pages.URLPatterns)) {
        return element
      }

      try {
        container = CloudflareApps.querySelector(options.selector)
      } catch (e) {}

      if (!container) {
        return element
      }

      if (!container.parentNode && (options.method === 'after' || options.method === 'before' || options.method === 'replace')) {
        return element
      }

      if (container === document.body) {
        if (options.method === 'after') {
          options.method = 'append'
        } else if (options.method === 'before') {
          options.method = 'prepend'
        }
      }

      switch (options.method) {
        case 'prepend':
          if (container.firstChild) {
            container.insertBefore(element, container.firstChild)
            break
          }
          // Falls through.
        case 'append':
          container.appendChild(element)
          break
        case 'after':
          if (container.nextSibling) {
            container.parentNode.insertBefore(element, container.nextSibling)
          } else {
            container.parentNode.appendChild(element)
          }
          break
        case 'before':
          container.parentNode.insertBefore(element, container)
          break
        case 'replace':
          try {
            var id = element.cfAppsElementId = Math.random().toString(36)
            prevEls[id] = container
          } catch (e) {}

          container.parentNode.replaceChild(element, container)
      }

      return element
    } catch (e) {
      if (typeof console !== 'undefined' && typeof console.error !== 'undefined') {
        console.error('Error creating Cloudflare Apps element', e)
      }
    }
  }
}())
