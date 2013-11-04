#<< plugins/BasePlugin

### 

	VerletWind: Applies a turbulance force using noise to points based on their position

###


class plugins.Wind extends plugins.BasePlugin
	noise: null
	speed: 0.01
	zoom: 0.002
	strength: 0.1
	windPoints: null

	offsetX: 1.0
	offsetY: 1.0
	offsetZ: 1.0
	skip: 0

	constructor: ( @useSvgPoints = false ) ->
		@offsetZ = 1.0
		@noise = new util.ImprovedNoise()

	init: (@scene) ->
		_ = @
		@windPoints = []

		if @useSvgPoints
			$(@scene.dom).find('[id^="Wind"]').find("circle,ellipse").each ->

				c = $(@)
				x = c.attr('cx')
				y = c.attr('cy')
				
				c.remove()
				p = _.scene.addPoint(x,y)
				_.windPoints.push(p)
		else
			for p in @scene.points
				@windPoints.push(p) unless p.locked

	update: =>
		currentStrength = BaseScene.currentTimeStep * @strength

		for p in @windPoints
			p.force(
				@noise.noise(p.x * @zoom + @offsetX , p.y * @zoom + @offsetY , @offsetZ) * currentStrength, 
				@noise.noise(p.x * @zoom + 1.0 + @offsetX , p.y * @zoom + @offsetY , @offsetZ) * currentStrength
			)
		@offsetZ += @speed
