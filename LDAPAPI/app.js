import createError from 'http-errors';
import express, { json } from 'express';
import logger from 'morgan';
import routes from './routes/index.js';

const app = express();

app.use(logger('dev'));
app.use(json());

app.use('/api', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.ENV === 'development' ? err : {};

  res.status(err.status || 500);
});

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
