###

	PaperJS Point: simply updates the paper point from the verlet info

	TODO: 

###


class paperjs.Point
	constructor: (@verletPoint,@paperPoint) ->


	update: ->
		@paperPoint.x = @verletPoint.x
		@paperPoint.y = @verletPoint.y
		# console.log @verletPoint.x, @verletPoint.y