#<< verlet/Stick

	###

	VerletStickLink: Complex objects and groups can be attached to a single object in the Verlet scene.
	Example: Hello scene (Twitter link attached to a single line)

	- SVG line element must exist in "Links" group. This must be a line so that the rotation can be determined each frame.
	- Corresponding linked element must exist in "Statics" Group. This can be any type of element-- path, group, polyline etc.

	Links Group -> LinkFoo
	Statics -> Foo

	The static object will follow the movement and rotation of the Link object

###


class svg.StickLink extends verlet.Stick
	rotation: 0
	link: null
	
	update: ->
		rot = Math.atan2(@pointb.y - @pointa.y, @pointb.x - @pointa.x) * RAD_2_DEG
		ax = Math.round(@pointa.x*10)/10
		ay = Math.round(@pointa.y*10)/10
		# console.log(@link)
		@link.setAttribute "transform" , "translate("+ax+","+ay+") rotate("+(rot)+")" 

	setLink: (l) ->
		@link = l
		_ = @

		# Offset all of the children...
		# TODO: This could use some regex cleanup, particularly "path"

		@offsetChildren(l)

	offsetChildren: (target) =>
		_ = @

		$(target).children().each ->
			@setAttribute "transform","translate(-"+ _.pointa.x + ", -" + _.pointa.y + ")"

	offsetPolygon: (target) =>
		scratchPoints = ""
		for pointStr in target.getAttribute("points").split(" ")
			p = pointStr.split(",")
			if p.length > 1
				p[0] -= @pointa.x
				p[1] -= @pointa.y
				scratchPoints += p[0] + "," + p[1] + " "
		target.setAttribute("points",scratchPoints)