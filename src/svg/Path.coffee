###

	SvgPoint: Interface for updating SVG polylines with the point data from VerletPoint

###

class svg.Path
	svg: null
	ab: 0
	points: null

	constructor:(@svg,@points) ->

	update: ->
		pAr = []
		for p in @points
			pAr.push p.x+","+p.y+""

		@svg.setAttribute("d","M"+pAr.join("l"))