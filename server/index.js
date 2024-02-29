
// table name users
// email primary key (how do we make something a primary key?) have a constraint to not allow null
// password string varchar have a constraint to now allow null
// first name s
// last name s
// address string varchar not null
// payment info string varchar
// phone number string
// logged in boolean default false
// admin boolean default false


// SELECT * FROM users;
// to get all the admins = SELECT * FROM users WHERE admin = true;
// to get a specific user by email address = SELECT * FROM users WHERE email = 'email@email.com';

// seeding with information
//DROP TABLE if exists users

const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_notes_db')
const app = express()

//app routes
app.use(express.json());
app.use(require('morgan')('dev'));
app.post('/api/notes', async (req, res, next) => {});
app.get('/api/notes', async (req, res, next) => {
    try{
        const SQL = `SELECT * from notes ORDER BY created_at DESC;`
        const result = await client.query(SQL)
        res.send(result.rows)

    } catch (error) {
        next(error)
    }
});
app.put('/api/notes/:id', async (req, res, next) => {});
app.delete('/api/notes/:id', async (req, res, next) => {});

const init = async () => {
    await client.connect();
    console.log('connected to database')
    let SQL = `DROP TABLE IF EXISTS notes;
    CREATE TABLE notes(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ranking INTEGER DEFAULT 3 NOT NULL,
    txt VARCHAR(255) NOT NULL
    );`
    await client.query(SQL)
    console.log('tables created')
    SQL = ` INSERT INTO notes(txt, ranking) VALUES('learn express', 5);
    INSERT INTO notes(txt, ranking) VALUES('write SQL queries', 4);
    INSERT INTO notes(txt, ranking) VALUES('create routes', 2);`;
    await client.query(SQL);
    console.log('data seeded');

    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
}

init()