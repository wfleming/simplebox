import jQuery from "jquery"
import fancybox from "fancybox"
import fancyboxThumbs from "fancybox/dist/helpers/js/jquery.fancybox-thumbs.cjs.js"

window.jQuery = window.$ = jQuery
fancybox(window.jQuery)
fancyboxThumbs(window.jQuery)

$('[data-fancybox]').fancybox({
  transitionIn: 'elastic',
  transitionOut: 'elastic',
  speedIn:  200,
  speedOut:  200,
  overlayColor: '#fff',
  overlayOpacity: '0.9',
  padding: 0,
  helpers:  {
    title: { type: 'over', position: 'bottom' },
    // thumbs: { width: 100, height: 100 },
  },
})
