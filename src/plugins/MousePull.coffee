#<< plugins/BasePlugin

###
	
	VerletMousePull: Applies a radial gravity towards the mouse (or touch input) to each point 

###


class plugins.MousePull extends plugins.BasePlugin
	mouse:
		x: -9999
		y: -9999
		down: 0

	strength: 0.001
	downStrength: 0.01

	svg: null
	scene: null
	points: null

	@offsetX: 0
	@offsetY: 0

	constructor: (strength, mouseDownStrength) ->
		@strength = strength if strength?
		@downStrength = mouseDownStrength if mouseDownStrength?

	init: (@scene) =>
		@dom = @scene.dom

		@points = []
		for p in @scene.points
			@points.push(p) unless p.locked
		
		if @scene.isMobile()
			@initMobile()
		else
			@initDesktop()

		$(window).resize @onResize
		@scene.dom.addEventListener "onSceneLoaded", @onResize, false
		@onResize()

	unload: =>
		# console.log("unload")
		$(window).unbind( "resize", @onResize )
		@scene.dom.removeEventListener "onSceneLoaded", @onResize

		if @scene.isMobile()
			document.removeEventListener "touchmove"
			document.removeEventListener "touchend"
			document.removeEventListener "touchstart"	
		else
			document.removeEventListener "mousemove", @onMouseMove
			document.removeEventListener "mousedown", () => @mouse.down = 2
			document.removeEventListener "mouseup", () => @mouse.down = 1


	onResize: =>
		ww = $(window).width()
		wh = $(window).height()

		@offsetX = $(@dom).offset().left 
		@offsetY = $(@dom).offset().top 

	initMobile: =>

		@strength = .1
		@downStrength = 1

		document.addEventListener "touchmove", @onTouchMove
		document.addEventListener "touchend", (e) => 
			@mouse.down = 0
			@mouse.x = -9999
			@mouse.y = -9999

		document.addEventListener "touchstart", (e) => 
			@mouse.down = 1

	initDesktop: ->
		@mouse.down = 1
		document.addEventListener "mousemove", @onMouseMove
		document.addEventListener "mousedown", () => @mouse.down = 2
		document.addEventListener "mouseup", () => @mouse.down = 1


	onMouseMove: (e) =>
		@offsetX = $(@dom).offset().left 
		@offsetY = $(@dom).offset().top 
		
		@mouse.x = e.pageX - @offsetX
		@mouse.y = e.pageY - @offsetY

	onTouchMove: (e) =>
		@mouse.x = e.touches[0].pageX - @offsetX
		@mouse.y = e.touches[0].pageY - @offsetY
		e.preventDefault()
		return null

	update: () =>
		return if @mouse.down < 1
		amt = (if (@mouse.down > 1) then @downStrength else @strength)
		amt *= (BaseScene.currentTimeStep * 0.1)
		mx = @mouse.x
		my = @mouse.y
		for p in @points
			dx = p.x - mx
			dy = p.y - my
			if dx * dx + dy * dy < 10000
				p.force( (mx - p.x) * amt , (my - p.y) * amt ) 