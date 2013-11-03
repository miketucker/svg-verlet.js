###
	
	VerletPoint: Tracks the location and force of a point.

	VerletStick updates the force each frame

###

class verlet.Point
	down: false

	oldX: null
	oldY: null

	originalX: 0
	originalY: 0

	x: 0
	y: 0

	forceX: 0
	forceY: 0

	@scene: null

	constructor: (@x, @y, @locked = false) ->
		@originalX = @oldX = @x
		@originalY = @oldY = @y

	setPos: (x, y) ->
		@x = @oldX = x
		@y = @oldY = y

	force: (x, y) ->
		@forceX += x
		@forceY += y

	update: ->
		return null if @dead || @down || @locked

		tempX = @x
		tempY = @y

		@x += @x - @oldX + @forceX
		@y += @y - @oldY + @forceY

		@oldX = tempX
		@oldY = tempY

		@forceX = 0
		@forceY = 0

		return null