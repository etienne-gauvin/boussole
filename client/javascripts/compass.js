export default class Compass {

	constructor() {
		
		this.needleElement = document.querySelector('.compass .red.needle')
		
		// Dernier angle donné
		this.lastRawAngle = 0

		// Angle visuel de l'aiguille
		this.angle = 0

		// Vélocité de l'aiguille
		this.velocity = 0

		// Dernier instant enregistré d'affichage d'une frame
		this.previousTime = +new Date

		// Dernier instant enregistré de màj de la vélocité
		this.lastVelocityUpdateTime = -Infinity

	}

	/**
	 * Évènements
	 */
	start() {

		if (window && 'DeviceOrientationEvent' in window) {
			
			window.addEventListener('deviceorientation', (event) =>

				this.onCompassUpdate(event.alpha)

			)

		}
		
		else {

			console.error("La boussole n'est pas disponible.")

		}

		window.requestAnimationFrame(this.updateNeedle.bind(this))
		window.setInterval(this.updateVelocity.bind(this), 200)

	}

	/**
	 * Nouvel angle donné par le device
	 */
	onCompassUpdate(rawAngle) {

		const now = +new Date

		// Différence entre les deux derniers angles
		let diff = this.getDiffBetweenAngles(rawAngle, this.lastRawAngle)

		// Nouvel angle -+Infini
		// pour éviter les transitions étranges
		// (l'aiguille qui fait le tour du cadran, par ex.)
		this.lastRawAngle += diff

	}

	/** 
	 * Mise à jour de la vélocité de l'aiguille
	 * Séparée de la requestAnimationFrame pour ne pas surcharger
	 */
	updateVelocity() {

		const diff = this.getDiffBetweenAngles(this.lastRawAngle, this.angle)
		
		this.velocity = this.velocity * 0.5 + diff * 2

	}

	/**
	 * Mise à jour visuelle de l'aiguille
	 * @param <Number> time
	 */
	updateNeedle(time) {

		// Changement d'angle en fonction de la vélocité
		this.angle += this.velocity * ((time - this.previousTime) / 1000)

		// Application à l'élément visuel
		this.needleElement.style.transform = `rotate(${this.angle}deg)`

		this.previousTime = time

		window.requestAnimationFrame(this.updateNeedle.bind(this))

	}

	/**
	 * Calcul de la différence entre les deux angles (360)
	 * @param <Number> a
	 * @param <Number> b
	 * @return <Number>
	 */
	getDiffBetweenAngles(a, b) {

		const c = a - b + 180

		return (c - Math.floor(c / 360) * 360) - 180

	}

}