const http = require('http');
const fs = require('fs');

const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    password: '1234',
    port: 5432
});

async function createTable() {
    await client.connect();
    await client.query(`
    CREATE TABLE IF NOT EXISTS employee (
      id TEXT NOT NULL,
      name TEXT,
      city TEXT,
      doj TEXT
    );
    CREATE TABLE IF NOT EXISTS city (
        id TEXT NOT NULL,
        city TEXT
      );
  `);
}

createTable();
const server = http.createServer(function (request, response) {
    if (request.url === '/' && request.method === 'GET') {
        fs.readFile('index.html', 'ascii', (err, content) => {
            response.end(content);
        });

    } else if (request.url === '/send-here' && request.method === 'POST') {
        request.on('data', (body) => {
            //! saving the data on database

            const data = Object.fromEntries(body.toString().split('&').map((ele) => { return ele.split('=') }));
            // console.log(data);
            client.query(`
                INSERT INTO employee VALUES('${data.id}', '${data.name}','${data.city}','${data.doj}');
                INSERT INTO city VALUES('${data.id}','${data.city}');
            `).then(() => {
            response.end('got the data');
          });
        });
    } else if (request.url === '/employee') {
        //! show all the data

        const data = client.query(`SELECT * FROM employee;`).then((result)=>{
            console.log(result.rows);
            response.end(JSON.stringify(result.rows))
        })
    } else if (request.url === '/city') {
        //! show all the data

        const data = client.query(`SELECT * FROM city;`).then((result)=>{
            console.log(result.rows);
            response.end(JSON.stringify(result.rows))
        })
    } else if (request.url === '/about') {
        response.end("this is about section");
    } else {
        response.end("404 page not found");
    }
});

let PORT = 5345;
server.listen(PORT);