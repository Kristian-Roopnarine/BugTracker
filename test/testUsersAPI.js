const dotenv = require('dotenv');
dotenv.config({ path: './../.env' });
const assert = require('chai').assert;
const expect = require('chai').expect;
const db = require('./../db');

describe('User API', function () {
  it('should return true', function () {
    assert.equal(5, 5);
  });
});
