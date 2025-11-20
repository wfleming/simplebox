# SimpleBox

A zero-dependency, lightweight lightbox targeting modern browsers. Intended as a straightforward
replacement for old [fancybox][fancybox] usage.

[fancybox]: https://www.npmjs.com/package/fancybox

## Installation

`npm install --save-dev wfleming/simplebox`

## Usage

```index.html
<!-- SimpleBox attaches click handlers to items matching a selector ([data-simplebox] by default). -->
<a href="orig.jpg" data-simplebox><img src="thumb.jpg" /></a>

<!-- Items can be in a group so multiple items can be navigated in the same lightbox. Several
attributes are supported by default, but any given group should use the same attr for all items. -->
<a href="orig.jpg" data-simplebox="group-2"><img src="thumb.jpg" /></a>
<a href="orig.jpg" data-fancybox="group-3"><img src="thumb.jpg" /></a>
<a href="orig.jpg" rel="group-3"><img src="thumb.jpg" /></a>
```

```your_bundle.js
import {SimpleBox} from "@wfleming/simplebox"
SimpleBox()  // optionally can pass config like SimpleBox({selector: '[data-fancybox]', showThumbs: false})
```

```your_bundle.css
@import "@wfleming/simplebox/dist/styles.css";
```

### jQuery FancyBox interoperability

SimpleBox's default selector is `[data-simplebox]`, if you have legacy usage of fancybox, you can
initialize SimpleBox with `{selector: '[data-fancybox']}` to get mostly compatible behavior.

### Customizing / Configuring

Primary customization points are via options passed to the configuration of `SimpleBox()` and via
css variables. See source for details: config options are in `lib/index.mjs` defined under
`DEFAULT_CONFIG`, and overridable CSS variables are at the top of `lib/styles.css`.
