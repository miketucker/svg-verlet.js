###

	SvgPoint: Interface for updating SVG elements with the point data from VerletPoint

###

class svg.Point
	svg: null
	ab: 0
	point: null

	lastValX: 0.0
	lastValY: 0.0
	constructor:(@svg,@ab,@point) ->

		if @ab == 1
			@update = ->
				# if @point.x != @lastValX or @point.y != @lastValY
				@svg.setAttribute 'x1', @point.x
				@svg.setAttribute 'y1', @point.y
				@lastValX = @point.x
				@lastValY = @point.y
					
		else
			@update = ->
				# if @point.x != @lastValX or @point.y != @lastValY
				@svg.setAttribute 'x2', @point.x 
				@svg.setAttribute 'y2', @point.y 
				@lastValX = @point.x
				@lastValY = @point.y
					