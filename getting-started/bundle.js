require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var leafletExample = {};
var leafletExampleNoOverlay = {};

var mountLeafletMap = function(mountPointId) {
	leafletExample.leafletMap = L.map(mountPointId, {
		zoom: 5,
	}).setView([41.65, -72], 8);

	leafletExample.baseMap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
		maxZoom: 9,
		attribution: '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> contributors <a href="https://cartodb.com/attributions">© CartoDB</a>'
	}).addTo(leafletExample.leafletMap);

	leafletExample.lightning = L.tileLayer('https://api.wxtiles.com/wxtiles/tile/ncep-mrms-us-reflectivity/QCComposite/2016-07-17T22:00:39Z/0/{z}/{x}/{y}.png', {
		maxZoom: 9,
		tms: true
	}).addTo(leafletExample.leafletMap);
}

var mountLeafletMapNoOverlay = function(mountPointId) {
	leafletExampleNoOverlay.leafletMap = L.map(mountPointId, {
		zoom: 5
	}).setView([41.65, -72], 8);

	leafletExampleNoOverlay.baseMap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
		maxZoom: 9,
		attribution: '<a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> contributors <a href="https://cartodb.com/attributions">© CartoDB</a>'
	}).addTo(leafletExampleNoOverlay.leafletMap);
}

