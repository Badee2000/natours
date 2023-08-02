const mongoose = require('mongoose');
const dotenv = require('dotenv');

//HANDLE ANY UNCAUGHT EXCEPTIONS
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Closing server...');
  console.log(err.name, err.message);
  //We can shutdown without closing the server because UNCAUGHT EXCEPTIONS
  //Are not going to happen asynchronously
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('DB connection successful!');
  });

const port = process.env.PORT;
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Server listening on port 3000');
});

//HANDLE ANY PROMISE REJECTIONS
process.on('unhandledRejection', (err) => {
  //The application is not going to work at all so it is better to shut down our application.
  console.log('UNHANDELR REJECTION! Closing server...');
  console.log(err.name, err.message);
  //It is better to close the server before shutting down to give the server the time to finish all the requests.
  server.close(() => {
    console.log('SHUTTING DOWN...');
    //Code 0 stands for success, And the code 1 stands for uncaught exception.
    process.exit(1);
  });
});
