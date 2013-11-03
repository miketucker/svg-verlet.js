#<< examples/ColorSvgScene

###

	GenerativeSvgScene: Extends the ColorSVGScene, and generates new elements procedurally

###

class examples.GenerativeSvgScene extends examples.ColorSvgScene

	onLoaded: =>
		@svg = @container.find("svg")[0]
		@addNewElements()
		super()

	addNewElements: =>
		# get jquery links of the groups we need
		$verletGroup = 	$(@svg).find("#Verlets")
		$lockGroup = 	$(@svg).find("#Locks")
		$windGroup = 	$(@svg).find("#Wind")

		# grab the SVG elements we want to duplicate
		$dupeLines = $(@svg).find("#Verlets line")
		$dupeLock = $lockGroup.find("circle")
		$dupeWind = $windGroup.find("circle")

		sizePadding = 100
		ringCount = 4
		ringLayerDistance = 60.0
		radius = ringCount * ringLayerDistance + sizePadding
		
		@setSize(radius*2,radius*2)
		# starting points, circle will grow out from here
		sx = radius
		sy = radius

		console.log "sx,sy", sx, sy


		windOffsetX = parseFloat($dupeWind.attr("cx")) - parseFloat($dupeLock.attr("cx"))
		windOffsetY = parseFloat($dupeWind.attr("cy")) - parseFloat($dupeLock.attr("cy"))

		# generate the rings

		for i in [0..ringCount] #circular rings
			ringPointCount = i * 4 + 1 # add more points for each ring
			j = 0
			dist = i * ringLayerDistance
			while j < ringPointCount
				radian  = (Math.PI * 2.0) * j / ringPointCount
				nx = sx + Math.cos(radian) * dist
				ny = sy + Math.sin(radian) * dist
				
				$newLock = $dupeLock.clone()
				$lockGroup.append $newLock
				@assignCirclePosition($newLock,nx,ny)


				$newWind = $dupeWind.clone()
				$windGroup.append $newWind
				@assignCirclePosition($newWind,nx + windOffsetX,ny + windOffsetY)

				baseLineX = parseFloat($($dupeLines[0]).attr("x1"))
				baseLineY = parseFloat($($dupeLines[0]).attr("y1"))


				for l in $dupeLines
					nl = $(l).clone()
					$verletGroup.append nl
					@offsetLinePosition nl, -baseLineX + nx, -baseLineY + ny

				j++


		# dispose of original elements
		$dupeLines.remove()
		$dupeWind.remove()
		$dupeLock.remove()

	# update: ->
	# 	return

	# TODO: put all of these SVG interface functions into a class

	assignCirclePosition: (circle, x, y) ->
		circle.attr "cx", x
		circle.attr "cy", y


	offsetLinePosition: (line, offsetX, offsetY) ->
		line.attr "x1", parseFloat(line.attr("x1")) + offsetX
		line.attr "y1", parseFloat(line.attr("y1")) + offsetY

		line.attr "x2", parseFloat(line.attr("x2")) + offsetX
		line.attr "y2", parseFloat(line.attr("y2")) + offsetY