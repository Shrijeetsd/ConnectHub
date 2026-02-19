// Core Polyfills for React Native compatibility
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { decode, encode } from 'base-64';
import process from 'process';

import 'fast-text-encoding';

// Attach to global
global.Buffer = Buffer;
global.btoa = encode;
global.atob = decode;
global.process = process;

// Ensure TextEncoder/Decoder are available globally
if (typeof global.TextEncoder === 'undefined' && typeof TextEncoder !== 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined' && typeof TextDecoder !== 'undefined') {
  global.TextDecoder = TextDecoder;
}

// HACK: Fix for "slice of undefined" in readable-stream/lib/_stream_writable.js
// This error happens because some libraries expect process.version to be defined (Node environment)
// but it is missing in RN. We set browser=true to short-circuit the version check.
if (global.process) {
  global.process.browser = true;
  if (!global.process.version) {
    global.process.version = ''; // Empty string is safe for slice, or 'v10.0.0'
  }
}

// Polyfill zlib constants to prevent Axios/form-data crash
if (typeof global.zlib === 'undefined') {
  global.zlib = {
    constants: {
      Z_SYNC_FLUSH: 2,
      Z_FINISH: 4,
    },
  };
} else if (typeof global.zlib.constants === 'undefined') {
  global.zlib.constants = {
    Z_SYNC_FLUSH: 2,
    Z_FINISH: 4,
  };
}
