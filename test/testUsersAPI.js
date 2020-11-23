process.env.NODE_ENV = 'test';
const server = require('./../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
chai.use(chaiHttp);

const userApiURL = '/api/v1/users';
// maybe make functions to create requests?
describe('User API', function () {
  it('GET / should return an array of users', (done) => {
    chai
      .request(server)
      .get(userApiURL + '/')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.users.should.be.a('array');
        done();
      });
  });
});
