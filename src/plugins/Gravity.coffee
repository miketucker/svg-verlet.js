#<< plugins/BasePlugin

###
	
	VerletGravity: Applies a simple directional force to each point.

	If @useMobileTilt is enabled, the gyroscope data from the device will be used to determine the "down" direction

###


class plugins.Gravity extends plugins.BasePlugin
	x: 0
	y: 0.02
	points: null
	useMobileTilt: true

	constructor: (y,x,@useMobileTilt = true) ->
		@y = y if y?
		@x = x if x?

		# console.log @x, @y

	init: (@scene) =>
		@points = []
		for p in @scene.points
			@points.push(p) unless p.locked

		if @useMobileTilt && @scene.isMobile()
			window.ondevicemotion = (e) =>
				@x = parseFloat(e.accelerationIncludingGravity.x) * .03
				@y = parseFloat(e.accelerationIncludingGravity.y) * -.03

	update: =>
		timeStep = BaseScene.currentTimeStep
		x = @x * timeStep
		y = @y * timeStep
		for p in @points
			p.force( x , y )
