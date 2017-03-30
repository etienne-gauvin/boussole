const port = process.env.npm_package_config_port

const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(express.static('client'))

http.listen(port, () => console.log(`Listening on *:${port}`))

const users = Object.create(null)

io.on('connection', (socket) => {

	const user = users[socket.id] = {
		socket: socket,
		target: null,
		coords: null
	}

	io.emit('users', getUserIds())

	socket.on('target user', (id) => {

		if (id && users[id]) {

			user.target = id

		}

	})

	socket.on('coordinates', (coords) => {

		console.log('Receiving new coordinates', coords)

		const isNull = user.coords === null

		user.coords = coords

		if (isNull)
			io.emit('users', getUserIds())


	})

	socket.on('disconnect', () => {

		delete users[socket.id]

	})

})

function sendAllDirections() {

	let user

	for (let id in users) {

		user = users[id]

		if (user.target && user.coords && users[user.target] && users[user.target].coords) {

			const direction = calculateDirectionToCoordinates(user.coords, users[user.target].coords)

			user.socket.emit('direction to target', direction)

		}

	}

}

setInterval(sendAllDirections, 3000)

function getUserIds() {

	const ids = []

	for (let id in users) {

		if (users[id].coords) {

			ids.push(id)

		}

	}

	return ids

}

/**
 * Calculate angle between two coordinates
 * @param <Coordinates> origin
 * @param <Coordinates> target
 * @return <Number> angle in degrees
 */
function calculateDirectionToCoordinates(origin, target) {

	const cos = Math.cos, sin = Math.sin

	const distance = (target.longitude - origin.longitude)

	const y = sin(distance) * cos(target.latitude)

	const x = cos(origin.latitude) * sin(target.latitude)
			- sin(origin.latitude) * cos(target.latitude)
			* cos(distance)

    let angle = Math.atan2(y, x)

    // Radians to degrees
    angle *= 180 / Math.PI

    angle = (angle + 360) % 360

    angle = 360 - angle // counter-clockwise - remove to make clockwise

    return angle
}