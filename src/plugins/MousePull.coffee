#<< plugins/BasePlugin

###
	
	VerletMousePull: Applies a radial gravity towards the mouse (or touch input) to each point 

###

lastUpdate = 0.0


class plugins.MousePull extends plugins.BasePlugin
	mouse:
		x: -9999
		y: -9999
		down: 0

	strength: 0.004
	downStrength: 0.01

	svg: null
	scene: null
	points: null

	@offsetX: 0
	@offsetY: 0

	constructor: (strength, mouseDownStrength) ->
		@strength = strength if strength?
		@downStrength = mouseDownStrength if mouseDownStrength?

	init: (@scene) ->
		@dom = @scene.dom
		@mouse.down = 0

		@points = []
		for p in @scene.points
			@points.push(p) unless p.locked
		
		if @scene.isMobile()
			@initMobile()
		else
			@initDesktop()

		$(window).resize @onResize
		@scene.dom.addEventListener "onSceneLoaded", @onResize
		@onResize()

	unload: =>
		# console.log("unload")
		$(window).unbind( "resize", @onResize )
		@scene.dom.removeEventListener "onSceneLoaded", @onResize

		document.removeEventListener "touchmove", @onTouchMove
		document.removeEventListener "touchend", @onTouchEnd
		document.removeEventListener "touchstart", @onTouchStart
		document.removeEventListener "mousemove", @onMouseMove
		document.removeEventListener "mousedown", @onMouseDown
		document.removeEventListener "mouseup", @onMouseUp
		# console.log("unload")

	onResize: =>
		ww = $(window).width()
		wh = $(window).height()

		@offsetX = $(@dom).offset().left 
		@offsetY = $(@dom).offset().top 

	initMobile: =>

		# @strength *= 2.0
		# @downStrength *= 0.1

		document.addEventListener "touchmove", @onTouchMove
		document.addEventListener "touchend", @onTouchEnd
		document.addEventListener "touchstart", @onTouchStart

	onTouchStart: =>
		@mouse.down = 1

	onTouchMove: =>
		@mouse.down = 0
		@mouse.x = -9999
		@mouse.y = -9999

	initDesktop: =>
		@mouse.down = 1
		document.addEventListener "mousemove", @onMouseMove
		document.addEventListener "mousedown", @onMouseDown
		document.addEventListener "mouseup", @onMouseUp

	onMouseDown: =>
		@mouse.down = 2

	onMouseUp: =>
		@mouse.down = 1

	onMouseMove: (e) =>
		@offsetX = $(@dom).offset().left 
		@offsetY = $(@dom).offset().top 
		
		@mouse.x = e.pageX - @offsetX
		@mouse.y = e.pageY - @offsetY

	onTouchMove: (e) =>
		@offsetX = $(@dom).offset().left 
		@offsetY = $(@dom).offset().top 
			

		@mouse.x = e.touches[0].pageX - @offsetX
		@mouse.y = e.touches[0].pageY - @offsetY


		e.preventDefault()
		return null

	update: () =>
		return if @mouse.down < 1

		amt = (if (@mouse.down > 1) then @downStrength else @strength)
		amt *= (BaseScene.currentTimeStep * 0.1)
		# console.log("mouse",amt)
		
		mx = @mouse.x
		my = @mouse.y
		for p in @points
			dx = p.x - mx
			dy = p.y - my
			if dx * dx + dy * dy < 10000
				p.force( (mx - p.x) * amt , (my - p.y) * amt ) 