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
		window.addEventListener('deviceorientation', (event) => onCompassUpdate(event.alpha))
	}
	else {
		window.alert("La boussole n'est pas disponible.")
	}

	let angle = 0

	function onCompassUpdate(normalizedAngle) {

		// Différence entre les deux derniers angles
		let diff = normalizedAngle - angle
		diff = ((diff + 180) - Math.floor((diff + 180) / 360) * 360) - 180

		// Nouvel angle -+Infini
		// pour éviter les transitions étranges (l'aiguille qui fait le tour du cadran, par ex.)
		angle += diff

		needleElement.style.transitionDuration = `${Math.abs(diff) * 8}ms`
		needleElement.style.transform = `rotate(${angle}deg)`
	}

})