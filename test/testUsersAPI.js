process.env.NODE_ENV = 'test';
const server = require('./../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();
const Users = require('./../models/userSchema');
chai.use(chaiHttp);

const userApiURL = '/api/v1/users';
const homeEndpoint = '/';
const signupEndpoint = '/signup';
const loginEndpoint = '/login';

function makeGetRequest(expressServer, url) {
  return chai.request(expressServer).get(url);
}
function makePostRequest(expressServer, url, data) {
  return chai.request(expressServer).post(url).send(data);
}

describe('User API', function () {
  beforeEach(async function () {
    await Users.deleteMany({});
    return await Users.create({
      firstName: 'bob',
      lastName: 'test',
      email: 'testing@testing.com',
      password: '123',
      passwordConfirm: '123',
    });
  });
  it('GET / should return an array of users', (done) => {
    makeGetRequest(server, userApiURL + homeEndpoint).end((err, res) => {
      res.should.have.status(200);
      res.body.data.users.should.be.a('array');
      done();
    });
  });

  it('POST /signup should return validation error when confirmPassword and Password are not the same', (done) => {
    const userData = {
      firstName: 'bob',
      lastName: 'test',
      email: 'testing1@testing.com',
      password: '123',
      passwordConfirm: '12',
    };
    makePostRequest(server, userApiURL + signupEndpoint, userData).end(
      (err, res) => {
        res.should.have.status(500);
        done();
      }
    );
  });

  it('POST /signup should return 200 on successful user creation', (done) => {
    const userData = {
      firstName: 'bob',
      lastName: 'test',
      email: 'testing1@testing.com',
      password: '123',
      passwordConfirm: '123',
    };
    makePostRequest(server, userApiURL + signupEndpoint, userData).end(
      (err, res) => {
        res.should.have.status(200);
        expect(res.body.status).to.be.eq('created');
        expect(res.body.token).to.be.a('string');
        const { email } = res.body.data;
        expect(res.body.data.email).to.be.eq(email);
        done();
      }
    );
  });

  it('POST /signup should return 500 if user with email already exists', (done) => {
    const userData = {
      firstName: 'bob',
      lastName: 'test',
      email: 'testing@testing.com',
      password: '123',
      passwordConfirm: '123',
    };
    makePostRequest(server, userApiURL + signupEndpoint, userData).end(
      (err, res) => {
        res.should.have.status(400);
        done();
      }
    );
  });

  // add tests for login
  // login with correct credentials
  // login with wrong passwords
  // login with email that can't find user
  // they should return the same error message.. Incorrect credentials.

  //  it('POST /login should return 200 if credentials are correct', (done) => {});
});