module.exports = {
	mountLeafletMap: mountLeafletMap,
	mountLeafletMapNoOverlay: mountLeafletMapNoOverlay
};
},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":2,"ieee754":6,"isarray":7}],5:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],6:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],7:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],8:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],9:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  root = this;
}

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pushEncodedKeyValuePair(pairs, key, obj[key]);
        }
      }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (Array.isArray(val)) {
    return val.forEach(function(v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  }
  pairs.push(encodeURIComponent(key)
    + '=' + encodeURIComponent(val));
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(new_err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Force given parser
 *
 * Sets the body parser no matter type.
 *
 * @param {Function}
 * @api public
 */

Request.prototype.parse = function(fn){
  this._parser = fn;
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(field, file, filename || file.name);
  return this;
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = 'download';
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var contentType = this.getHeader('Content-Type');
    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};

/**
 * Faux promise support
 *
 * @param {Function} fulfill
 * @param {Function} reject
 * @return {Request}
 */

Request.prototype.then = function (fulfill, reject) {
  return this.end(function(err, res) {
    err ? reject(err) : fulfill(res);
  });
}

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":5,"reduce":8}],10:[function(require,module,exports){
(function (Buffer){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 *
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['superagent'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('superagent'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.ApiClient = factory(root.superagent);
  }
}(this, function(superagent) {
  'use strict';

  /**
   * @module ApiClient
   * @version 3.0.0
   */

  /**
   * Manages low level client-server communications, parameter marshalling, etc. There should not be any need for an
   * application to use this class directly - the *Api and model classes provide the public API for the service. The
   * contents of this file should be regarded as internal but are documented for completeness.
   * @alias module:ApiClient
   * @class
   */
  var exports = function() {
    /**
     * The base URL against which to resolve every API call's (relative) path.
     * @type {String}
     * @default http://172.16.1.50/v1
     */
    this.basePath = 'http://172.16.1.50/v1'.replace(/\/+$/, '');

    /**
     * The authentication methods to be included for all API calls.
     * @type {Array.<String>}
     */
    this.authentications = {
      'apiKeyQuery': {type: 'apiKey', 'in': 'query', name: 'apikey'},
      'apiKeyHeader': {type: 'apiKey', 'in': 'header', name: 'apikey'}
    };
    /**
     * The default HTTP headers to be included for all API calls.
     * @type {Array.<String>}
     * @default {}
     */
    this.defaultHeaders = {};

    /**
     * The default HTTP timeout for all API calls.
     * @type {Number}
     * @default 60000
     */
    this.timeout = 60000;
  };

  /**
   * Returns a string representation for an actual parameter.
   * @param param The actual parameter.
   * @returns {String} The string representation of <code>param</code>.
   */
  exports.prototype.paramToString = function(param) {
    if (param == undefined || param == null) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }
    return param.toString();
  };

  /**
   * Builds full URL by appending the given path to the base URL and replacing path parameter place-holders with parameter values.
   * NOTE: query parameters are not handled here.
   * @param {String} path The path to append to the base URL.
   * @param {Object} pathParams The parameter values to append.
   * @returns {String} The encoded path with parameter values substituted.
   */
  exports.prototype.buildUrl = function(path, pathParams) {
    if (!path.match(/^\//)) {
      path = '/' + path;
    }
    var url = this.basePath + path;
    var _this = this;
    url = url.replace(/\{([\w-]+)\}/g, function(fullMatch, key) {
      var value;
      if (pathParams.hasOwnProperty(key)) {
        value = _this.paramToString(pathParams[key]);
      } else {
        value = fullMatch;
      }
      return encodeURIComponent(value);
    });
    return url;
  };

  /**
   * Checks whether the given content type represents JSON.<br>
   * JSON content type examples:<br>
   * <ul>
   * <li>application/json</li>
   * <li>application/json; charset=UTF8</li>
   * <li>APPLICATION/JSON</li>
   * </ul>
   * @param {String} contentType The MIME content type to check.
   * @returns {Boolean} <code>true</code> if <code>contentType</code> represents JSON, otherwise <code>false</code>.
   */
  exports.prototype.isJsonMime = function(contentType) {
    return Boolean(contentType != null && contentType.match(/^application\/json(;.*)?$/i));
  };

  /**
   * Chooses a content type from the given array, with JSON preferred; i.e. return JSON if included, otherwise return the first.
   * @param {Array.<String>} contentTypes
   * @returns {String} The chosen content type, preferring JSON.
   */
  exports.prototype.jsonPreferredMime = function(contentTypes) {
    for (var i = 0; i < contentTypes.length; i++) {
      if (this.isJsonMime(contentTypes[i])) {
        return contentTypes[i];
      }
    }
    return contentTypes[0];
  };

  /**
   * Checks whether the given parameter value represents file-like content.
   * @param param The parameter to check.
   * @returns {Boolean} <code>true</code> if <code>param</code> represents a file.
   */
  exports.prototype.isFileParam = function(param) {
    // fs.ReadStream in Node.js (but not in runtime like browserify)
    if (typeof window === 'undefined' &&
        typeof require === 'function' &&
        require('fs') &&
        param instanceof require('fs').ReadStream) {
      return true;
    }
    // Buffer in Node.js
    if (typeof Buffer === 'function' && param instanceof Buffer) {
      return true;
    }
    // Blob in browser
    if (typeof Blob === 'function' && param instanceof Blob) {
      return true;
    }
    // File in browser (it seems File object is also instance of Blob, but keep this for safe)
    if (typeof File === 'function' && param instanceof File) {
      return true;
    }
    return false;
  };

  /**
   * Normalizes parameter values:
   * <ul>
   * <li>remove nils</li>
   * <li>keep files and arrays</li>
   * <li>format to string with `paramToString` for other cases</li>
   * </ul>
   * @param {Object.<String, Object>} params The parameters as object properties.
   * @returns {Object.<String, Object>} normalized parameters.
   */
  exports.prototype.normalizeParams = function(params) {
    var newParams = {};
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
        var value = params[key];
        if (this.isFileParam(value) || Array.isArray(value)) {
          newParams[key] = value;
        } else {
          newParams[key] = this.paramToString(value);
        }
      }
    }
    return newParams;
  };

  /**
   * Enumeration of collection format separator strategies.
   * @enum {String}
   * @readonly
   */
  exports.CollectionFormatEnum = {
    /**
     * Comma-separated values. Value: <code>csv</code>
     * @const
     */
    CSV: ',',
    /**
     * Space-separated values. Value: <code>ssv</code>
     * @const
     */
    SSV: ' ',
    /**
     * Tab-separated values. Value: <code>tsv</code>
     * @const
     */
    TSV: '\t',
    /**
     * Pipe(|)-separated values. Value: <code>pipes</code>
     * @const
     */
    PIPES: '|',
    /**
     * Native array. Value: <code>multi</code>
     * @const
     */
    MULTI: 'multi'
  };

  /**
   * Builds a string representation of an array-type actual parameter, according to the given collection format.
   * @param {Array} param An array parameter.
   * @param {module:ApiClient.CollectionFormatEnum} collectionFormat The array element separator strategy.
   * @returns {String|Array} A string representation of the supplied collection, using the specified delimiter. Returns
   * <code>param</code> as is if <code>collectionFormat</code> is <code>multi</code>.
   */
  exports.prototype.buildCollectionParam = function buildCollectionParam(param, collectionFormat) {
    if (param == null) {
      return null;
    }
    switch (collectionFormat) {
      case 'csv':
        return param.map(this.paramToString).join(',');
      case 'ssv':
        return param.map(this.paramToString).join(' ');
      case 'tsv':
        return param.map(this.paramToString).join('\t');
      case 'pipes':
        return param.map(this.paramToString).join('|');
      case 'multi':
        // return the array directly as SuperAgent will handle it as expected
        return param.map(this.paramToString);
      default:
        throw new Error('Unknown collection format: ' + collectionFormat);
    }
  };

  /**
   * Applies authentication headers to the request.
   * @param {Object} request The request object created by a <code>superagent()</code> call.
   * @param {Array.<String>} authNames An array of authentication method names.
   */
  exports.prototype.applyAuthToRequest = function(request, authNames) {
    var _this = this;
    authNames.forEach(function(authName) {
      var auth = _this.authentications[authName];
      switch (auth.type) {
        case 'basic':
          if (auth.username || auth.password) {
            request.auth(auth.username || '', auth.password || '');
          }
          break;
        case 'apiKey':
          if (auth.apiKey) {
            var data = {};
            if (auth.apiKeyPrefix) {
              data[auth.name] = auth.apiKeyPrefix + ' ' + auth.apiKey;
            } else {
              data[auth.name] = auth.apiKey;
            }
            if (auth['in'] === 'header') {
              request.set(data);
            } else {
              request.query(data);
            }
          }
          break;
        case 'oauth2':
          if (auth.accessToken) {
            request.set({'Authorization': 'Bearer ' + auth.accessToken});
          }
          break;
        default:
          throw new Error('Unknown authentication type: ' + auth.type);
      }
    });
  };

  /**
   * Deserializes an HTTP response body into a value of the specified type.
   * @param {Object} response A SuperAgent response object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} returnType The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns A value of the specified type.
   */
  exports.prototype.deserialize = function deserialize(response, returnType) {
    if (response == null || returnType == null) {
      return null;
    }
    // Rely on SuperAgent for parsing response body.
    // See http://visionmedia.github.io/superagent/#parsing-response-bodies
    var data = response.body;
    if (data == null) {
      // SuperAgent does not always produce a body; use the unparsed response as a fallback
      data = response.text;
    }
    return exports.convertToType(data, returnType);
  };

  /**
   * Callback function to receive the result of the operation.
   * @callback module:ApiClient~callApiCallback
   * @param {String} error Error message, if any.
   * @param data The data returned by the service call.
   * @param {String} response The complete HTTP response.
   */

  /**
   * Invokes the REST service using the supplied settings and parameters.
   * @param {String} path The base URL to invoke.
   * @param {String} httpMethod The HTTP method to use.
   * @param {Object.<String, String>} pathParams A map of path parameters and their values.
   * @param {Object.<String, Object>} queryParams A map of query parameters and their values.
   * @param {Object.<String, Object>} headerParams A map of header parameters and their values.
   * @param {Object.<String, Object>} formParams A map of form parameters and their values.
   * @param {Object} bodyParam The value to pass as the request body.
   * @param {Array.<String>} authNames An array of authentication type names.
   * @param {Array.<String>} contentTypes An array of request MIME types.
   * @param {Array.<String>} accepts An array of acceptable response MIME types.
   * @param {(String|Array|ObjectFunction)} returnType The required type to return; can be a string for simple types or the
   * constructor for a complex type.
   * @param {module:ApiClient~callApiCallback} callback The callback function.
   * @returns {Object} The SuperAgent request object.
   */
  exports.prototype.callApi = function callApi(path, httpMethod, pathParams,
      queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts,
      returnType, callback) {

    var _this = this;
    var url = this.buildUrl(path, pathParams);
    var request = superagent(httpMethod, url);

    // apply authentications
    this.applyAuthToRequest(request, authNames);

    // set query parameters
    request.query(this.normalizeParams(queryParams));

    // set header parameters
    request.set(this.defaultHeaders).set(this.normalizeParams(headerParams));

    // set request timeout
    request.timeout(this.timeout);

    var contentType = this.jsonPreferredMime(contentTypes);
    if (contentType) {
      request.type(contentType);
    } else if (!request.header['Content-Type']) {
      request.type('application/json');
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      request.send(this.normalizeParams(formParams));
    } else if (contentType == 'multipart/form-data') {
      var _formParams = this.normalizeParams(formParams);
      for (var key in _formParams) {
        if (_formParams.hasOwnProperty(key)) {
          if (this.isFileParam(_formParams[key])) {
            // file field
            request.attach(key, _formParams[key]);
          } else {
            request.field(key, _formParams[key]);
          }
        }
      }
    } else if (bodyParam) {
      request.send(bodyParam);
    }

    var accept = this.jsonPreferredMime(accepts);
    if (accept) {
      request.accept(accept);
    }


    request.end(function(error, response) {
      if (callback) {
        var data = null;
        if (!error) {
          data = _this.deserialize(response, returnType);
        }
        callback(error, data, response);
      }
    });

    return request;
  };

  /**
   * Parses an ISO-8601 string representation of a date value.
   * @param {String} str The date value as a string.
   * @returns {Date} The parsed date object.
   */
  exports.parseDate = function(str) {
    return new Date(str.replace(/T/i, ' '));
  };

  /**
   * Converts a value to the specified type.
   * @param {(String|Object)} data The data to convert, as a string or object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} type The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns An instance of the specified type.
   */
  exports.convertToType = function(data, type) {
    switch (type) {
      case 'Boolean':
        return Boolean(data);
      case 'Integer':
        return parseInt(data, 10);
      case 'Number':
        return parseFloat(data);
      case 'String':
        return String(data);
      case 'Date':
        return this.parseDate(String(data));
      default:
        if (type === Object) {
          // generic object, return directly
          return data;
        } else if (typeof type === 'function') {
          // for model type like: User
          return type.constructFromObject(data);
        } else if (Array.isArray(type)) {
          // for array type like: ['String']
          var itemType = type[0];
          return data.map(function(item) {
            return exports.convertToType(item, itemType);
          });
        } else if (typeof type === 'object') {
          // for plain object type like: {'String': 'Integer'}
          var keyType, valueType;
          for (var k in type) {
            if (type.hasOwnProperty(k)) {
              keyType = k;
              valueType = type[k];
              break;
            }
          }
          var result = {};
          for (var k in data) {
            if (data.hasOwnProperty(k)) {
              var key = exports.convertToType(k, keyType);
              var value = exports.convertToType(data[k], valueType);
              result[key] = value;
            }
          }
          return result;
        } else {
          // for unknown type, return the data directly
          return data;
        }
    }
  };

  /**
   * Constructs a new map or array model from REST data.
   * @param data {Object|Array} The REST data.
   * @param obj {Object|Array} The target object or array.
   */
  exports.constructFromObject = function(data, obj, itemType) {
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        if (data.hasOwnProperty(i))
          obj[i] = exports.convertToType(data[i], itemType);
      }
    } else {
      for (var k in data) {
        if (data.hasOwnProperty(k))
          obj[k] = exports.convertToType(data[k], itemType);
      }
    }
  };

  /**
   * The default API client implementation.
   * @type {module:ApiClient}
   */
  exports.instance = new exports();

  return exports;
}));

}).call(this,require("buffer").Buffer)
},{"buffer":4,"fs":3,"superagent":9}],11:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Instance', 'model/Error', 'model/Levels', 'model/Times'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Instance'), require('../model/Error'), require('../model/Levels'), require('../model/Times'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.InstancesApi = factory(root.WxTiles.ApiClient, root.WxTiles.Instance, root.WxTiles.Error, root.WxTiles.Levels, root.WxTiles.Times);
  }
}(this, function(ApiClient, Instance, Error, Levels, Times) {
  'use strict';

  /**
   * Instances service.
   * @module api/InstancesApi
   * @version 3.0.0
   */

  /**
   * Constructs a new InstancesApi. 
   * @alias module:api/InstancesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getInstance operation.
     * @callback module:api/InstancesApi~getInstanceCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Instance} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Information about a particular (potentially non-persistant) instance of a layer
     * This endpoint provides information about an instance of a specific *WXTiles* layer that can be requested as map tiles. Instances are typically added and removed as the data underlying a dataset changes with time (e.g. forecasts expire, and forecast horizons continuously move forward). Therefore a particular instance of a layer may not be persistant.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} instanceId The id of the instance.
     * @param {module:api/InstancesApi~getInstanceCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Instance}
     */
    this.getInstance = function(ownerId, layerId, instanceId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getInstance";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getInstance";
      }

      // verify the required parameter 'instanceId' is set
      if (instanceId == undefined || instanceId == null) {
        throw "Missing the required parameter 'instanceId' when calling getInstance";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'instanceId': instanceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Instance;

      return this.apiClient.callApi(
        '/{ownerId}/layer/{layerId}/instance/{instanceId}/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getLevels operation.
     * @callback module:api/InstancesApi~getLevelsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Levels} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * A collection of vertical levels for which data exists and can be requested (as tiles) for an instance of a layer.
     * This endpoint exposes the array of vertical positions that data exists for a particular instance. Each element can be used to substitute the {level} part of a tile URL. Not all layer instances have a vertical (e.g. it may be surface wave height and therefore only apply at sea level). If a layer has no vertical dimension, the array will be empty.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} instanceId The id of the instance.
     * @param {module:api/InstancesApi~getLevelsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Levels}
     */
    this.getLevels = function(ownerId, layerId, instanceId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getLevels";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getLevels";
      }

      // verify the required parameter 'instanceId' is set
      if (instanceId == undefined || instanceId == null) {
        throw "Missing the required parameter 'instanceId' when calling getLevels";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'instanceId': instanceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Levels;

      return this.apiClient.callApi(
        '/{ownerId}/layer/{layerId}/instance/{instanceId}/levels/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getTimes operation.
     * @callback module:api/InstancesApi~getTimesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Times} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * A collection of moments in time for which data exists and can be requested (as tiles) for an instance of a layer.
     * This endpoint exposes the array of moments that data exists for a particular instance. Each element can be used to substitute the &lt;time&gt; part of a tile URL. Not all layer instances have a temporal dimension (e.g. it may be static bathymetry, or an observational dataset with no forecast or hindcast). If a layer has no temporal dimension, the array will be empty. The times in the array may not be unique (this is almost always due to grouped datasets containing overlapping time steps).
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} instanceId The id of the instance.
     * @param {module:api/InstancesApi~getTimesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Times}
     */
    this.getTimes = function(ownerId, layerId, instanceId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getTimes";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getTimes";
      }

      // verify the required parameter 'instanceId' is set
      if (instanceId == undefined || instanceId == null) {
        throw "Missing the required parameter 'instanceId' when calling getTimes";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'instanceId': instanceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Times;

      return this.apiClient.callApi(
        '/{ownerId}/layer/{layerId}/instance/{instanceId}/times/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/Error":21,"../model/Instance":22,"../model/Levels":28,"../model/Times":37}],12:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Error', 'model/Layer', 'model/Layers'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Error'), require('../model/Layer'), require('../model/Layers'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.LayersApi = factory(root.WxTiles.ApiClient, root.WxTiles.Error, root.WxTiles.Layer, root.WxTiles.Layers);
  }
}(this, function(ApiClient, Error, Layer, Layers) {
  'use strict';

  /**
   * Layers service.
   * @module api/LayersApi
   * @version 3.0.0
   */

  /**
   * Constructs a new LayersApi. 
   * @alias module:api/LayersApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getLayer operation.
     * @callback module:api/LayersApi~getLayerCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Layer} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Information about a specific layer
     * This endpoint provides information about a specific *WXTiles* layer that can be requested as map tiles, and its metadata, including bounding boxes and the unit system (metric, USCS, etc.) that is used when rendering map tiles.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {module:api/LayersApi~getLayerCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Layer}
     */
    this.getLayer = function(ownerId, layerId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getLayer";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getLayer";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Layer;

      return this.apiClient.callApi(
        '/{ownerId}/layer/{layerId}/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getLayers operation.
     * @callback module:api/LayersApi~getLayersCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Layers} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Information about available WXTiles layers
     * This endpoint returns information about all current *WXTiles* layers that can be requested, and metadata about map layers, including bounding boxes and the unit system (metric, USCS, etc.) that is used when rendering map tiles.
     * @param {String} ownerId The owner of the dataset.
     * @param {module:api/LayersApi~getLayersCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Layers}
     */
    this.getLayers = function(ownerId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getLayers";
      }


      var pathParams = {
        'ownerId': ownerId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Layers;

      return this.apiClient.callApi(
        '/{ownerId}/layer/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/Error":21,"../model/Layer":23,"../model/Layers":25}],13:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Error'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Error'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.LegendsApi = factory(root.WxTiles.ApiClient, root.WxTiles.Error);
  }
}(this, function(ApiClient, Error) {
  'use strict';

  /**
   * Legends service.
   * @module api/LegendsApi
   * @version 3.0.0
   */

  /**
   * Constructs a new LegendsApi. 
   * @alias module:api/LegendsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getJSONLegend operation.
     * @callback module:api/LegendsApi~getJSONLegendCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * JSON represention of a style as implemented by a particular layer. Can be used for rendering custom a legend.
     * Unlike image legends, the JSON representation of a style always exists.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} styleId The id of the style.
     * @param {module:api/LegendsApi~getJSONLegendCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getJSONLegend = function(ownerId, layerId, styleId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getJSONLegend";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getJSONLegend";
      }

      // verify the required parameter 'styleId' is set
      if (styleId == undefined || styleId == null) {
        throw "Missing the required parameter 'styleId' when calling getJSONLegend";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'styleId': styleId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/{ownerID}/legend/{layerId}/{styleId}.json', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getPNGLegend operation.
     * @callback module:api/LegendsApi~getPNGLegendCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * A legend for PNG map tiles
     * Available legends reflect the styles implemented by a layer. When a legend is disabled on a per-style basis (or if a legend cannot be rendered due to the style), then this endpoint will return a 204 No Content response. The size must be substituted by either &#x60;small&#x60; or &#x60;large&#x60;. The orientation must be substituted by either &#x60;horizontal&#x60; or &#x60;vertical&#x60;.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} styleId The id of the style.
     * @param {module:model/String} size The size.
     * @param {module:model/String} orientation The orientation.
     * @param {module:api/LegendsApi~getPNGLegendCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getPNGLegend = function(ownerId, layerId, styleId, size, orientation, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getPNGLegend";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getPNGLegend";
      }

      // verify the required parameter 'styleId' is set
      if (styleId == undefined || styleId == null) {
        throw "Missing the required parameter 'styleId' when calling getPNGLegend";
      }

      // verify the required parameter 'size' is set
      if (size == undefined || size == null) {
        throw "Missing the required parameter 'size' when calling getPNGLegend";
      }

      // verify the required parameter 'orientation' is set
      if (orientation == undefined || orientation == null) {
        throw "Missing the required parameter 'orientation' when calling getPNGLegend";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'styleId': styleId,
        'size': size,
        'orientation': orientation
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['image/png'];
      var returnType = null;

      return this.apiClient.callApi(
        '/{ownerId}/legend/{layerId}/{styleId}/{size}/{orientation}.png', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/Error":21}],14:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Levels', 'model/Error'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Levels'), require('../model/Error'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.LevelsApi = factory(root.WxTiles.ApiClient, root.WxTiles.Levels, root.WxTiles.Error);
  }
}(this, function(ApiClient, Levels, Error) {
  'use strict';

  /**
   * Levels service.
   * @module api/LevelsApi
   * @version 3.0.0
   */

  /**
   * Constructs a new LevelsApi. 
   * @alias module:api/LevelsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getLevels operation.
     * @callback module:api/LevelsApi~getLevelsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Levels} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * A collection of vertical levels for which data exists and can be requested (as tiles) for an instance of a layer.
     * This endpoint exposes the array of vertical positions that data exists for a particular instance. Each element can be used to substitute the {level} part of a tile URL. Not all layer instances have a vertical (e.g. it may be surface wave height and therefore only apply at sea level). If a layer has no vertical dimension, the array will be empty.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} instanceId The id of the instance.
     * @param {module:api/LevelsApi~getLevelsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Levels}
     */
    this.getLevels = function(ownerId, layerId, instanceId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getLevels";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getLevels";
      }

      // verify the required parameter 'instanceId' is set
      if (instanceId == undefined || instanceId == null) {
        throw "Missing the required parameter 'instanceId' when calling getLevels";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'instanceId': instanceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Levels;

      return this.apiClient.callApi(
        '/{ownerId}/layer/{layerId}/instance/{instanceId}/levels/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/Error":21,"../model/Levels":28}],15:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Error'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Error'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.StylesApi = factory(root.WxTiles.ApiClient, root.WxTiles.Error);
  }
}(this, function(ApiClient, Error) {
  'use strict';

  /**
   * Styles service.
   * @module api/StylesApi
   * @version 3.0.0
   */

  /**
   * Constructs a new StylesApi. 
   * @alias module:api/StylesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getJSONLegend operation.
     * @callback module:api/StylesApi~getJSONLegendCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * JSON represention of a style as implemented by a particular layer. Can be used for rendering custom a legend.
     * Unlike image legends, the JSON representation of a style always exists.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} styleId The id of the style.
     * @param {module:api/StylesApi~getJSONLegendCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getJSONLegend = function(ownerId, layerId, styleId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getJSONLegend";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getJSONLegend";
      }

      // verify the required parameter 'styleId' is set
      if (styleId == undefined || styleId == null) {
        throw "Missing the required parameter 'styleId' when calling getJSONLegend";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'styleId': styleId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/{ownerID}/legend/{layerId}/{styleId}.json', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getPNGLegend operation.
     * @callback module:api/StylesApi~getPNGLegendCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * A legend for PNG map tiles
     * Available legends reflect the styles implemented by a layer. When a legend is disabled on a per-style basis (or if a legend cannot be rendered due to the style), then this endpoint will return a 204 No Content response. The size must be substituted by either &#x60;small&#x60; or &#x60;large&#x60;. The orientation must be substituted by either &#x60;horizontal&#x60; or &#x60;vertical&#x60;.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} styleId The id of the style.
     * @param {module:model/String} size The size.
     * @param {module:model/String} orientation The orientation.
     * @param {module:api/StylesApi~getPNGLegendCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.getPNGLegend = function(ownerId, layerId, styleId, size, orientation, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getPNGLegend";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getPNGLegend";
      }

      // verify the required parameter 'styleId' is set
      if (styleId == undefined || styleId == null) {
        throw "Missing the required parameter 'styleId' when calling getPNGLegend";
      }

      // verify the required parameter 'size' is set
      if (size == undefined || size == null) {
        throw "Missing the required parameter 'size' when calling getPNGLegend";
      }

      // verify the required parameter 'orientation' is set
      if (orientation == undefined || orientation == null) {
        throw "Missing the required parameter 'orientation' when calling getPNGLegend";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'styleId': styleId,
        'size': size,
        'orientation': orientation
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['image/png'];
      var returnType = null;

      return this.apiClient.callApi(
        '/{ownerId}/legend/{layerId}/{styleId}/{size}/{orientation}.png', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/Error":21}],16:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Instance', 'model/Error', 'model/Layer', 'model/Layers', 'model/Levels', 'model/Times'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Instance'), require('../model/Error'), require('../model/Layer'), require('../model/Layers'), require('../model/Levels'), require('../model/Times'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.TilesApi = factory(root.WxTiles.ApiClient, root.WxTiles.Instance, root.WxTiles.Error, root.WxTiles.Layer, root.WxTiles.Layers, root.WxTiles.Levels, root.WxTiles.Times);
  }
}(this, function(ApiClient, Instance, Error, Layer, Layers, Levels, Times) {
  'use strict';

  /**
   * Tiles service.
   * @module api/TilesApi
   * @version 3.0.0
   */

  /**
   * Constructs a new TilesApi. 
   * @alias module:api/TilesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getInstance operation.
     * @callback module:api/TilesApi~getInstanceCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Instance} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Information about a particular (potentially non-persistant) instance of a layer
     * This endpoint provides information about an instance of a specific *WXTiles* layer that can be requested as map tiles. Instances are typically added and removed as the data underlying a dataset changes with time (e.g. forecasts expire, and forecast horizons continuously move forward). Therefore a particular instance of a layer may not be persistant.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} instanceId The id of the instance.
     * @param {module:api/TilesApi~getInstanceCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Instance}
     */
    this.getInstance = function(ownerId, layerId, instanceId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getInstance";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getInstance";
      }

      // verify the required parameter 'instanceId' is set
      if (instanceId == undefined || instanceId == null) {
        throw "Missing the required parameter 'instanceId' when calling getInstance";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'instanceId': instanceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Instance;

      return this.apiClient.callApi(
        '/{ownerId}/layer/{layerId}/instance/{instanceId}/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getLayer operation.
     * @callback module:api/TilesApi~getLayerCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Layer} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Information about a specific layer
     * This endpoint provides information about a specific *WXTiles* layer that can be requested as map tiles, and its metadata, including bounding boxes and the unit system (metric, USCS, etc.) that is used when rendering map tiles.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {module:api/TilesApi~getLayerCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Layer}
     */
    this.getLayer = function(ownerId, layerId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getLayer";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getLayer";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Layer;

      return this.apiClient.callApi(
        '/{ownerId}/layer/{layerId}/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getLayers operation.
     * @callback module:api/TilesApi~getLayersCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Layers} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Information about available WXTiles layers
     * This endpoint returns information about all current *WXTiles* layers that can be requested, and metadata about map layers, including bounding boxes and the unit system (metric, USCS, etc.) that is used when rendering map tiles.
     * @param {String} ownerId The owner of the dataset.
     * @param {module:api/TilesApi~getLayersCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Layers}
     */
    this.getLayers = function(ownerId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getLayers";
      }


      var pathParams = {
        'ownerId': ownerId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Layers;

      return this.apiClient.callApi(
        '/{ownerId}/layer/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getLevels operation.
     * @callback module:api/TilesApi~getLevelsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Levels} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * A collection of vertical levels for which data exists and can be requested (as tiles) for an instance of a layer.
     * This endpoint exposes the array of vertical positions that data exists for a particular instance. Each element can be used to substitute the {level} part of a tile URL. Not all layer instances have a vertical (e.g. it may be surface wave height and therefore only apply at sea level). If a layer has no vertical dimension, the array will be empty.
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} instanceId The id of the instance.
     * @param {module:api/TilesApi~getLevelsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Levels}
     */
    this.getLevels = function(ownerId, layerId, instanceId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getLevels";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getLevels";
      }

      // verify the required parameter 'instanceId' is set
      if (instanceId == undefined || instanceId == null) {
        throw "Missing the required parameter 'instanceId' when calling getLevels";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'instanceId': instanceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Levels;

      return this.apiClient.callApi(
        '/{ownerId}/layer/{layerId}/instance/{instanceId}/levels/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getTile operation.
     * @callback module:api/TilesApi~getTileCallback
     * @param {String} error Error message, if any.
     * @param {File} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * A tiled map image, for use by map clients capable of consuming PNG map images in OGC TMS coordinate notation.
     * WXTiles produces map tiles, and PNG map tiles are the traditional format for representing these. Other possibilities include protocol-buffer vector tiles in the Mapbox vector tile specification, and others. This endpoint will most often be used by map clients (such as Leaflet, Mapbox GL JS, OpenLayers, and Google Maps), which know exactly which tiles to request for a given geographical map view and zoom level. **The WXTiles Javascript API is responsible for completing the resource URI via these client libraries, based on what a user is authenticated to request, and what these layers support, via requests to other endpoints. Manual requests are possible but are not recommended.** The resources for a particular layer can be discovered through a &#x60;GET&#x60; request to &#x60;/layer/&lt;layerId&gt;/&#x60; and inspecting the response&#39;s &#x60;resources&#x60; property. The &#x60;/layer/&lt;layerId&gt;/&lt;instanceID&gt;/times/&#x60; endpoints can be used to request the times that are valid (many layer instances have only one time and/or vertical level).
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} styleId The id of the style.
     * @param {String} instanceId The id of the instance.
     * @param {Date} time The time.
     * @param {String} level The level.
     * @param {Integer} z The z.
     * @param {Integer} x The x.
     * @param {Integer} y The y.
     * @param {module:model/String} extension The extension.
     * @param {module:api/TilesApi~getTileCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link File}
     */
    this.getTile = function(ownerId, layerId, styleId, instanceId, time, level, z, x, y, extension, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getTile";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getTile";
      }

      // verify the required parameter 'styleId' is set
      if (styleId == undefined || styleId == null) {
        throw "Missing the required parameter 'styleId' when calling getTile";
      }

      // verify the required parameter 'instanceId' is set
      if (instanceId == undefined || instanceId == null) {
        throw "Missing the required parameter 'instanceId' when calling getTile";
      }

      // verify the required parameter 'time' is set
      if (time == undefined || time == null) {
        throw "Missing the required parameter 'time' when calling getTile";
      }

      // verify the required parameter 'level' is set
      if (level == undefined || level == null) {
        throw "Missing the required parameter 'level' when calling getTile";
      }

      // verify the required parameter 'z' is set
      if (z == undefined || z == null) {
        throw "Missing the required parameter 'z' when calling getTile";
      }

      // verify the required parameter 'x' is set
      if (x == undefined || x == null) {
        throw "Missing the required parameter 'x' when calling getTile";
      }

      // verify the required parameter 'y' is set
      if (y == undefined || y == null) {
        throw "Missing the required parameter 'y' when calling getTile";
      }

      // verify the required parameter 'extension' is set
      if (extension == undefined || extension == null) {
        throw "Missing the required parameter 'extension' when calling getTile";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'styleId': styleId,
        'instanceId': instanceId,
        'time': time,
        'level': level,
        'z': z,
        'x': x,
        'y': y,
        'extension': extension
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['image/png'];
      var returnType = File;

      return this.apiClient.callApi(
        '/{ownerId}/tile/{layerId}/{styleId}/{instanceId}/{time}/{level}/{z}/{x}/{y}.{extension}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the getTimes operation.
     * @callback module:api/TilesApi~getTimesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Times} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * A collection of moments in time for which data exists and can be requested (as tiles) for an instance of a layer.
     * This endpoint exposes the array of moments that data exists for a particular instance. Each element can be used to substitute the &lt;time&gt; part of a tile URL. Not all layer instances have a temporal dimension (e.g. it may be static bathymetry, or an observational dataset with no forecast or hindcast). If a layer has no temporal dimension, the array will be empty. The times in the array may not be unique (this is almost always due to grouped datasets containing overlapping time steps).
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} instanceId The id of the instance.
     * @param {module:api/TilesApi~getTimesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Times}
     */
    this.getTimes = function(ownerId, layerId, instanceId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getTimes";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getTimes";
      }

      // verify the required parameter 'instanceId' is set
      if (instanceId == undefined || instanceId == null) {
        throw "Missing the required parameter 'instanceId' when calling getTimes";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'instanceId': instanceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Times;

      return this.apiClient.callApi(
        '/{ownerId}/layer/{layerId}/instance/{instanceId}/times/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/Error":21,"../model/Instance":22,"../model/Layer":23,"../model/Layers":25,"../model/Levels":28,"../model/Times":37}],17:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Times', 'model/Error'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Times'), require('../model/Error'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.TimesApi = factory(root.WxTiles.ApiClient, root.WxTiles.Times, root.WxTiles.Error);
  }
}(this, function(ApiClient, Times, Error) {
  'use strict';

  /**
   * Times service.
   * @module api/TimesApi
   * @version 3.0.0
   */

  /**
   * Constructs a new TimesApi. 
   * @alias module:api/TimesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the getTimes operation.
     * @callback module:api/TimesApi~getTimesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/Times} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * A collection of moments in time for which data exists and can be requested (as tiles) for an instance of a layer.
     * This endpoint exposes the array of moments that data exists for a particular instance. Each element can be used to substitute the &lt;time&gt; part of a tile URL. Not all layer instances have a temporal dimension (e.g. it may be static bathymetry, or an observational dataset with no forecast or hindcast). If a layer has no temporal dimension, the array will be empty. The times in the array may not be unique (this is almost always due to grouped datasets containing overlapping time steps).
     * @param {String} ownerId The owner of the dataset.
     * @param {String} layerId The id of the layer.
     * @param {String} instanceId The id of the instance.
     * @param {module:api/TimesApi~getTimesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/Times}
     */
    this.getTimes = function(ownerId, layerId, instanceId, callback) {
      var postBody = null;

      // verify the required parameter 'ownerId' is set
      if (ownerId == undefined || ownerId == null) {
        throw "Missing the required parameter 'ownerId' when calling getTimes";
      }

      // verify the required parameter 'layerId' is set
      if (layerId == undefined || layerId == null) {
        throw "Missing the required parameter 'layerId' when calling getTimes";
      }

      // verify the required parameter 'instanceId' is set
      if (instanceId == undefined || instanceId == null) {
        throw "Missing the required parameter 'instanceId' when calling getTimes";
      }


      var pathParams = {
        'ownerId': ownerId,
        'layerId': layerId,
        'instanceId': instanceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = ['apiKeyQuery', 'apiKeyHeader'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = Times;

      return this.apiClient.callApi(
        '/{ownerId}/layer/{layerId}/instance/{instanceId}/times/', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/Error":21,"../model/Times":37}],18:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Bounds', 'model/Dimension', 'model/Error', 'model/Instance', 'model/Layer', 'model/LayerDefaults', 'model/Layers', 'model/LegendResources', 'model/Level', 'model/Levels', 'model/MaxNativeZoom', 'model/MinNativeZoom', 'model/PartialInstance', 'model/Region', 'model/Resources', 'model/Style', 'model/Tag', 'model/Time', 'model/Times', 'api/InstancesApi', 'api/LayersApi', 'api/LegendsApi', 'api/LevelsApi', 'api/StylesApi', 'api/TilesApi', 'api/TimesApi'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('./ApiClient'), require('./model/Bounds'), require('./model/Dimension'), require('./model/Error'), require('./model/Instance'), require('./model/Layer'), require('./model/LayerDefaults'), require('./model/Layers'), require('./model/LegendResources'), require('./model/Level'), require('./model/Levels'), require('./model/MaxNativeZoom'), require('./model/MinNativeZoom'), require('./model/PartialInstance'), require('./model/Region'), require('./model/Resources'), require('./model/Style'), require('./model/Tag'), require('./model/Time'), require('./model/Times'), require('./api/InstancesApi'), require('./api/LayersApi'), require('./api/LegendsApi'), require('./api/LevelsApi'), require('./api/StylesApi'), require('./api/TilesApi'), require('./api/TimesApi'));
  }
}(function(ApiClient, Bounds, Dimension, Error, Instance, Layer, LayerDefaults, Layers, LegendResources, Level, Levels, MaxNativeZoom, MinNativeZoom, PartialInstance, Region, Resources, Style, Tag, Time, Times, InstancesApi, LayersApi, LegendsApi, LevelsApi, StylesApi, TilesApi, TimesApi) {
  'use strict';

  /**
   * Make_and_explore_beautiful_rapidly_refreshed_weather_maps_with_the_WXTiles_API.<br>
   * The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
   * <p>
   * An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
   * <pre>
   * var WxTiles = require('index'); // See note below*.
   * var xxxSvc = new WxTiles.XxxApi(); // Allocate the API class we're going to use.
   * var yyyModel = new WxTiles.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * <em>*NOTE: For a top-level AMD script, use require(['index'], function(){...})
   * and put the application logic within the callback function.</em>
   * </p>
   * <p>
   * A non-AMD browser application (discouraged) might do something like this:
   * <pre>
   * var xxxSvc = new WxTiles.XxxApi(); // Allocate the API class we're going to use.
   * var yyy = new WxTiles.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * </p>
   * @module index
   * @version 3.0.0
   */
  var exports = {
    /**
     * The ApiClient constructor.
     * @property {module:ApiClient}
     */
    ApiClient: ApiClient,
    /**
     * The Bounds model constructor.
     * @property {module:model/Bounds}
     */
    Bounds: Bounds,
    /**
     * The Dimension model constructor.
     * @property {module:model/Dimension}
     */
    Dimension: Dimension,
    /**
     * The Error model constructor.
     * @property {module:model/Error}
     */
    Error: Error,
    /**
     * The Instance model constructor.
     * @property {module:model/Instance}
     */
    Instance: Instance,
    /**
     * The Layer model constructor.
     * @property {module:model/Layer}
     */
    Layer: Layer,
    /**
     * The LayerDefaults model constructor.
     * @property {module:model/LayerDefaults}
     */
    LayerDefaults: LayerDefaults,
    /**
     * The Layers model constructor.
     * @property {module:model/Layers}
     */
    Layers: Layers,
    /**
     * The LegendResources model constructor.
     * @property {module:model/LegendResources}
     */
    LegendResources: LegendResources,
    /**
     * The Level model constructor.
     * @property {module:model/Level}
     */
    Level: Level,
    /**
     * The Levels model constructor.
     * @property {module:model/Levels}
     */
    Levels: Levels,
    /**
     * The MaxNativeZoom model constructor.
     * @property {module:model/MaxNativeZoom}
     */
    MaxNativeZoom: MaxNativeZoom,
    /**
     * The MinNativeZoom model constructor.
     * @property {module:model/MinNativeZoom}
     */
    MinNativeZoom: MinNativeZoom,
    /**
     * The PartialInstance model constructor.
     * @property {module:model/PartialInstance}
     */
    PartialInstance: PartialInstance,
    /**
     * The Region model constructor.
     * @property {module:model/Region}
     */
    Region: Region,
    /**
     * The Resources model constructor.
     * @property {module:model/Resources}
     */
    Resources: Resources,
    /**
     * The Style model constructor.
     * @property {module:model/Style}
     */
    Style: Style,
    /**
     * The Tag model constructor.
     * @property {module:model/Tag}
     */
    Tag: Tag,
    /**
     * The Time model constructor.
     * @property {module:model/Time}
     */
    Time: Time,
    /**
     * The Times model constructor.
     * @property {module:model/Times}
     */
    Times: Times,
    /**
     * The InstancesApi service constructor.
     * @property {module:api/InstancesApi}
     */
    InstancesApi: InstancesApi,
    /**
     * The LayersApi service constructor.
     * @property {module:api/LayersApi}
     */
    LayersApi: LayersApi,
    /**
     * The LegendsApi service constructor.
     * @property {module:api/LegendsApi}
     */
    LegendsApi: LegendsApi,
    /**
     * The LevelsApi service constructor.
     * @property {module:api/LevelsApi}
     */
    LevelsApi: LevelsApi,
    /**
     * The StylesApi service constructor.
     * @property {module:api/StylesApi}
     */
    StylesApi: StylesApi,
    /**
     * The TilesApi service constructor.
     * @property {module:api/TilesApi}
     */
    TilesApi: TilesApi,
    /**
     * The TimesApi service constructor.
     * @property {module:api/TimesApi}
     */
    TimesApi: TimesApi
  };

  return exports;
}));

},{"./ApiClient":10,"./api/InstancesApi":11,"./api/LayersApi":12,"./api/LegendsApi":13,"./api/LevelsApi":14,"./api/StylesApi":15,"./api/TilesApi":16,"./api/TimesApi":17,"./model/Bounds":19,"./model/Dimension":20,"./model/Error":21,"./model/Instance":22,"./model/Layer":23,"./model/LayerDefaults":24,"./model/Layers":25,"./model/LegendResources":26,"./model/Level":27,"./model/Levels":28,"./model/MaxNativeZoom":29,"./model/MinNativeZoom":30,"./model/PartialInstance":31,"./model/Region":32,"./model/Resources":33,"./model/Style":34,"./model/Tag":35,"./model/Time":36,"./model/Times":37}],19:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Bounds = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Bounds model module.
   * @module model/Bounds
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Bounds</code>.
   * An object representing the layer instance&#39;s bounding box (derived from the dataset)
   * @alias module:model/Bounds
   * @class
   * @param west {Number} The western extent of the instance's dataset (degrees longitude)
   * @param east {Number} The eastern extent of the instance's dataset (degrees longitude)
   * @param north {Number} The northern extent of the instance's dataset (degrees latitude)
   * @param south {Number} The southern extent of the instance's dataset (degrees longitude)
   */
  var exports = function(west, east, north, south) {
    var _this = this;

    _this['west'] = west;
    _this['east'] = east;
    _this['north'] = north;
    _this['south'] = south;
  };

  /**
   * Constructs a <code>Bounds</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Bounds} obj Optional instance to populate.
   * @return {module:model/Bounds} The populated <code>Bounds</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('west')) {
        obj['west'] = ApiClient.convertToType(data['west'], 'Number');
      }
      if (data.hasOwnProperty('east')) {
        obj['east'] = ApiClient.convertToType(data['east'], 'Number');
      }
      if (data.hasOwnProperty('north')) {
        obj['north'] = ApiClient.convertToType(data['north'], 'Number');
      }
      if (data.hasOwnProperty('south')) {
        obj['south'] = ApiClient.convertToType(data['south'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The western extent of the instance's dataset (degrees longitude)
   * @member {Number} west
   */
  exports.prototype['west'] = undefined;
  /**
   * The eastern extent of the instance's dataset (degrees longitude)
   * @member {Number} east
   */
  exports.prototype['east'] = undefined;
  /**
   * The northern extent of the instance's dataset (degrees latitude)
   * @member {Number} north
   */
  exports.prototype['north'] = undefined;
  /**
   * The southern extent of the instance's dataset (degrees longitude)
   * @member {Number} south
   */
  exports.prototype['south'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],20:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Dimension = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Dimension model module.
   * @module model/Dimension
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Dimension</code>.
   * A dimension used by the layer. Typically these may be spatial (latitude/longitude or x/y), time and possibly a vertical dimension.
   * @alias module:model/Dimension
   * @class
   */
  var exports = function() {
    var _this = this;

  };

  /**
   * Constructs a <code>Dimension</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Dimension} obj Optional instance to populate.
   * @return {module:model/Dimension} The populated <code>Dimension</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10}],21:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Error = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Error model module.
   * @module model/Error
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Error</code>.
   * @alias module:model/Error
   * @class
   */
  var exports = function() {
    var _this = this;




  };

  /**
   * Constructs a <code>Error</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Error} obj Optional instance to populate.
   * @return {module:model/Error} The populated <code>Error</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('http-code')) {
        obj['http-code'] = ApiClient.convertToType(data['http-code'], 'Number');
      }
      if (data.hasOwnProperty('incident-number')) {
        obj['incident-number'] = ApiClient.convertToType(data['incident-number'], 'String');
      }
      if (data.hasOwnProperty('message')) {
        obj['message'] = ApiClient.convertToType(data['message'], 'String');
      }
    }
    return obj;
  }

  /**
   * HTTP status code
   * @member {Number} http-code
   */
  exports.prototype['http-code'] = undefined;
  /**
   * Incident number that has been recorded.
   * @member {String} incident-number
   */
  exports.prototype['incident-number'] = undefined;
  /**
   * Explanation why the request has caused an error
   * @member {String} message
   */
  exports.prototype['message'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],22:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Levels', 'model/PartialInstance', 'model/Times'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Levels'), require('./PartialInstance'), require('./Times'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Instance = factory(root.WxTiles.ApiClient, root.WxTiles.Levels, root.WxTiles.PartialInstance, root.WxTiles.Times);
  }
}(this, function(ApiClient, Levels, PartialInstance, Times) {
  'use strict';




  /**
   * The Instance model module.
   * @module model/Instance
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Instance</code>.
   * A named instance of a dataset, typically used to represent a forecast model cycle. Includes information on available times and vertical levels (if any).
   * @alias module:model/Instance
   * @class
   * @param instance {module:model/PartialInstance} 
   * @param times {module:model/Times} 
   * @param levels {module:model/Levels} 
   */
  var exports = function(instance, times, levels) {
    var _this = this;

    _this['instance'] = instance;
    _this['times'] = times;
    _this['levels'] = levels;
  };

  /**
   * Constructs a <code>Instance</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Instance} obj Optional instance to populate.
   * @return {module:model/Instance} The populated <code>Instance</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('instance')) {
        obj['instance'] = PartialInstance.constructFromObject(data['instance']);
      }
      if (data.hasOwnProperty('times')) {
        obj['times'] = Times.constructFromObject(data['times']);
      }
      if (data.hasOwnProperty('levels')) {
        obj['levels'] = Levels.constructFromObject(data['levels']);
      }
    }
    return obj;
  }

  /**
   * @member {module:model/PartialInstance} instance
   */
  exports.prototype['instance'] = undefined;
  /**
   * @member {module:model/Times} times
   */
  exports.prototype['times'] = undefined;
  /**
   * @member {module:model/Levels} levels
   */
  exports.prototype['levels'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./Levels":28,"./PartialInstance":31,"./Times":37}],23:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Bounds', 'model/Dimension', 'model/LayerDefaults', 'model/MaxNativeZoom', 'model/MinNativeZoom', 'model/PartialInstance', 'model/Region', 'model/Resources', 'model/Style', 'model/Tag'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Bounds'), require('./Dimension'), require('./LayerDefaults'), require('./MaxNativeZoom'), require('./MinNativeZoom'), require('./PartialInstance'), require('./Region'), require('./Resources'), require('./Style'), require('./Tag'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Layer = factory(root.WxTiles.ApiClient, root.WxTiles.Bounds, root.WxTiles.Dimension, root.WxTiles.LayerDefaults, root.WxTiles.MaxNativeZoom, root.WxTiles.MinNativeZoom, root.WxTiles.PartialInstance, root.WxTiles.Region, root.WxTiles.Resources, root.WxTiles.Style, root.WxTiles.Tag);
  }
}(this, function(ApiClient, Bounds, Dimension, LayerDefaults, MaxNativeZoom, MinNativeZoom, PartialInstance, Region, Resources, Style, Tag) {
  'use strict';




  /**
   * The Layer model module.
   * @module model/Layer
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Layer</code>.
   * A layer representing a spatial dataset that can be rendered by WXTiles
   * @alias module:model/Layer
   * @class
   * @param id {String} Layer ID
   * @param name {String} A short, human-readable description of a layer that is suitable for inclusion in a list of available layers.
   * @param instances {Array.<module:model/PartialInstance>} A list of the instances of this layer.
   * @param styles {Array.<module:model/Style>} A list of the styles the layer implements
   * @param dimensions {Array.<module:model/Dimension>} A list of dimensions used by the layer. Neither the names nor order of the dimensions are standardised, following the CF convention. Instead they reflect the declarations of underlying dataset metadata.
   * @param bounds {module:model/Bounds} 
   * @param minNativeZoom {module:model/MinNativeZoom} 
   * @param maxNativeZoom {module:model/MaxNativeZoom} 
   * @param resources {module:model/Resources} 
   */
  var exports = function(id, name, instances, styles, dimensions, bounds, minNativeZoom, maxNativeZoom, resources) {
    var _this = this;

    _this['id'] = id;

    _this['name'] = name;





    _this['instances'] = instances;
    _this['styles'] = styles;
    _this['dimensions'] = dimensions;
    _this['bounds'] = bounds;


    _this['minNativeZoom'] = minNativeZoom;
    _this['maxNativeZoom'] = maxNativeZoom;
    _this['resources'] = resources;

  };

  /**
   * Constructs a <code>Layer</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Layer} obj Optional instance to populate.
   * @return {module:model/Layer} The populated <code>Layer</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('laypersonDescription')) {
        obj['laypersonDescription'] = ApiClient.convertToType(data['laypersonDescription'], 'String');
      }
      if (data.hasOwnProperty('organisation')) {
        obj['organisation'] = ApiClient.convertToType(data['organisation'], 'String');
      }
      if (data.hasOwnProperty('source')) {
        obj['source'] = ApiClient.convertToType(data['source'], 'String');
      }
      if (data.hasOwnProperty('regions')) {
        obj['regions'] = ApiClient.convertToType(data['regions'], [Region]);
      }
      if (data.hasOwnProperty('tags')) {
        obj['tags'] = ApiClient.convertToType(data['tags'], [Tag]);
      }
      if (data.hasOwnProperty('instances')) {
        obj['instances'] = ApiClient.convertToType(data['instances'], [PartialInstance]);
      }
      if (data.hasOwnProperty('styles')) {
        obj['styles'] = ApiClient.convertToType(data['styles'], [Style]);
      }
      if (data.hasOwnProperty('dimensions')) {
        obj['dimensions'] = ApiClient.convertToType(data['dimensions'], [Dimension]);
      }
      if (data.hasOwnProperty('bounds')) {
        obj['bounds'] = Bounds.constructFromObject(data['bounds']);
      }
      if (data.hasOwnProperty('instanceType')) {
        obj['instanceType'] = ApiClient.convertToType(data['instanceType'], 'String');
      }
      if (data.hasOwnProperty('instanceDescription')) {
        obj['instanceDescription'] = ApiClient.convertToType(data['instanceDescription'], 'String');
      }
      if (data.hasOwnProperty('minNativeZoom')) {
        obj['minNativeZoom'] = MinNativeZoom.constructFromObject(data['minNativeZoom']);
      }
      if (data.hasOwnProperty('maxNativeZoom')) {
        obj['maxNativeZoom'] = MaxNativeZoom.constructFromObject(data['maxNativeZoom']);
      }
      if (data.hasOwnProperty('resources')) {
        obj['resources'] = Resources.constructFromObject(data['resources']);
      }
      if (data.hasOwnProperty('defaults')) {
        obj['defaults'] = LayerDefaults.constructFromObject(data['defaults']);
      }
    }
    return obj;
  }

  /**
   * Layer ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * A long description of a layer, possibly including HTML tags to navigate users to glossaries or other sources of additional information.
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * A short, human-readable description of a layer that is suitable for inclusion in a list of available layers.
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * A long description of a layer, which is intended for display to a 'layperson' who should not be confronted with technical, meteological or other jargon when browsing layer information.
   * @member {String} laypersonDescription
   */
  exports.prototype['laypersonDescription'] = undefined;
  /**
   * Organisation responsible for publishing the data used in the layer.
   * @member {String} organisation
   */
  exports.prototype['organisation'] = undefined;
  /**
   * The source of the data (such as a model).
   * @member {String} source
   */
  exports.prototype['source'] = undefined;
  /**
   * A list of the regions that the layer should be considered applicable.
   * @member {Array.<module:model/Region>} regions
   */
  exports.prototype['regions'] = undefined;
  /**
   * A list of tags that may be used to support free-text search.
   * @member {Array.<module:model/Tag>} tags
   */
  exports.prototype['tags'] = undefined;
  /**
   * A list of the instances of this layer.
   * @member {Array.<module:model/PartialInstance>} instances
   */
  exports.prototype['instances'] = undefined;
  /**
   * A list of the styles the layer implements
   * @member {Array.<module:model/Style>} styles
   */
  exports.prototype['styles'] = undefined;
  /**
   * A list of dimensions used by the layer. Neither the names nor order of the dimensions are standardised, following the CF convention. Instead they reflect the declarations of underlying dataset metadata.
   * @member {Array.<module:model/Dimension>} dimensions
   */
  exports.prototype['dimensions'] = undefined;
  /**
   * @member {module:model/Bounds} bounds
   */
  exports.prototype['bounds'] = undefined;
  /**
   * One of a typology of instance types. In this version, 'cyclic' (model cycles) and 'observational' (for observations that will be repeated) are used.. Nullable (e.g. if instances are not applicable, or the type unspecified).
   * @member {module:model/Layer.InstanceTypeEnum} instanceType
   */
  exports.prototype['instanceType'] = undefined;
  /**
   * Free-form text explaining the role of instances for the associated layer
   * @member {String} instanceDescription
   */
  exports.prototype['instanceDescription'] = undefined;
  /**
   * @member {module:model/MinNativeZoom} minNativeZoom
   */
  exports.prototype['minNativeZoom'] = undefined;
  /**
   * @member {module:model/MaxNativeZoom} maxNativeZoom
   */
  exports.prototype['maxNativeZoom'] = undefined;
  /**
   * @member {module:model/Resources} resources
   */
  exports.prototype['resources'] = undefined;
  /**
   * @member {module:model/LayerDefaults} defaults
   */
  exports.prototype['defaults'] = undefined;


  /**
   * Allowed values for the <code>instanceType</code> property.
   * @enum {String}
   * @readonly
   */
  exports.InstanceTypeEnum = {
    /**
     * value: "cyclic"
     * @const
     */
    "cyclic": "cyclic",
    /**
     * value: "observational"
     * @const
     */
    "observational": "observational"  };


  return exports;
}));



},{"../ApiClient":10,"./Bounds":19,"./Dimension":20,"./LayerDefaults":24,"./MaxNativeZoom":29,"./MinNativeZoom":30,"./PartialInstance":31,"./Region":32,"./Resources":33,"./Style":34,"./Tag":35}],24:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.LayerDefaults = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The LayerDefaults model module.
   * @module model/LayerDefaults
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>LayerDefaults</code>.
   * Default options for the layer.
   * @alias module:model/LayerDefaults
   * @class
   * @param style {String} ID of the default style implemented by a layer.
   */
  var exports = function(style) {
    var _this = this;

    _this['style'] = style;
  };

  /**
   * Constructs a <code>LayerDefaults</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/LayerDefaults} obj Optional instance to populate.
   * @return {module:model/LayerDefaults} The populated <code>LayerDefaults</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('style')) {
        obj['style'] = ApiClient.convertToType(data['style'], 'String');
      }
    }
    return obj;
  }

  /**
   * ID of the default style implemented by a layer.
   * @member {String} style
   */
  exports.prototype['style'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],25:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Layer'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Layer'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Layers = factory(root.WxTiles.ApiClient, root.WxTiles.Layer);
  }
}(this, function(ApiClient, Layer) {
  'use strict';




  /**
   * The Layers model module.
   * @module model/Layers
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Layers</code>.
   * All layers meeting your query, that that you are authenticated for, and which are currently available
   * @alias module:model/Layers
   * @class
   * @extends Array
   */
  var exports = function() {
    var _this = this;
    _this = new Array();
    Object.setPrototypeOf(_this, exports);

    return _this;
  };

  /**
   * Constructs a <code>Layers</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Layers} obj Optional instance to populate.
   * @return {module:model/Layers} The populated <code>Layers</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();
      ApiClient.constructFromObject(data, obj, Layer);

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10,"./Layer":23}],26:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.LegendResources = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The LegendResources model module.
   * @module model/LegendResources
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>LegendResources</code>.
   * Template URLS for requesting additional resources for the layer&#39;s implementation of a style (e.g. a PNG legend).
   * @alias module:model/LegendResources
   * @class
   * @param jsonLegend {String} URL for requesting legends as JSON representations. These JSON representations are used internally to construct the image versions of the legend, and can be used to render custom legends client-side. No component of this URL requires substitution.
   */
  var exports = function(jsonLegend) {
    var _this = this;


    _this['jsonLegend'] = jsonLegend;
  };

  /**
   * Constructs a <code>LegendResources</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/LegendResources} obj Optional instance to populate.
   * @return {module:model/LegendResources} The populated <code>LegendResources</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('legend')) {
        obj['legend'] = ApiClient.convertToType(data['legend'], 'String');
      }
      if (data.hasOwnProperty('jsonLegend')) {
        obj['jsonLegend'] = ApiClient.convertToType(data['jsonLegend'], 'String');
      }
    }
    return obj;
  }

  /**
   * URL for requesting legends as PNG images that correspond to the PNG image tiles. The 'size' and 'orientation' elements in the path (enclosed in angle brackets) need to be substituted. Valid values for size are 'small' and 'large'. Valid values for orientation are 'horizontal' and 'vertical'.
   * @member {String} legend
   */
  exports.prototype['legend'] = undefined;
  /**
   * URL for requesting legends as JSON representations. These JSON representations are used internally to construct the image versions of the legend, and can be used to render custom legends client-side. No component of this URL requires substitution.
   * @member {String} jsonLegend
   */
  exports.prototype['jsonLegend'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],27:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Level = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Level model module.
   * @module model/Level
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Level</code>.
   * A potential value of a vertical dimension of an instance. Values in this array is used to substitute &lt;level&gt; in a tile URL.
   * @alias module:model/Level
   * @class
   */
  var exports = function() {
    var _this = this;

  };

  /**
   * Constructs a <code>Level</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Level} obj Optional instance to populate.
   * @return {module:model/Level} The populated <code>Level</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10}],28:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Level'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Level'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Levels = factory(root.WxTiles.ApiClient, root.WxTiles.Level);
  }
}(this, function(ApiClient, Level) {
  'use strict';




  /**
   * The Levels model module.
   * @module model/Levels
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Levels</code>.
   * @alias module:model/Levels
   * @class
   * @extends Array
   */
  var exports = function() {
    var _this = this;
    _this = new Array();
    Object.setPrototypeOf(_this, exports);

    return _this;
  };

  /**
   * Constructs a <code>Levels</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Levels} obj Optional instance to populate.
   * @return {module:model/Levels} The populated <code>Levels</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();
      ApiClient.constructFromObject(data, obj, Level);

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10,"./Level":27}],29:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.MaxNativeZoom = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The MaxNativeZoom model module.
   * @module model/MaxNativeZoom
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>MaxNativeZoom</code>.
   * The largest scale supported natively by the layer.
   * @alias module:model/MaxNativeZoom
   * @class
   */
  var exports = function() {
    var _this = this;

  };

  /**
   * Constructs a <code>MaxNativeZoom</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MaxNativeZoom} obj Optional instance to populate.
   * @return {module:model/MaxNativeZoom} The populated <code>MaxNativeZoom</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10}],30:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.MinNativeZoom = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The MinNativeZoom model module.
   * @module model/MinNativeZoom
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>MinNativeZoom</code>.
   * The smallest scale supported natively by the layer.
   * @alias module:model/MinNativeZoom
   * @class
   */
  var exports = function() {
    var _this = this;

  };

  /**
   * Constructs a <code>MinNativeZoom</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MinNativeZoom} obj Optional instance to populate.
   * @return {module:model/MinNativeZoom} The populated <code>MinNativeZoom</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10}],31:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.PartialInstance = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The PartialInstance model module.
   * @module model/PartialInstance
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>PartialInstance</code>.
   * A named instance of a dataset, typically used to represent a forecast model cycle.
   * @alias module:model/PartialInstance
   * @class
   * @param id {String} Instance ID
   * @param displayName {String} Instance name, intended for display to end users
   * @param created {Date} ISO 8601 datetime string representing when the instance configuration was created
   */
  var exports = function(id, displayName, created) {
    var _this = this;

    _this['id'] = id;
    _this['displayName'] = displayName;
    _this['created'] = created;


  };

  /**
   * Constructs a <code>PartialInstance</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/PartialInstance} obj Optional instance to populate.
   * @return {module:model/PartialInstance} The populated <code>PartialInstance</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('displayName')) {
        obj['displayName'] = ApiClient.convertToType(data['displayName'], 'String');
      }
      if (data.hasOwnProperty('created')) {
        obj['created'] = ApiClient.convertToType(data['created'], 'Date');
      }
      if (data.hasOwnProperty('start')) {
        obj['start'] = ApiClient.convertToType(data['start'], 'Date');
      }
      if (data.hasOwnProperty('end')) {
        obj['end'] = ApiClient.convertToType(data['end'], 'Date');
      }
    }
    return obj;
  }

  /**
   * Instance ID
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Instance name, intended for display to end users
   * @member {String} displayName
   */
  exports.prototype['displayName'] = undefined;
  /**
   * ISO 8601 datetime string representing when the instance configuration was created
   * @member {Date} created
   */
  exports.prototype['created'] = undefined;
  /**
   * ISO 8601 datetime string representing the earliest retrievable time-step for an instance, if an instance has a time dimension.
   * @member {Date} start
   */
  exports.prototype['start'] = undefined;
  /**
   * ISO 8601 datetime string representing the latest retrievable time-step for an instance, if an instance has a time dimension.
   * @member {Date} end
   */
  exports.prototype['end'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],32:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Region = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Region model module.
   * @module model/Region
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Region</code>.
   * A three-digit numerical code used by the Statistics Division of the United Nations Secretariat. Represents geographical regions where the layer is considered applicable, from the global scale (&#39;001&#39;), to continental, sub-continental, and country scales. See http://unstats.un.org/unsd/methods/m49/m49.htm for the list of values in current use. These are left-side zero-padded and therefore should be treated as strings and not integers.
   * @alias module:model/Region
   * @class
   */
  var exports = function() {
    var _this = this;

  };

  /**
   * Constructs a <code>Region</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Region} obj Optional instance to populate.
   * @return {module:model/Region} The populated <code>Region</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10}],33:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Resources = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Resources model module.
   * @module model/Resources
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Resources</code>.
   * Template URLs for requesting tiles and other resources for this layer instance. Note that the tile coordinates (z, x, and y) must be given in OGC TMS, rather than the XYZ specification (see https://gist.github.com/tmcw/4954720 for the difference, which only affects the y coordinate). Not all given properties exist for all layers. The literal text &#39;instance&#39; (enclosed in angle brackets) must be substituted by a valid instance ID.
   * @alias module:model/Resources
   * @class
   */
  var exports = function() {
    var _this = this;





  };

  /**
   * Constructs a <code>Resources</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Resources} obj Optional instance to populate.
   * @return {module:model/Resources} The populated <code>Resources</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('tile')) {
        obj['tile'] = ApiClient.convertToType(data['tile'], 'String');
      }
      if (data.hasOwnProperty('vtile')) {
        obj['vtile'] = ApiClient.convertToType(data['vtile'], 'String');
      }
      if (data.hasOwnProperty('times')) {
        obj['times'] = ApiClient.convertToType(data['times'], 'String');
      }
      if (data.hasOwnProperty('levels')) {
        obj['levels'] = ApiClient.convertToType(data['levels'], 'String');
      }
    }
    return obj;
  }

  /**
   * Template URL for requesting styled, PNG image tiles. Elements of the path enclosed in angle brackets need to be appropriately substituted when making requests. If not present, the layer does not support rendering as an image.
   * @member {String} tile
   */
  exports.prototype['tile'] = undefined;
  /**
   * Template URL for requesting vector tiles in the Mapbox vector tile (MVT) specification, as protocol buffers. Elements of the path enclosed in angle brackets need to be appropriately substituted when making requests. If not present, the layer does not support rendering as a vector tile.
   * @member {String} vtile
   */
  exports.prototype['vtile'] = undefined;
  /**
   * Tempalte URL for requesting available times for a layer instance. Elements of the path enclosed in angle brackets need to be appropriately substituted when making requests. If not present, the layer does not support a time dimension.
   * @member {String} times
   */
  exports.prototype['times'] = undefined;
  /**
   * Tempalte URL for requesting available levels for a layer instance. Elements of the path enclosed in angle brackets need to be appropriately substituted when making requests. If not present, the layer does not support a a vertical dimension.
   * @member {String} levels
   */
  exports.prototype['levels'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],34:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/LegendResources'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./LegendResources'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Style = factory(root.WxTiles.ApiClient, root.WxTiles.LegendResources);
  }
}(this, function(ApiClient, LegendResources) {
  'use strict';




  /**
   * The Style model module.
   * @module model/Style
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Style</code>.
   * A named style representing one way of rendering a layer as tiles.
   * @alias module:model/Style
   * @class
   * @param id {String} Style ID.
   * @param resources {module:model/LegendResources} 
   */
  var exports = function(id, resources) {
    var _this = this;

    _this['id'] = id;



    _this['resources'] = resources;
  };

  /**
   * Constructs a <code>Style</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Style} obj Optional instance to populate.
   * @return {module:model/Style} The populated <code>Style</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'String');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('label')) {
        obj['label'] = ApiClient.convertToType(data['label'], 'String');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('resources')) {
        obj['resources'] = LegendResources.constructFromObject(data['resources']);
      }
    }
    return obj;
  }

  /**
   * Style ID.
   * @member {String} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Name of the style that is implemented by the layer.
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * Text displayed alongside an image legend (often, but not always, a representation of the primary unit).
   * @member {String} label
   */
  exports.prototype['label'] = undefined;
  /**
   * Description of the style (in greater detail than the name).
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * @member {module:model/LegendResources} resources
   */
  exports.prototype['resources'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./LegendResources":26}],35:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Tag = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Tag model module.
   * @module model/Tag
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Tag</code>.
   * A string tag that could take any value; intended to support free-text search and filtering of layers. An example might be the tag &#39;rain&#39; for a layer showing forecast precipitation.
   * @alias module:model/Tag
   * @class
   */
  var exports = function() {
    var _this = this;

  };

  /**
   * Constructs a <code>Tag</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Tag} obj Optional instance to populate.
   * @return {module:model/Tag} The populated <code>Tag</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10}],36:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Time = factory(root.WxTiles.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Time model module.
   * @module model/Time
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Time</code>.
   * ISO 8601 string representing a datetime, a possible value of the temporal dimension of an instance. Values in this array is used to ubstitute &#39;time&#39; in a tile URL.
   * @alias module:model/Time
   * @class
   */
  var exports = function() {
    var _this = this;

  };

  /**
   * Constructs a <code>Time</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Time} obj Optional instance to populate.
   * @return {module:model/Time} The populated <code>Time</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10}],37:[function(require,module,exports){
/**
 * WXTiles
 * Make and explore beautiful, rapidly-refreshed weather maps with the WXTiles API
 *
 * OpenAPI spec version: 3.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Time'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Time'));
  } else {
    // Browser globals (root is window)
    if (!root.WxTiles) {
      root.WxTiles = {};
    }
    root.WxTiles.Times = factory(root.WxTiles.ApiClient, root.WxTiles.Time);
  }
}(this, function(ApiClient, Time) {
  'use strict';




  /**
   * The Times model module.
   * @module model/Times
   * @version 3.0.0
   */

  /**
   * Constructs a new <code>Times</code>.
   * @alias module:model/Times
   * @class
   * @extends Array
   */
  var exports = function() {
    var _this = this;
    _this = new Array();
    Object.setPrototypeOf(_this, exports);

    return _this;
  };

  /**
   * Constructs a <code>Times</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Times} obj Optional instance to populate.
   * @return {module:model/Times} The populated <code>Times</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();
      ApiClient.constructFromObject(data, obj, Time);

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10,"./Time":36}],38:[function(require,module,exports){
//Add some extra wrapping around the library autogenerated from the swagger.
/**
   * @file A wrapper around the swagger autogenerated client.
   * @copyright MetOcean Solutions Ltd. 2016
   */

var apiClient = require('./index.js');
var api = new apiClient.TilesApi();

/**
 * Tiles service.
 * @module wxTiles
 * @version 3.0.0
 * @copyright MetOcean Solutions Ltd. 2016
 * @borrows  module:api/TilesApi#getLayers as wxTiles#getLayers
 * @borrows  module:api/TilesApi#getLayer
 * @borrows  module:api/TilesApi#getInstance
 * @borrows  module:api/TilesApi#getTimes
 * @borrows  module:api/TilesApi#getLevels
 * @borrows  module:api/TilesApi#getTile
 * @borrows  module:api/LegendsApi#getPNGLegend
 * @borrows  module:api/LegendsApi#getJSONLegend
 */
module.exports = api;

//All following requests will have the header:
//apiKey: the_key
module.exports.setApiKeyHeader = (apiKey) => {
	api.apiClient.authentications.apiKeyHeader.apiKey = apiKey;
}

//All following requests will have the query string:
//?apiKey=the_key
module.exports.setApiKeyQuery = (apiKey) => {
	api.apiClient.authentications.apiKeyQuery.apiKey = apiKey;
}

//Returns the URL to pass to map libraries like leaflet.
//Will include the apiKey query string, if set.

/**
 * Callback function to receive the result of the getLayer operation.
 * @callback module:wrapper~getPNGTileURLCallback
 * @param {String} error Error message, if any.
 * @param {module:model/Layer} data The data returned by the service call.
 * @param {String} response The complete HTTP response.
 */
/**
 * A PNG tile URL to pass to map libraries
 * This endpoint provides a tile url template to pass to map libraries like leaflet.
 * @param {String} ownerId The owner of the dataset.
 * @param {String} layerId The id of the layer.
 * @param {String} styleId The id of a style implemented by the layer.
 * @param {String} instanceId The id of an instance held by the layer.
 * @param {Date} time The time.
 * @param {String} level The level.
 * @param {module:wrapper~getPNGTileURLCallback} callback The callback function, accepting three arguments: error, data, response
 */
module.exports.getPNGTileURL = (ownerId, layerId, styleId, instanceId, time, level, callback) => {

	//The layer might not have levels.
	if(!level) {
		level = 0;
	}

	//The layer might not have times
	if(!time) {
		time = 0;
	}

	var urlTemplate = `/${ownerId}/tile/${layerId}/${styleId}/${instanceId}/${time}/${level}/{z}/{x}/{y}.png`
	var tileURL = api.apiClient.basePath + urlTemplate;

	//Add the apiKey to the url if it is set.
	if(api.apiClient.authentications.apiKeyQuery.apiKey) {
		tileURL += "?apiKey=" + api.apiClient.authentications.apiKeyQuery.apiKey;
	}

	callback(null, tileURL);
}

//Returns the URL for the legend.
//Will include the apiKey query string, if set.
module.exports.getPNGLegendURL = (ownerId, layerId, styleId, size, orientation, callback) => {

	var urlTemplate = `/${ownerId}/legend/${layerId}/${styleId}/${size}/${orientation}.png`
	var legendURL = api.apiClient.basePath + urlTemplate;

	//Add the apiKey to the url if it is set.
	if(api.apiClient.authentications.apiKeyQuery.apiKey) {
		legendURL += "?apiKey=" + api.apiClient.authentications.apiKeyQuery.apiKey;
	}

	callback(null, legendURL);
}

//Helper function for Google Maps.
//Call this with your url and plug the returned object into google maps.
//E.G:
//var layerTilesUrl = wxTiles.getPNGTileURL("wxtiles", "aLayer", "aStyle", "anInstance", "aTime", 0);
//var mapLayer = wxTiles.google.getImageMapType(layerTilesUrl);
//googleMap.overlayMapTypes.setAt(layerKey, mapLayer);
module.exports.googleMaps = {}
module.exports.googleMaps.getImageMapType = (layerTilesUrl) => {
  return new google.maps.ImageMapType({
    getTileUrl: (coord, zoom) => {
      return layerTilesUrl.replace('{z}', zoom).replace('{x}', coord.x).replace('{y}', (Math.pow(2, zoom) - coord.y - 1));
    },
    tileSize: new google.maps.Size(256, 256),
    isPng: true
  })
}

},{"./index.js":18}],"main":[function(require,module,exports){
var leafletExample = require("./leaflet-example.js");

var WxTiles = require('wx-tiles');
var tilesApi = new WxTiles.TilesApi();
window.tilesApi = tilesApi;

window.callback = function(error, response)
{
  if(error) {
    console.error(error);
  }

  console.log(response);
}

function mountExamples() {
	// leafletExample.mountLeafletMap('leaflet-example-start');
	// leafletExample.mountLeafletMapNoOverlay('leaflet-example-no-overlay');
	// leafletExample.mountLeafletMap('leaflet-example');
}

module.exports = {
	mountExamples: mountExamples
}
},{"./leaflet-example.js":1,"wx-tiles":38}]},{},[]);
