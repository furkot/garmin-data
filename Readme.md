[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# @furkot/garmin-data

Data used by [Furkot] modules dealing with Garmin GPX format.

## Install

```sh
$ npm install --save @furkot/garmin-data
```

## Usage

Furkot pin symbols are characters in [furkot-icon-font] - see [here][furkot-icon-font-demo].

```js
import data from '@furkot/garmin-data';

console.log(data.toFurkot['Church']);  // === 34
console.log(data.toGarmin['34']);      // === 'Church'

```

## License

MIT © [Damian Krzeminski](https://code42day.com)

[Furkot]: https://furkot.com
[furkot-icon-font]: https://github.com/furkot/icon-fonts
[furkot-icon-font-demo]: https://furkot.github.io/icon-fonts/build/furkot.html

[npm-image]: https://img.shields.io/npm/v/@furkot/garmin-data
[npm-url]: https://npmjs.org/package/@furkot/garmin-data

[build-url]: https://github.com/furkot/garmin-data/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/furkot/garmin-data/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/@furkot/garmin-data
[deps-url]: https://libraries.io/npm/@furkot%2Fgarmin-data
