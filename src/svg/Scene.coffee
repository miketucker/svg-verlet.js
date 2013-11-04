#<< BaseScene


###
	
	SvgScene: Main class for parsing and setting up the necessary verlet scene

	TODO: 

	1) Restructure: Come up with better system to parse files
	Keeping objects in groups is slow and tedious... :(

	2) Remove JQuery: This doesn't need jquery, i was just lazy

###


class svg.Scene extends BaseScene
	isLoaded: false

	offsetX: 0
	offsetY: 0

	

	onLoadCallback: null

	constructor: (options) ->
		super(options)

		util.General.copyObject(options,@options)

		@onLoadCallback = options.callback if @options.callback?
		@container = $(@options.container)
		if @options.file
			@container.load(@options.file, @onLoaded)
		else
			setTimeout @onLoaded, 1

		setTimeout () ->
			window.scrollTo(0, 1)
		, 0

	onLoaded: =>
		super()
		@dom = @svg = @container.find("svg")[0]
		$(@dom).hide()
		$(@dom).fadeIn()
		_ = @

		@parseByGroups()
		


		@verticalAlign(@options.verticalAlign)
		@horizontalAlign(@options.horizontalAlign)

		@dom.dispatchEvent(new Event("onSceneLoaded",{bubbles:true,cancelable:true}))
		@onLoadCallback?()
		@onInit()

	verticalAlign: (place) ->
		switch place
			when "center"
				@offsetY += $(@svg).height() * -0.5
			when "top"
				@offsetY = 0
		@updateFrameOffset()

	horizontalAlign: (place) ->
		switch place
			when "center"
				@offsetX += $(@svg).width() * -0.5
			when "left"
				@offsetX = 0
		@updateFrameOffset()

	updateFrameOffset: ->
		$(@svg).css('marginLeft',@offsetX)
		$(@svg).css('marginTop',@offsetY)

	offsetFrame:(x,y) ->
		@offsetX += x
		@offsetY += y
		@updateFrameOffset()

	setSize:(width,height) ->
		@svg.setAttribute "width"	, width
		@svg.setAttribute "height"	, height
		@svg.setAttribute "viewBox","0 0 "+width+" "+height


	parseByGroups: =>
		$svg = $(@svg)
		_ = @
		$svg.find('[id^="Statics"]').find("g").each () -> _.addStatic(@)
		$svg.find('[id^="Locks"]').find("circle,ellipse").each () -> 
			_.addLock(@,@getAttribute('cx'),@getAttribute('cy'))
			$(@).remove()

		# "Hit" prefix is reserved for href buttons, so we make them invisible here
		$svg.find('[id^="Hit"]').each () -> _.makeInvisible(@)

		$svg.find('[id^="HiddenVerlets"]').find("line").each () -> 
			_.addSvgStick(@,true)

		$svg.find('[id^="HiddenVerlets"]').find("polyline").each () -> 
			_.addPolyStick(@, false, null, true)

		$svg.find('[id^="Verlets"]').find("polyline").each () -> _.addPolyStick(@)
		$svg.find('[id^="Verlets"]').find("line").each () -> _.addSvgStick(@)

		$svg.find('[id^="Points"]').find("polyline").each () -> _.addPolyStick(@,true)
		$svg.find('[id^="Points"]').find("line").each () -> _.addSvgStick(@,false,true)
		$svg.find('[id^="Points"]').find("path").each () -> _.addPathStick(@,true)

		$svg.find('[id^="RubberPoints"]').find("polyline, polygon").each () ->	 _.addPolyStick( 	@, true, "rubber")
		$svg.find('[id^="RubberPoints"]').find("line").each () -> 		_.addSvgStick( 		@, false, true, "rubber")
		$svg.find('[id^="RubberPoints"]').find("path").each () -> 		_.addPathStick( 	@, true, "rubber")

		$svg.find('[id^="Links"]').find("line").each () ->  _.addLink(@)

	makeInvisible: (c) ->
		c.setAttribute("fill","rgba(0,0,0,0)")

	parseByColors: =>
		$(@svg).children().each @parseGroup

	parseGroup: (c) =>
		_ = @
		$(c).children().each ->
			switch @nodeName
				when "g" 
					if @id.length > 0 then _.addStatic(@)
					_.parseGroup(@)

				when "circle"
					switch @getAttribute("fill")
						when _.options.parseColors.lock then _.addLock(@,@attr('cx'),@attr('cy'))
				when "line"
					switch @getAttribute("stroke")
						when _.options.parseColors.link then _.addLink(@)
						else _.addSvgStick(@)


	addLink: (c) =>
		p = $(c)
		pa = @addPoint(p.attr('x1'),p.attr('y1'))
		pb = @addPoint(p.attr('x2'),p.attr('y2'))
		if pb.x < pa.x
			p1 = pb
			p2 = pa
		else
			p1 = pa
			p2 = pb

		@sticks.push(sl = new svg.StickLink(p1,p2))
		@stickLinks.push(sl)
		linkName = p[0].id.split("Link")[1]
		for s in @statics
			if s.id == linkName
				sl.setLink(s) 
				break
		p.remove()


	addElementPoint: (element, ab, x, y)  =>
		p = @addPoint(x,y)
		sp = new svg.Point(element,ab,p)
		@elementPoints.push(sp)
		p

	addHiddenStick: (c) =>
		@addSvgStick(c,true)


	#Note: Currently only works with line segments within paths
	#TODO: Implement full SVG Path system...

	addPathStick: (path, skipStick = false, kind = null) =>
		segments = path.pathSegList
		i = 0
		len = segments.numberOfItems
		pAr = []	
		
		while i < len
			pathSeg = segments.getItem(i)
			switch pathSeg.pathSegType
				when SVGPathSeg.PATHSEG_MOVETO_ABS
					origPoint = @addPoint(parseFloat(pathSeg.x),parseFloat(pathSeg.y), kind )
					pAr.push origPoint if pAr.length == 0

				when SVGPathSeg.PATHSEG_LINETO_REL

					nextPoint = @addPoint( parseFloat(pathSeg.x), parseFloat(pathSeg.y) , kind )
					@addUniqueStick(lastPoint,nextPoint) unless skipStick
					pAr.push nextPoint

				# when SVGPathSeg.PATHSEG_LINETO_ABS

					# nextPoint = @addPoint( parseFloat(pathSeg.x), parseFloat(pathSeg.y) )
					# console.log "line", nextPoint.x, nextPoint.y
					# @addUniqueStick(lastPoint,nextPoint) unless skipStick
					# pAr.push nextPoint

				# when SVGPathSeg.PATHSEG_CLOSEPATH
					# console.log "close"	
					# http://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSegClosePath
			++i
		@elementPoints.push new svg.Path(path,pAr) if pAr.length > 1



	addPolyStick: (polyline, skipStick = false, kind = null, remove = false) =>
		pointStr = polyline.getAttribute("points")
		pointStr = pointStr.replace(/(\r\n|\t|\n|\r)/gm,"");
		pointStrAr = pointStr.split(" ")
		pAr = []
		i = 0
		for p in pointStrAr
			sp = p.split(",")
			unless isNaN(sp[0]) || isNaN(sp[1])
				verletPoint = @addPoint(sp[0], sp[1] , kind )
				pAr.push verletPoint
				if i > 0 && !skipStick
					@addUniqueStick(prevVerlet,verletPoint)

				prevVerlet = verletPoint
			i++
		if remove
			$(polyline).remove()
		else
			@elementPoints.push new svg.PolyLine(polyline,pAr) 
		


	addUniqueStick:(p1,p2) ->
		dupe = false
		for s in @sticks
			if (s.pointa == p1 and s.pointb == p2) or (s.pointa == p2 and s.pointb == p1) or (p1 == p2)
				dupe = true
				break

		unless dupe
			@sticks.push(new verlet.Stick(p1,p2))

		return !dupe
	
	addSvgStick: (segment, remove = false , skipStick = false , kind = null ) =>
		p1 = @addPoint(segment.getAttribute('x1'),segment.getAttribute('y1'), kind)
		p2 = @addPoint(segment.getAttribute('x2'),segment.getAttribute('y2'), kind)

		if skipStick
			@elementPoints.push(new svg.Point(segment,1,p1))
			@elementPoints.push(new svg.Point(segment,2,p2))
		else if @addUniqueStick(p1,p2) 
			@elementPoints.push(new svg.Point(segment,1,p1))
			@elementPoints.push(new svg.Point(segment,2,p2))

		segment.remove() if remove
