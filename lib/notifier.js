/* eslint no-eval: 0 */

(function () {
  'use strict'

  window.parent.postMessage({
    type: 'cfapps-preview:loaded',
    proxy: window.CloudflareApps && CloudflareApps.proxy,
    errors: window.CloudflareApps && CloudflareApps.errors
  }, '*')

  if (window.CloudflareApps && window.CloudflareApps.errors) {
    window.parent.postMessage({
      type: 'cfapps-preview:error',
      errors: CloudflareApps.errors
    }, '*')
  }

  function cloneNode (el) {
    // We can't use the native cloneNode as it won't reexecute script tags.
    var newEl = document.createElement(el.tagName)

    for (var i = el.attributes.length; i--;) {
      var attr = el.attributes[i]

      if (attr.specified) {
        newEl.setAttribute(attr.name, attr.value)
      }
    }

    newEl.innerHTML = el.innerHTML

    return newEl
  }

  var lastUrl = null
  function updateUrl () {
    var url = document.location.toString()

    if (url === lastUrl) { return }

    lastUrl = url

    window.parent.postMessage({
      type: 'cfapps-preview:change:location',
      url: url
    }, '*')
  }

  updateUrl()

  window.addEventListener('popstate', updateUrl)

  // We also poll because calls to pushState/replaceState don't trigger popstate
  // events.
  setInterval(updateUrl, 500)

  window.addEventListener('message', function (e) {
    if (!e.data) return

    if (e.data.type === 'cfapps-preview:change:config') {
      window.location.reload()
    }

    if (e.data.type === 'cfapps-preview:reload') {
      window.location.reload()
    }

    if (e.data.type === 'cfapps-preview:inject') {
      var done = function () {
        window.parent.postMessage({
          type: 'cfapps-preview:injected',
          content: e.data
        }, '*')
      }

      var el

      if (e.data.contentType === 'text/html') {
        el = document.createElement('div')
        el.innerHTML = e.data.content
        document.body.appendChild(el)

        var remaining = 0

        // Script tags are not executed when inserting HTML
        var scripts = el.querySelectorAll('script')
        for (var i = 0; i < scripts.length; i++) {
          if (scripts[i].getAttribute('src')) {
            var node = cloneNode(scripts[i])
            remaining++
            node.onload = function onload () {
              remaining--
              if (remaining === 0) {
                done()
              }
            }

            document.body.appendChild(node)
          } else {
            eval(scripts[i].innerHTML)
          }
        }

        if (remaining === 0) {
          done()
        }
      } else if (e.data.contentType === 'text/css') {
        if (e.data.src) {
          el = document.createElement('link')
          el.onload = done
          el.setAttribute('rel', 'stylesheet')
          el.setAttribute('href', e.data.src)
        } else {
          el = document.createElement('style')
          el.innerHTML = e.data.content

          done()
        }

        document.head.appendChild(el)
      } else if (e.data.contentType === 'application/javascript') {
        if (e.data.src) {
          el = document.createElement('script')
          el.setAttribute('src', e.data.src)
          el.onload = done
          document.head.appendChild(el)
        } else {
          eval(e.data.content)
          done()
        }
      }
    }
  })
}())
