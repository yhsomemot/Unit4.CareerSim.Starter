const {} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());


//compose middleware to ensure a logged in user (and resgistered)
const isLoggedIn = async(req, res, next)=> {
    try {
      req.user = await findUserWithToken(req.headers.authorization);
      next();
    }
    catch(ex){
      next(ex);
    }
  };

  app.post('/api/auth/login', async(req, res, next)=> {
    try {
      res.send(await authenticate(req.body));
    }
    catch(ex){
      next(ex);
    }
  });

  app.post('/api/auth/register', async(req, res, next)=> {
    try {
      res.send(await createUser(req.body));
    }
    catch(ex){
      next(ex);
    }
  });

  //secure routes which need to verify the logged in user (adding isLoggedIn)
  app.get('/api/auth/me', isLoggedIn, async(req, res, next)=> {
    try {
      res.send(await findUserWithToken(req.headers.authorization));
    }
    catch(ex){
      next(ex);
    }
  });

  app.get('/api/users', async(req, res, next)=> {
    try {
      res.send(await fetchUsers());
    }
    catch(ex){
      next(ex);
    }
  });

