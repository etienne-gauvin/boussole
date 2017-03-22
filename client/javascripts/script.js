import Compass from './compass'

document.addEventListener("DOMContentLoaded", (event) => {

	const compass = new Compass
	compass.start()

	if ('geolocation' in navigator) {
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
	else {
		window.alert("Le service de géolocalisation n'est pas disponible.")
	}

	function onPositionUpdateSuccess(position) {
		console.log(position)
	}

	function onPositionUpdateError(error) {
		console.log(error)
	}

})