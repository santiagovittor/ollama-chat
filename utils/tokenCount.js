// utils/tokenCount.js
const encoder = require('gpt-3-encoder');

function countTokens(text) {
  return encoder.encode(text).length;
}

module.exports = countTokens;
