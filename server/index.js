const {
  client,
  createTables,
  createUser,
  createProduct,
  createCarts,
  fetchUsers,
  fetchCarts,
  fetchProducts,
  authenticate,
  findUserWithToken
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

//secure routes which need to verify the logged in user (adding isLoggedIn)
//auth
app.post('/api/auth/login', async (req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  }
  catch (ex) {
    next(ex);
  }
});

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

app.get('/api/users', async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  }
  catch (ex) {
    next(ex);
  }
});

app.get('/api/users/:id/carts', async (req, res, next) => {
  try {
    res.send(await fetchCarts(req.params.id));
  }
  catch (ex) {
    next(ex);
  }
});

// app.post('/api/users/:id/favorites', isLoggedIn, async(req, res, next)=> {
//   try {
//     res.status(201).send(await createFavorite({ user_id: req.params.id, product_id: req.body.product_id}));
//   }
//   catch(ex){
//     next(ex);
//   }
// });

app.get('/api/products', async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  }
  catch (ex) {
    next(ex);
  }
});

app.delete('/api/users/:user_id/cart_products')

//app.delete(products)
//functionality i need for site
//admin get all users, products, carts 
//admin delete all users, products
//admin change products

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
    createUser({ email: 'moe@email.com', password: 'm_pw', is_admin: false }),
    createUser({ email: 'lucy@email.com', password: 'l_pw', is_admin: false }),
    createUser({ email: 'ethyl@email.com', password: 'e_pw', is_admin: false }),
    createUser({ email: 'curly@email.com', password: 'c_pw', is_admin: false}),
    createProduct({ name: 'foo' }),
    createProduct({ name: 'bar' }),
    createProduct({ name: 'bazz' }),
    createProduct({ name: 'quq' }),
    createProduct({ name: 'fip' })
  ]);

  console.log(await fetchUsers());
  console.log(await fetchProducts());

  console.log(await fetchCarts(moe.id));
  // const favorite = await createCarts({ user_id: moe.id, product_id: foo.id });
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
