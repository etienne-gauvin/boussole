import Compass from './compass'
import utils from './utils'

export default class Client {

	constructor() {
		
		this.socket = null

		this.lastCoordinates = null
		this.lastCoordinatesSentTime = -Infinity

		this._position = 0
		this._deviceDirection = 0
		this._directionToTarget = 0
		this._users = []

		this.usersElement = document.querySelector('select[name="users"]')

		this.compass = new Compass('.compass .needle')
		this.compass.start()

		this.northCompass = new Compass('.compass .frame')
		this.northCompass.start()

	}

	get directionToTarget() { 

		return this._directionToTarget

	}

	set directionToTarget(directionToTarget) {

		this._directionToTarget = directionToTarget

		this.update()

	}

	get deviceDirection() { 

		return this._deviceDirection

	}

	set deviceDirection(deviceDirection) {

		this._deviceDirection = deviceDirection

		this.update()

	}

	get position() { 

		return this._position

	}

	set position(position) {

		this._position = position

		if (position && position.coords) {

			document.querySelector('output.position').innerHTML = `
				lat: ${Math.floor(position.coords.latitude * 1000) / 1000}
				<br />
				lng: ${Math.floor(position.coords.longitude * 1000) / 1000}
			`

		}

		this.update()

	}

	get connected() {

		return this.socket && this.socket.connected

	}

	set users(users) {

		const select = this.usersElement
		const disabledOption = select.querySelector('option:disabled')

		if (this.socket) {
			
			const currentUser = users.indexOf(this.socket.id)

			if (currentUser >= 0) {

				users.splice(currentUser, 1)

			}

		}

		if (!users || users.length === 0) {

			select.setAttribute('disabled', 'true')
			select.selectedItem = disabledOption
			disabledOption.innerHTML = disabledOption.getAttribute('data-nobody-text')

		}

		else {

			select.removeAttribute('disabled')
			disabledOption.innerHTML = disabledOption.getAttribute('data-target-text')

		}

		const options = Array.from(select.querySelectorAll('option.user'))

		for (let o in options) {

			const option = options[o]
			const user = users.find(user => user === option.value)

			if (user === null) {

				select.removeChild(option)

			}

		}

		for (let u in users) {

			const user = users[u]
			
			if (user !== this.socket.id) {

				let option = options.find(option => user === option.value)

				if (!option) {

					option = document.createElement('option')
					option.setAttribute('class', 'user')
					option.setAttribute('value', user)
					option.innerHTML = user

					select.appendChild(option)

				}

			}

		}

		this._users = users

	}

	get users() {

		return this._users

	}

	start() {

		this.reset()

		this.usersElement.addEventListener('change', event => {

			const option = this.usersElement.options[this.usersElement.selectedIndex]

			if (option && option.value) {

				console.log('Target user:', option.value)

				this.socket.emit('target user', option.value)

			}

		})

		this.watchOrientation()
			.then(this.watchPosition.bind(this), this.error.bind(this))
			.then(this.connectToServer.bind(this), this.error.bind(this))
 
	}

	/** 
	 * @return <Promise>
	 */
	connectToServer() {

		return new Promise((resolve, reject) => {

			this.socket = io()

			let intervalFunctionId

			this.socket.on('connect', () => {

				console.info(`Connected to server as ${this.socket.id}`)

				intervalFunctionId = window.setInterval(this.sendCoordinates.bind(this), 5000)

				resolve()

			})

			this.socket.on('users', (users) => {

				console.info('Got new user list from server:', users)

				this.users = users

			})
			
			this.socket.on('direction to target', (direction) => {

				console.info('Got new direction from server:', direction)

				this.directionToTarget = direction

			})
			
			this.socket.on('disconnect', () => {

				console.warn(`Disconnected from server`)

				this.users = []
				this.directionToTarget = 0

				window.clearInterval(intervalFunctionId)

			})
			
			this.socket.on('error', (error) => {

				console.error(error)

				window.clearInterval(intervalFunctionId)

				reject(error)

			})

		})

	}

	/** 
	 * @return <Promise>
	 */
	watchOrientation() {

		console.log('Getting orientation…')

		return new Promise((resolve, reject) => {

			if (window.DeviceOrientationEvent) {

				let gotOrientationOnce = false

				window.addEventListener('deviceorientation', event => {

					this.deviceDirection = event.alpha
					
					this.compass.angle = this.deviceDirection + this.directionToTarget

					if (!gotOrientationOnce) {

						gotOrientationOnce = true

						console.log('Got orientation!', this.deviceDirection)

						resolve()

					} 
				
				})

			}

			else reject("La boussole n'est pas disponible.")

		})

	}

	watchPosition() {

		console.log('Getting position…')

		return new Promise((resolve, reject) => {

			if (window.navigator.geolocation) {

				const parameters = {
					enableHighAccuracy: true,
					maximumAge: 30000,
					timeout: 27000
				}

				let gotPositionOnce = false

				window.navigator.geolocation.watchPosition(
					position => {

						this.position = position

						if (!gotPositionOnce) {

							gotPositionOnce = true

							console.log('Got position!', this.position)

							resolve()

						} 
					
					},
					() => reject("Le service de géolocalisation n'est pas disponible."),
					parameters
				)

			}

			else reject("Le service de géolocalisation n'est pas disponible.")

		})

	}

	/**
	 * Send coordinates
	 */
	sendCoordinates() {

		const position = this.position

		if (this.connected && position && position.coords) {

			const coordinates = {
				latitude: position.coords.latitude, 
				longitude: position.coords.longitude
			}

			if (!this.lastCoordinates ||
				coordinates.latitude  !== this.lastCoordinates.latitude ||
				coordinates.longitude !== this.lastCoordinates.longitude) {

				this.lastCoordinates = coordinates

				console.log('Sending new coords to server:', coordinates)

				this.socket.emit('coordinates', coordinates)
				
			}

		}

	}

	/**
	 * 
	 */
	reset() {

		this.users = []
		this.directionToTarget = 0

	}

	/**
	 * 
	 */
	update() {

		const now = +new Date

		if (this.lastCoordinatesSentTime < now - 5000) {

			this.lastCoordinatesSentTime = now
			this.sendCoordinates()

		}

		this.compass.angle = this.deviceDirection + this.directionToTarget
		this.northCompass.angle = this.deviceDirection

	}

	/**
	 * Error
	 */
	error(message) {

		console.error(message)

	}
}