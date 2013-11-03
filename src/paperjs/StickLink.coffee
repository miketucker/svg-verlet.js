#<< verlet/Stick

class paperjs.StickLink extends verlet.Stick
	rotation: 0
	link: null
	offset: null

	update: ->
		rot = Math.atan2(@pointb.y - @pointa.y, @pointb.x - @pointa.x) * RAD_2_DEG

		deltaRotation = rot - @rotation
		@rotation = rot
		
		@group.position = @pointa
		@group.position.x -= (@c.position.x - @pointa.x)
		@group.position.y -= (@c.position.y - @pointa.y)

		@group.rotate(deltaRotation,@pointa)

	setLink: (l) ->
		
		@group = new paper.Group()
		@c = new paper.Group()
		@c.position = @pointa

		

		@link = l
		@group.addChild(l)
		@group.addChild(@c)
		@link.position.x += 1
		@link.position.y += 1