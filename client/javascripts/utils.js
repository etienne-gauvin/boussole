export default {

	/**
	 * Calculate difference between two angles (360)
	 * @param <Number> origin
	 * @param <Number> target
	 * @return <Number>
	 */
	calculateAngleBetweenDirections(origin, target) {

		const n = origin - target + 180

		return (n - Math.floor(n / 360) * 360) - 180

	},

	/**
	 * Calculate angle between two coordinates
	 * @param <Coordinates> origin
	 * @param <Coordinates> target
	 * @return <Number> angle in degrees
	 */
	calculateDirectionToCoordinates(origin, target) {

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

	    angle = 360 - angle; // count degrees counter-clockwise - remove to make clockwise

	    return angle;
	}

}