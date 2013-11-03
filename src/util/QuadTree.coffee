###
	
	Quadtree: For quickly determining if points overlap. 
	Used to create the verlet stick connections

###

class util.QuadTree
	constructor: (bounds, @max_objects = 5, @max_levels = 4, @level = 0) ->
		@bounds = bounds or { x: -20, y: -20, width: 2048, height: 2048 }
		@objects = []
		@nodes = []

	split: =>
		nextLevel = @level + 1
		subWidth = Math.round(@bounds.width / 2)
		subHeight = Math.round(@bounds.height / 2)
		x = Math.round(@bounds.x)
		y = Math.round(@bounds.y)
		
		#top right node
		@nodes[0] = new QuadTree(
			x: x + subWidth
			y: y
			width: subWidth
			height: subHeight
		, @max_objects, @max_levels, nextLevel)
		
		#top left node
		@nodes[1] = new QuadTree(
			x: x
			y: y
			width: subWidth
			height: subHeight
		, @max_objects, @max_levels, nextLevel)
		
		#bottom left node
		@nodes[2] = new QuadTree(
			x: x
			y: y + subHeight
			width: subWidth
			height: subHeight
		, @max_objects, @max_levels, nextLevel)
		
		#bottom right node
		@nodes[3] = new QuadTree(
			x: x + subWidth
			y: y + subHeight
			width: subWidth
			height: subHeight
		, @max_objects, @max_levels, nextLevel)

	getIndex: (rect) =>
		index = -1
		verticalMidpoint = @bounds.x + (@bounds.width / 2)
		horizontalMidpoint = @bounds.y + (@bounds.height / 2)
		
		topQuadrant = (rect.y < horizontalMidpoint and rect.y + rect.height < horizontalMidpoint)
		bottomQuadrant = (rect.y > horizontalMidpoint)
		
		if rect.x < verticalMidpoint and rect.x + rect.width < verticalMidpoint
			if topQuadrant
				index = 1
			else index = 2  if bottomQuadrant
		
		else if rect.x > verticalMidpoint
			if topQuadrant
				index = 0
			else index = 3  if bottomQuadrant
		index
	
	insert: (rect) =>
		t = this
		i = 0
		index = undefined
		
		#if we have subnodes ...
		if typeof @nodes[0] isnt "undefined"
			index = @getIndex(rect)
			if index isnt -1
				@nodes[index].insert rect
				return
		@objects.push rect
		if @objects.length > @max_objects and @level < @max_levels
			
			#split if we don't already have subnodes
			@split()  if typeof @nodes[0] is "undefined"
			
			#add all objects to there corresponding subnodes
			while i < @objects.length
				index = @getIndex(@objects[i])
				if index isnt -1
					@nodes[index].insert @objects.splice(i, 1)[0]
				else
					i = i + 1

	find: (rect) =>
		ar = []
		for n in @retrieve(rect)
			if n.x >= rect.x and n.y >= rect.y and n.x < (rect.width + rect.x) and n.y < (rect.height + rect.y)
				ar.push n
		ar


	retrieve: (rect) =>
		index = @getIndex(rect)
		objs = @objects
		
		if typeof @nodes[0] isnt "undefined"
			if index isnt -1
				objs = objs.concat(@nodes[index].retrieve(rect))
			else
				i = 0
				while i < @nodes.length
					objs = objs.concat(@nodes[i].retrieve(rect))
					i = i + 1
		objs


	clear: ->
		@objects = []
		i = 0

		while i < @nodes.length
			if typeof @nodes[i] isnt "undefined"
				@nodes[i].clear()
				delete @nodes[i]
			i = i + 1
