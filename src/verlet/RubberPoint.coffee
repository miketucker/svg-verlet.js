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

	@maxAmp: 0.02
	@minAmp: 0.005

	constructor: (@x, @y, @locked = false) ->
		super(@x,@y,@locked)
		@rubberAmplitude = util.General.randomFromRange(verlet.RubberPoint.minAmp,verlet.RubberPoint.maxAmp)
		
	update: ->
		return null if @dead || @down || @locked

		@rubberForceX = ( @originalX - @x ) * @rubberAmplitude * BaseScene.currentTimeStep
		@rubberForceY = ( @originalY - @y ) * @rubberAmplitude * BaseScene.currentTimeStep

		@x += @rubberForceX
		@y += @rubberForceY

		super()

	@resetDefaults: ->
		verlet.RubberPoint.minAmp = 0.02
		verlet.RubberPoint.maxAmp = 0.005
