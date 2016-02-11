/**
 * @module  glsl-to-float
 */

module.exports = function unpackFloat(uint8array) {
	return new Float32Array(uint8array.buffer);
}