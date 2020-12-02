process.env.NODE_ENV = 'test';
const server = require('./../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const Users = require('./../models/userSchema');
const should = chai.should();
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

async function addTestUser(model) {
  return await model.create({
    firstName: 'bob',
    lastName: 'test',
    email: 'testing@testing.com',
    password: '123',
    passwordConfirm: '123',
  });
}

////////////////////////////////////////
// TEST HELPER FUNCTIONS
///////////////////////////////////////

function testCreateUserWrongPassword(done) {
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
}
function testSignupEndpoint(done) {
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
}
function testEmailExistsOnSignup(done) {
  const userData = {
    firstName: 'bob',
    lastName: 'test',
    email: 'testing@testing.com',
    password: '123',
    passwordConfirm: '123',
  };
  makePostRequest(server, userApiURL + signupEndpoint, userData).end(
    (err, res) => {
      res.should.have.status(500);
      done();
    }
  );
}
function testLogin(done) {
  const loginData = {
    email: 'testing@testing.com',
    password: '123',
  };
  makePostRequest(server, userApiURL + loginEndpoint, loginData).end(
    (err, res) => {
      res.should.have.status(200);
      done();
    }
  );
}
function testLoginIncorrectPassword(done) {
  const loginData = {
    email: 'testing@testing.com',
    password: '12',
  };

  makePostRequest(server, userApiURL + loginEndpoint, loginData).end(
    (err, res) => {
      res.should.have.status(404);
      console.log(res.body);
      const { message } = res.body;
      expect(message).to.be.eq('Incorrect email or password');
      done();
    }
  );
}
function testLoginIncorrectEmail(done) {
  const loginData = {
    email: 'tng@testing.com',
    password: '123',
  };

  makePostRequest(server, userApiURL + loginEndpoint, loginData).end(
    (err, res) => {
      res.should.have.status(404);
      const { message } = res.body;
      expect(message).to.be.eq('Incorrect email or password');
      done();
    }
  );
}
function testEmailPassNotProvided(done) {
  const loginData = {
    email: '',
    password: '',
  };
  makePostRequest(server, userApiURL + loginEndpoint, loginData).end(
    (err, res) => {
      res.should.have.status(404);
      const { message } = res.body;
      expect(message).to.be.eq('Please enter email or password');
      done();
    }
  );
}

////////////////////////////////////////
// UNIT TESTS
///////////////////////////////////////
describe('User API', function () {
  beforeEach(async function () {
    await Users.deleteMany({});
    return addTestUser(Users);
  });
  it('GET / should return an array of users', (done) => {
    makeGetRequest(server, userApiURL + homeEndpoint).end((err, res) => {
      res.should.have.status(200);
      res.body.data.users.should.be.a('array');
      done();
    });
  });

  it('POST /signup should return validation error when confirmPassword and Password are not the same', (done) => {
    testCreateUserWrongPassword(done);
  });

  it('POST /signup should return 200 on successful user creation', (done) => {
    testSignupEndpoint(done);
  });

  it('POST /signup should return 500 if user with email already exists', (done) => {
    testEmailExistsOnSignup(done);
  });

  it('POST /login shoudl return 200 if login credentials are correct.', (done) => {
    testLogin(done);
  });

  it('POST /login should return 404 if password is incorrect are not correct', (done) => {
    testLoginIncorrectPassword(done);
  });

  it('POST /login should return 404 if email does not exist are not correct', (done) => {
    testLoginIncorrectEmail(done);
  });

  it('POST /login should return 404 if email or password is not provided', (done) => {
    testEmailPassNotProvided(done);
  });
});
