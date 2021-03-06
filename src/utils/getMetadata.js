const mapValues = require('lodash/mapValues');
const pick = require('lodash/pick');
const redisKey = require('../utils/key.js');
const Promise = require('bluebird');
const { USERS_METADATA } = require('../constants.js');

const { isArray } = Array;
const JSONParse = data => JSON.parse(data);

module.exports = function getMetadata(username, _audiences, fields = {}) {
  const { redis } = this;
  const audiences = isArray(_audiences) ? _audiences : [_audiences];

  return Promise
    .map(audiences, audience => (
      redis.hgetall(redisKey(username, USERS_METADATA, audience))
    ))
    .then(function remapAudienceData(data) {
      const output = {};
      audiences.forEach(function transform(aud, idx) {
        const datum = data[idx];

        if (datum) {
          const pickFields = fields[aud];
          output[aud] = mapValues(datum, JSONParse);
          if (pickFields) {
            output[aud] = pick(output[aud], pickFields);
          }
        } else {
          output[aud] = {};
        }
      });

      return output;
    });
};
