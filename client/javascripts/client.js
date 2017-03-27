import Compass from './compass'
import utils from './utils'

export default class Client {

	constructor() {
		
		this.socket = null

		this.lastCoordinatesSentTime = -Infinity

		this._position = 0
		this._deviceDirection = 0
		this._directionToTarget = 0

		this.compass = new Compass(document.querySelector('.compass'))
		this.compass.start()

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

		this.update()

	}

	get connected() {

		return this.socket && this.socket.connected

	}

	start() {

		this.connectToServer()
			.then(this.watchOrientation.bind(this), this.error.bind(this))
			.then(this.watchPosition.bind(this), this.error.bind(this))
 
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

			this.socket.on('direction', (direction) => {

				console.info('Got new new direction from server:', direction)

				this.directionToTarget = direction

			})
			
			this.socket.on('disconnect', () => {

				console.warn(`Disconnected from server`)

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

		if (this.connected && position) {

			console.log('Sending new coords to server:', position.coords)

			this.socket.emit('coordinates', position.coords)

		}

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




	}

	/**
	 * Error
	 */
	error(message) {

		console.error(message)

	}
}