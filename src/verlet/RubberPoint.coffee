#<< verlet/Point


###
	
	RubberPoint: Adds a force to the original position

	VerletStick updates the force each frame

###

class verlet.RubberPoint extends verlet.Point

	rubberAmplitude: 0.1
	rubberDamping: 0.1
	rubberForceX: 0
	rubberForceY: 0

	@maxAmp: 0.2
	@minAmp: 0.05

	constructor: (@x, @y, @locked = false) ->
		super(@x,@y,@locked)
		@rubberAmplitude = util.General.randomFromRange(verlet.RubberPoint.minAmp,verlet.RubberPoint.maxAmp)
		
	force: (x, y) ->
		@forceX += x
		@forceY += y

	update: ->
		return null if @dead || @down || @locked

		@rubberForceX = ( @originalX - @x ) * @rubberAmplitude * (BaseScene.currentTimeStep * 0.1)
		@rubberForceY = ( @originalY - @y ) * @rubberAmplitude * (BaseScene.currentTimeStep * 0.1)

		@x += ((@x + @rubberForceX) - @x) * 0.99
		@y += ((@y + @rubberForceY) - @y) * 0.99

		super()