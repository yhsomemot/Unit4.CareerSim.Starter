const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/unit4_career_sim');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT = process.env.JWT || 'shhh';

const createTables = async() => {
  const SQL = `
      DROP TABLE IF EXISTS cart_products;
      DROP TABLE IF EXISTS carts;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS products;
      CREATE TABLE products(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50),
        is_available BOOLEAM DEFAULT FALSE,
        price INTEGER DEFAULT 0,
        description VARCHAR(255),
        qty INTEGER DEFAULT 0
      );
      CREATE TABLE users(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(50),
        password VARCHAR(50),
        is_admin BOOLEAN DEFAULT FALSE,
        UNIQUE (email)
      );
      CREATE TABLE carts(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id SERIAL REFERENCES user(id) NOT NULL 
      );
      CREATE TABLE cart_products(
        cart_id UUID REFERENCES carts(id) NOT NULL,
        product_id UUID REFERENCES products(id) NOT NULL,
        qty INTEGER REFERENCES products(qty) NOT NULL
      );
    `;
  await client.query(SQL);
};

const createUser = async ({ email, password, is_admin }) => {
  const SQL = `
      INSERT INTO users(id, email, password, is_admin) VALUES($1, $2, $3, $4) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), email, await bcrypt.hash(password, 5),is_admin]);
  return response.rows[0];
};

const createProduct = async ({ name, is_available, price, description, qty }) => {
  const SQL = `
    INSERT INTO products(id, name, is_available, price, description, qty) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name, is_available, price, description, qty]);
  return response.rows[0];
};

const createCarts = async({ user_id })=> {
  const SQL = `
    INSERT INTO carts(id, user_id) VALUES($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id]);
  return response.rows[0];
};

const createCartProducts = async({ cart_id, user_id, qty })=> {
  const SQL = `
    INSERT INTO cart_products(cart_id, product_id, qty) VALUES($1, $2, $3) RETURNING *
  `;
  const response = await client.query(SQL, cart_id, user_id, qty);
  return response.rows[0];
};

//creating jwt tokens
const authenticate = async ({ email, password }) => {
  const SQL = `
      SELECT id, password, email
      FROM users
      WHERE email = $1
    `;
  const response = await client.query(SQL, [email]);
  if (!response.rows.length || (await bcrypt.compare(password, response.rows[0].password)) === false) {
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  const token = await jwt.sign({ id: response.rows[0].id }, JWT);
  return { token: response.rows[0].id };
};

//useing jwt token to secure the login process
const findUserWithToken = async (token) => {
  let id;
  console.log("insidefinduserwithtoken")
  console.log("passed token " + token)
  try {
    const payload = await jwt.verify(token, JWT);
    id = payload.id;
  } catch (ex) {
    const error = Error('not authorized');
    error.status = 401;
    throw error;

  }
  const SQL = `
      SELECT id, username FROM users WHERE id=$1;
    `;
  const response = await client.query(SQL, [id]);
  if (!response.rows.length) {
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  return response.rows[0];
};

const fetchUsers = async()=> {
  const SQL = `
    SELECT id, email, is_admin FROM users;
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async()=> {
  const SQL = `
    SELECT * FROM products;
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchCarts = async(user_id)=> {
  const SQL = `
    SELECT * FROM carts where user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

const fetchCartProducts = async(user_id)=> {
  const SQL = `
    SELECT * FROM cart_products
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  createCarts,
  createCartProducts,
  authenticate,
  findUserWithToken,
  fetchProducts,
  fetchUsers,
  fetchCarts,
  fetchCartProducts

};