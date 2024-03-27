const {
  client,
  createTables,
  createUser,
  createProduct,
  createCartedProducts,
  updateUser,
  updateProduct,
  updateCartedProducts,
  deleteUser,
  deleteProduct,
  deleteCartedProduct,
  authenticate,
  findUserWithToken,
  fetchProducts,
  fetchUsers,
  fetchCartedProducts,
  fetchSingleProduct
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

//compose middleware to ensure a logged in user (and resgistered)
const isLoggedIn = async (req, res, next) => {
  try {
    req.user = await findUserWithToken(req.headers.authorization);
    next();
  }
  catch (ex) {
    next(ex);
  }
};
//const isAdmin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user.is_admin){
      res.status(401).send("Error");
    }
    next();
  } catch (ex) {
    next(ex);
  }
};

//auth: ensure that there is a valid token (use the middleware in the /api/auth/me route)
//login
app.post('/api/auth/login', async (req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  }
  catch (ex) {
    next(ex);
  }
});

//signup
app.post('/api/auth/register', async (req, res, next) => {
  try {
    res.send(await createUser(req.body));
  }
  catch (ex) {
    next(ex);
  }
});

app.get('/api/auth/me', isLoggedIn, async (req, res, next) => {
  try {
    res.send(await findUserWithToken(req.headers.authorization));
  }
  catch (ex) {
    next(ex);
  }
});

//fetchUserInfo returns array of users
app.get('/api/users', isLoggedIn, async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  }
  catch (ex) {
    next(ex);
  }
});

//returns an array of cartedProducts for a user ???????????
app.get('/api/users/:id/cartedProducts', isLoggedIn, async (req, res, next) => {
  try {
    res.send(await fetchCartedProducts(req.params.id));
  }
  catch (ex) {
    next(ex);
  }
});

//returns an an array of products
app.get('/api/products', async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  }
  catch (ex) {
    next(ex);
  }
});
//returns single product
app.get('/api/product/:id', async (req, res, next) => {
  try {
    res.send(await fetchSingleProduct({id: req.params.id}));
  } catch (ex) {
    next(ex);
  }
});
//admin only. createProduct
app.post('/api/products', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    res.status(201).send(await createProduct(req.body));
  } catch (ex) {
    next(ex);
  }
});
//updateProduct //admin only
app.put('/api/product/:id', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    res.status(201).send(await updateProduct({...req.body, id: req.params.id}));
  } catch (ex) {
    next(ex);
  }
});
//updateUsers
app.put('/api/user/:id', isLoggedIn, async (req, res, next) => {
  try {
    res.status(201).send(await updateUser({...req.body, id: req.params.id}));
  } catch (ex) {
    next(ex);
  }
});
//update cartedProducts
app.put('/api/user/:userId/cartedProducts/:id', isLoggedIn, async (req, res, next) => {
  try {
    //if no object to wrap params, don't include curly brackets.
    res.status(201).send(await updateCartedProducts( req.params.userId, req.params.id));
  } catch (ex) {
    next(ex);
  }
});
//deleteProduct //admin only
app.delete('/api/users/:userId/products/:id', isLoggedIn, isAdmin, async (req, res, next) => {
  try {
    res.status(204).send(await deleteProduct({user_id: req.params.id}));
  } catch (ex) {
    next(ex);
  }
});

//deleteUser
app.delete('/api/users/:id', isLoggedIn, async (req, res, next) => {
  try {
    res.status(204).send(await deleteUser({id: req.params.id}));
  } catch (ex) {
    next(ex);
  }
});
//addToCart
app.post('/api/users/:id/cartedProducts', isLoggedIn, async (req, res, next) => {
  try {
    res.status(201).send(await createCartedProducts({ user_id: req.params.id, product_id: req.body.product_id }));
  }
  catch (ex) {
    next(ex);
  }
});
//removeFromCart
app.delete('/api/users/:userId/cartedProduct/:id', isLoggedIn, async (req, res, next) => {
  try {
    await deleteCartedProduct({ user_id: req.params.userId, product_id: req.params.id });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

//delete after checkout


app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message ? err.message : err });
});

const init = async () => {
  const port = process.env.PORT || 3000;
  await client.connect();
  console.log('connected to database');

  await createTables();
  console.log('tables created');

  const [moe, lucy, ethyl, curly, foo, bar, bazz, quq, fip] = await Promise.all([
    createUser({ email: 'moe@email.com', password: 'm_pw', address: 'Texas', is_admin: false }),
    createUser({ email: 'lucy@email.com', password: 'l_pw', address: 'Canada', is_admin: true }),
    createUser({ email: 'ethyl@email.com', password: 'e_pw', address: 'Norway', is_admin: false }),
    createUser({ email: 'curly@email.com', password: 'c_pw', address: 'Miami', is_admin: false }),
    createProduct({ name: 'foo', price: 9, description: 'fee fi foo fum', inventory: 20 }),
    createProduct({ name: 'bar', price: 14 }),
    createProduct({ name: 'bazz' }),
    createProduct({ name: 'quq' }),
    createProduct({ name: 'fip' })
  ]);

  // console.log("users", await fetchUsers());
  // console.log("products", await fetchProducts());

  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
