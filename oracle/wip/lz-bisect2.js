"use strict";
// LZ bisect harness: compare the bundled lib against the FS-port semantics.
const fs = require("fs");
const LZ = require("../../../orig_project/kittensgame/lib/lz-string.js");
const blob = fs.readFileSync(process.env.TEMP + "/blob_f.txt", "utf8");
const P = blob.slice(0, 10628);
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function myCompress(uncompressed) {
  const dict = new Map(), toCreate = new Map();
  let w = "", enlargeIn = 2, dictCounter = 3, numBits = 2;
  const data = [];
  let dataVal = 0, dataPosition = 0;
  const flushBit = (bit) => { dataVal = (dataVal << 1) | (bit & 1); if (dataPosition === 5) { dataPosition = 0; data.push(B64[dataVal]); dataVal = 0; } else dataPosition++; };
  const flushZero = () => { dataVal = dataVal << 1; if (dataPosition === 5) { dataPosition = 0; data.push(B64[dataVal]); dataVal = 0; } else dataPosition++; };
  for (let i = 0; i < uncompressed.length; i++) {
    const c = uncompressed[i];
    if (!dict.has(c)) { dict.set(c, dictCounter++); toCreate.set(c, true); }
    const wc = w + c;
    if (dict.has(wc)) { w = wc; }
    else {
      const wstr = w;
      if (toCreate.has(wstr)) {
        if (wstr.charCodeAt(0) < 256) { for (let k = 0; k < numBits; k++) flushZero(); let value = wstr.charCodeAt(0); for (let k = 0; k < 8; k++) { flushBit(value & 1); value >>>= 1; } }
        else { let value = 1; for (let k = 0; k < numBits; k++) { flushBit(value); value = 0; } let value2 = wstr.charCodeAt(0); for (let k = 0; k < 16; k++) { flushBit(value2 & 1); value2 >>>= 1; } }
        enlargeIn--; if (enlargeIn === 0) { enlargeIn = 2 ** numBits; numBits++; }
        toCreate.delete(wstr);
      } else {
        let value = dict.get(wstr);
        for (let k = 0; k < numBits; k++) { flushBit(value & 1); value >>>= 1; }
      }
      enlargeIn--; if (enlargeIn === 0) { enlargeIn = 2 ** numBits; numBits++; }
      dict.set(wc, dictCounter++);
      w = c;
    }
  }
  if (w !== "") {
    const wstr = w;
    if (toCreate.has(wstr)) {
      if (wstr.charCodeAt(0) < 256) { for (let k = 0; k < numBits; k++) flushZero(); let value = wstr.charCodeAt(0); for (let k = 0; k < 8; k++) { flushBit(value & 1); value >>>= 1; } }
      else { let value = 1; for (let k = 0; k < numBits; k++) { flushBit(value); value = 0; } let value2 = wstr.charCodeAt(0); for (let k = 0; k < 16; k++) { flushBit(value2 & 1); value2 >>>= 1; } }
      enlargeIn--; if (enlargeIn === 0) { enlargeIn = 2 ** numBits; numBits++; }
      toCreate.delete(wstr);
    } else {
      let value = dict.get(wstr);
      for (let k = 0; k < numBits; k++) { flushBit(value & 1); value >>>= 1; }
    }
    enlargeIn--; if (enlargeIn === 0) { enlargeIn = 2 ** numBits; numBits++; }
  }
  let value = 2;
  for (let k = 0; k < numBits; k++) { flushBit(value & 1); value >>>= 1; }
  for (;;) { dataVal = dataVal << 1; if (dataPosition === 5) { data.push(B64[dataVal]); break; } dataPosition++; }
  return data.join("");
}
const ref = LZ.compressToBase64(P);
const mine = myCompress(P);
console.log("lens:", ref.length, mine.length);
console.log("ref :", JSON.stringify(ref.slice(-24)));
console.log("mine:", JSON.stringify(mine.slice(-24)));
// strip padding and compare bit tails
const strip = (s) => s.replace(/=+$/, "");
const rb = strip(ref), mb = strip(mine);
const rev = new Map([...B64].map((c, i) => [c, i]));
const bits = (s) => [...s].map((ch) => rev.get(ch).toString(2).padStart(6, "0")).join("");
console.log("ref bits tail :", bits(rb).slice(-40));
console.log("mine bits tail:", bits(mb).slice(-40));

let lo = 1, hi = blob.length;
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (myCompress(blob.slice(0, mid)) === LZ.compressToBase64(blob.slice(0, mid))) lo = mid + 1; else hi = mid;
}
console.log("smallest diverging prefix:", lo);
console.log("context end:", JSON.stringify(blob.slice(lo - 40, lo + 4)));
