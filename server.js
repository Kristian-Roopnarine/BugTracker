const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });
const app = require('./app');

const dbString =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_LOCAL_URL
    : process.env.DATABASE_TEST_URL;

mongoose
  .connect(dbString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Connection successful'))
  .catch((err) => console.log(err));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
