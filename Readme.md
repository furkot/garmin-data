[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][gemnasium-image]][gemnasium-url]

# furkot-garmin-data

Data used by [Furkot] modules dealing with Garmin GPX format.

## Install

```sh
$ npm install --save furkot-garmin-data
```

## Usage

Furkot pin symbols are characters in [furkot-icon-font] - see [here][furkot-icon-font-demo].

```js
var data = require('furkot-garmin-data');

console.log(data.toFurkot['Church']);  // === 34
console.log(data.toGarmin['34']);      // === 'Church'

```

## License

MIT © [Damian Krzeminski](https://code42day.com)

[Furkot]: https://furkot.com
[furkot-icon-font]: https://github.com/furkot/icon-fonts
[furkot-icon-font-demo]: https://furkot.github.io/icon-fonts/build/furkot.html

[npm-image]: https://img.shields.io/npm/v/furkot-garmin-data.svg
[npm-url]: https://npmjs.org/package/furkot-garmin-data

[travis-url]: https://travis-ci.org/furkot/garmin-data
[travis-image]: https://img.shields.io/travis/furkot/garmin-data.svg

[gemnasium-image]: https://img.shields.io/gemnasium/furkot/garmin-data.svg
[gemnasium-url]: https://gemnasium.com/furkot/garmin-data
