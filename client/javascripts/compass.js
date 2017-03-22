import utils from './utils'

export default class Compass {

	constructor(element) {
		
		this.needleElement = element.querySelector('.red.needle')
		
		// Last angle
		this.targetedAngle = 0

		// Visual angle of the needle
		this.visibleAngle = 0

		// Needle velocity 
		this.velocity = 0

		// Last time a frame was updated
		this.lastTime = +new Date

		// Last time the velocity was updated
		this.lastVelocityUpdateTime = -Infinity

	}

	/**
	 * Évènements
	 */
	start() {

		window.requestAnimationFrame(this.update.bind(this))

	}

	/**
	 * Nouvel angle donné par le device
	 * @param <Number> angle
	 */
	set angle(angle) {

		const now = +new Date

		// Difference between the last two angles
		let diff = utils.calculateAngleBetweenDirections(angle, this.targetedAngle)

		// New angle -+Infini
		// to avoid strange transitions
		// (the needle doing a full circle between 350° and 10°, for example)
		this.targetedAngle += diff

	}

	/**
	* @return <Number>
	 */
	get angle() {

		return this.targetedAngle

	}

	/** 
	 * Updating velocity
	 * Separate from display update for performance
	 */
	updateVelocity() {

		const diff = utils.calculateAngleBetweenDirections(this.targetedAngle, this.visibleAngle)
		
		this.velocity = this.velocity * 0.5 + diff * 2

	}

	/**
	 * Update visible angle of the needle
	 * @param <Number> time
	 */
	update(time) {

		this.visibleAngle += this.velocity * ((time - this.lastTime) / 1000)

		this.needleElement.style.transform = `rotate(${this.visibleAngle}deg)`

		this.lastTime = time

		if (time - this.lastVelocityUpdateTime > 200) {

			this.lastVelocityUpdateTime = time
			
			this.updateVelocity()

		}

		window.requestAnimationFrame(this.update.bind(this))

	}

}