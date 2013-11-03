###

	SvgPoint: Interface for updating SVG polylines with the point data from VerletPoint

###

class svg.PolyLine
	svg: null
	ab: 0
	points: null

	constructor:(@svg,@points) ->

	update: ->
		pStr = ""
		for p in @points
			pStr += p.x+","+p.y+" "
		@svg.setAttribute("points",pStr)