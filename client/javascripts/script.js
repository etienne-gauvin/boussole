import Compass from './compass'
import utils from './utils'

document.addEventListener("DOMContentLoaded", (event) => {

	let deviceDirection = 0
	let directionToTarget = 0

	const compass = new Compass(document.querySelector('.compass'))
	compass.start()

	if (window.DeviceOrientationEvent) {

		window.addEventListener('deviceorientation', (event) => {
		
			deviceDirection = event.alpha

			update()

		})

	}

	else console.error("La boussole n'est pas disponible.")

	if (window.navigator.geolocation) {

		window.navigator.geolocation.watchPosition(
			onPositionUpdateSuccess,
			onPositionUpdateError,
			{
				enableHighAccuracy: true,
				maximumAge: 30000,
				timeout: 27000
			}
		)

	}
	else console.error("Le service de géolocalisation n'est pas disponible.")

	function onPositionUpdateSuccess(position) {

		const a = { latitude: 48.117342, longitude: -1.708520 }
		const b = { latitude: 48.117086, longitude: -1.696259 }

		console.log(position)

		// directionToTarget = utils.calculateDirectionToCoordinates(a, b);
		directionToTarget = utils.calculateDirectionToCoordinates(position.coords, b);

		update()

	}

	function onPositionUpdateError(error) {
		console.log(error)
	}

	function update() {

		compass.angle = deviceDirection + directionToTarget

	}

})