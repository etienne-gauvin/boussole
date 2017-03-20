document.addEventListener("DOMContentLoaded", (event) => {

	const compassElement = document.querySelector('.compass')
	const needleElement = document.querySelector('.compass .red.needle')
	const greenNeedleElement = document.querySelector('.compass .green.needle')

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

	// Dernier angle donné
	let lastRawAngle = 0

	// Angle visuel de l'aiguille
	let angle = 0

	// Vélocité de l'aiguille
	let velocity = 0

	/**
	 * Nouvel angle donné par le device
	 */
	function onCompassUpdate(rawAngle) {
		const now = +new Date

		// Différence entre les deux derniers angles
		let diff = getDiffBetweenAngles(rawAngle, lastRawAngle)

		// Nouvel angle -+Infini
		// pour éviter les transitions étranges (l'aiguille qui fait le tour du cadran, par ex.)
		lastRawAngle += diff

		//greenNeedleElement.style.transform = `rotate(${lastRawAngle}deg)`
	}

	/** 
	 * Mise à jour de la vélocité de l'aiguille
	 * Séparée de la requestAnimationFrame pour ne pas surcharger
	 */
	function updateVelocity() {
		const diff = getDiffBetweenAngles(lastRawAngle, angle)
		velocity = velocity * 0.5 + diff * 2
	}

	// Dernier instant enregistré d'affichage d'une frame
	let previousTime = +new Date

	/**
	 * Mise à jour visuelle de l'aiguille
	 * @param <Number> time
	 */
	function updateNeedle(time) {

		// Changement d'angle en fonction de la vélocité
		angle += velocity * ((time - previousTime) / 1000)

		// Application à l'élément visuel
		needleElement.style.transform = `rotate(${angle}deg)`

		previousTime = time
		window.requestAnimationFrame(updateNeedle)
	}

	window.requestAnimationFrame(updateNeedle)
	setInterval(updateVelocity, 200)

	/**
	 * Calcul de la différence entre les deux angles (360)
	 * @param <Number> a
	 * @param <Number> b
	 * @return <Number>
	 */
	function getDiffBetweenAngles(a, b) {
		let diff = a - b + 180
		return (diff - Math.floor(diff / 360) * 360) - 180
	}

})