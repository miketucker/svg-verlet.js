#<< BaseScene

###

	PaperScene: uses Canvas and Paper.js as the renderer

###

class paperjs.Scene extends BaseScene

	settings:
		width: null
		height: null
		container: "#container"
		fullscreen: false

	elements:
		verlets: null
		locks: null
		winds: null
		statics: null

	constructor: (file,options = {}) ->
		super()

		@settings.width = options.width if options.width?
		@settings.height = options.height if options.height?
		# console.log @settings.width, @settings.height
		unless @settings.width? 
			@settings.width = $(window).width()
			@settings.fullscreen = true

		@settings.height = $(window).height() unless @settings.height? 

		$canvas = $("<canvas width='"+@settings.width+"' height ='"+@settings.height+"'/>")
		$(@settings.container).append($canvas)
		@dom = @canvas = $canvas[0]

		# console.log paper
		paper.setup(@canvas)
		@project = paper.project
		@view = paper.view

		@width = @settings.width
		@height = @settings.height
		# @quadTree = new util.QuadTree()

		$.get file, @onLoadedSVG
		$(window).resize(@onResize) if @settings.fullscreen

	quadTest: ->
		i = 0
		while i < 500
			o = {x:Math.random() * 1000,y:Math.random() * 1000,width:1,height:1}
			c = new paper.Path.Circle(new paper.Point(o.x,o.y),2)
			c.fillColor = 'red'
			o.obj = c
			@quadTree.insert(o)
			i++
		
		rx = Math.random() * 500
		ry = Math.random() * 500
		search = {x:rx,y:rx,width:10,height:10}
		ret = @quadTree.retrieve(search)

		p = new paper.Path.Rectangle(new paper.Point(search.x,search.y),new paper.Size(search.width,search.height))
		p.strokeColor = "red"

		# console.log ret
		for n in ret
			# console.log n
			if n.x >= search.x and n.y >= search.y and n.x < (search.width + search.x) and n.y < (search.height + search.y)
				n.obj.fillColor = 'green'
				# console.log 'found ' , n
			else
				n.obj.fillColor = 'blue'

		@view.draw()
		
	onLoadedSVG: (e) =>
		@onLoaded()
		svg = @project.importSVG($(e).find("svg")[0])
		# console.log "boo", svg

		@elements.statics = 		svg.children.Statics 		if svg.children.Statics?
		@elements.links = 			svg.children.Links 			if svg.children.Links?
		@elements.locks = 			svg.children.Locks 			if svg.children.Locks?
		@elements.winds = 			svg.children.Wind 			if svg.children.Wind?
		@elements.verlets = 		svg.children.Verlets 		if svg.children.Verlets?
		@elements.hiddenVerlets = 	svg.children.HiddenVerlets 	if svg.children.HiddenVerlets?

		@view.draw()
		@initElements()
		@onInit()

	initElements: ->
		toDispose = []
		for c in @elements.locks.children
			@addLock(c,c.position.x,c.position.y)
			toDispose.push c

		@addStatic(c) for c in @elements.statics.children
		@addStick(c) for c in @elements.verlets.children

		if @elements.hiddenVerlets?
			for c in @elements.hiddenVerlets.children
				@addStick(c,true) 
				toDispose.push c
			# console.log c
			
		if @elements.links?
			for c in @elements.links.children
				@addLink(c)
				toDispose.push c
			
	
		c.remove() for c in toDispose



	addElementPoint: (paperPoint)  =>
		p = @addPoint(paperPoint.point.x,paperPoint.point.y)
		sp = new paperjs.Point(p,paperPoint.point)

		@elementPoints.push(sp)		
		p


	addStick: (element, remove) ->
		switch element.type
				when "path"
					if element.segments.length > 1
						if remove
							p1 = @addPoint(element.segments[0].point.x, element.segments[0].point.y)
							p2 = @addPoint(element.segments[1].point.x, element.segments[1].point.y)
							
						else
							p1 = @addElementPoint(element.segments[0])
							p2 = @addElementPoint(element.segments[1])
						# element.fullySelected = true
						# @addElementPoint(segment,segment.handleIn.x,segment.handleIn.y)
						# @addElementPoint(segment,segment.handleOut.x,segment.handleOut.y)

						@sticks.push(new verlet.Stick(p1,p2))

	addLink: (element) ->
		switch element.type
				when "path"
					if element.segments.length > 1
						pa = @addPoint(element.segments[0].point.x, element.segments[0].point.y)
						pb = @addPoint(element.segments[1].point.x, element.segments[1].point.y)

						if pb.x < pa.x
							p1 = pb
							p2 = pa
						else
							p1 = pa
							p2 = pb
							
						# p1 = @addElementPoint(element.segments[0])
						# p2 = @addElementPoint(element.segments[1])
						@sticks.push(sl = new paperjs.StickLink(p1,p2))
						@stickLinks.push(sl)
						
						linkName = element.name.split("Link")[1]
						for s in @statics
							if s.name == linkName
								# g = new paper.Group()
								# rect = new paper.Rectangle(new paper.Point(), new paper.Size(1, 1))
								# r = new paper.Path.Rectangle(rect)
								# r.fillColor = "red"
								# g.addChild(r)
								
								# console.log g.position, r.position

								# g.position.x = p1.x
								# g.position.y = p1.y

								# g.addChild(s)
								# s.position.x += s.bounds.width / 2
								# s.position.y += s.bounds.height / 2


								sl.setLink(s)
								return
						

	update: =>
		super()
		@view.draw()

	onResize: =>
		@canvas.setAttribute "width", window.innerWidth
		@canvas.setAttribute "height", window.innerHeight

