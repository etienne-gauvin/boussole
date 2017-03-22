const port = process.env.npm_package_config_port

const io = require('socket.io')()
const express = require('express')
const app = express()
const http = require('http').Server(app)

app.use(express.static('client'))

http.listen(port, () => console.log(`Listening on *:${port}`))

io.on('connection', (socket) => {
	console.log('a user connected')
})
