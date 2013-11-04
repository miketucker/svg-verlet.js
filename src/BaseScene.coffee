###

	BaseScene: Base class that is extended by SvgScene and PaperScene

###

class BaseScene

	isLoaded: false
	isPlaying: false

	dom: null

	options:
		container: "#container"
		verticalAlign: "center"
		horizontalAlign: "center"
		callback: null
		file: null

		parseColors:
			lock: "#FF0000"
			link: "#FF0000"		

	# maximum distance to join verlet points
	snapDist: 1.0

	#time
	lastFrameTime: 0.0
	@currentTimeStep: 0.0

	constructor: (options) ->
		@options.container = "#container"
		@options.verticalAlign = "center"
		@options.horizontalAlign = "center"
		@offsetY = 0
		@offsetX = 0
		@currentTimeStep = 0

		@points = []
		@sticks = []
		@stickLinks = []
		@elementPoints = []
		@statics = []
		@updates = []
		@plugins = []

		@quadTree = new util.QuadTree()
		@lastFrameTime = new Date().getTime()
		@isPlaying = true

	pause: ->
		@isPlaying = false

	unload: ->
		@isPlaying = false
		p.unload() for p in @plugins

	play: ->
		@isPlaying = true
		@update() if @isLoaded

	onLoaded: ->
		@isLoaded = true

	onInit: ->
		for e in @plugins
			e.init(@)
		@quadTree.clear()
		@update()

	update: =>
		currentTime = (new Date().getTime())
		BaseScene.currentTimeStep = Math.min(currentTime - @lastFrameTime,20)
		@lastFrameTime = currentTime

		e.update() for e in @plugins
		p.update() for p in @points
		s.contract() for s in @sticks
		p.update() for p in @elementPoints
		s.update() for s in @stickLinks
		# if @tick < 10
		window.requestAnimFrame(@update,null) if @isPlaying
		# @tick++	

	tick: 0
	


	addPoint: (x,y,kind=null) ->
		x = parseFloat(x)
		y = parseFloat(y)
		search = {x: x - @snapDist/2 , y: y - @snapDist/2, width: @snapDist, height: @snapDist }
		foundPoints = @quadTree.find(search)
		if foundPoints.length > 0
			p = foundPoints[0].point
		else
			p = @createPoint(x,y,kind)
			@quadTree.insert({x: x , y: y, point: p})
			@points.push(p)
		p

	createPoint: (x,y,kind) ->
		switch kind
			when "rubber"
				p = new verlet.RubberPoint(x,y)
			else
				p = new verlet.Point(x,y)
		p

	addLock: (c,x,y) =>
		p = @addPoint(x,y)
		p.locked = true

	addElementPoint: (svgPoint, ab, x, y)  =>
		# override me based on the renderer

	addStatic: (c) =>
		@statics.push(c)

	addPlugin: (e) ->
		@plugins.push e

	isMobile: ->
		navigator.userAgent.match(/Android/) or navigator.userAgent.match(/iPhone/) or navigator.userAgent.match(/iPod/) or navigator.userAgent.match(/iPad/)

window.requestAnimFrame = (->
	window.requestAnimationFrame or window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame or window.oRequestAnimationFrame or window.msRequestAnimationFrame or (callback) ->
		window.setTimeout callback, 1000 / 60
)()