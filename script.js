document.addEventListener("DOMContentLoaded", (event) => {

	const compassElement = document.querySelector('.compass')
	const needleElement = document.querySelector('.compass .needle')

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

	if ('DeviceOrientationEvent' in window) {
		window.addEventListener('deviceorientation', (event) => onCompassUpdate(event.alpha), false)
	}
	else {
		window.alert("La boussole n'est pas disponible.")
	}

	function onCompassUpdate(angle) {
		needleElement.style.transform = `rotate(${+angle}deg)`
		console.log(`rotate(${+angle}deg)`)
	}

})