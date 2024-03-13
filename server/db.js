const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/unit4_career_sim');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT = process.env.JWT || 'shhh';

const createTables = async () => {
  const SQL = `
      DROP TABLE IF EXISTS cart_products;
      DROP TABLE IF EXISTS carts;
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS products;
      CREATE TABLE products(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50),
        available BOOLEAM DEFAULT FALSE,
        qty INTEGER DEFAULT 0
        //able to use imgs?
      );
      CREATE TABLE users(
        id SERIAL PRIMARY KEY
        name VARCHAR(255),
        email VARCHAR(50),
        password VARCHAR(50),
        admin BOOLEAN DEFAULT FALSE,
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
      )
    `;
  await client.query(SQL);
};

const createUser = async ({ name, email, password, admin }) => {
  const SQL = `
      INSERT INTO users(id,name,email,password,admin) VALUES($1, $2, $3, $4, $5) RETURNING *
    `;
  const response = await client.query(SQL, [uuid.v4(), name, email, await bcrypt.hash(password, 5)]);
  return response.rows[0];
};

//creating jwt tokens
const authenticate = async ({ username, password }) => {
  const SQL = `
      SELECT id, password, username
      FROM users
      WHERE username = $1
    `;
  const response = await client.query(SQL, [username]);
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

module.exports = {
  client,
  createTables,
  createUser
};