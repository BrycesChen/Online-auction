import * as http from 'http'

const server = http.createServer((request, response) => {
    response.end('Hell Node!');
});

server.listen(8000);