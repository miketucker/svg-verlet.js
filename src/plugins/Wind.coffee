#<< plugins/BasePlugin
#<< util/ImprovedNoise

### 

	VerletWind: Applies a turbulance force using noise to points based on their position

###


class plugins.Wind extends plugins.BasePlugin
	speed: 0.01
	zoom: 0.002
	strength: 0.1
	windPoints: null

	offsetX: 1.0
	offsetY: 1.0
	offsetZ: 1.0
	skip: 0

	constructor: ( @useSvgPoints = false ) ->
		@id = "instance" + Math.floor(Math.random() * 10000)
		@strength = 0.1
		@zoom = 0.002
		@speed = 0.01
		@offsetZ = Math.random() * 100.0

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
		return

	update: ->
		currentStrength = BaseScene.currentTimeStep * @strength
		# console.log currentStrength, @strength, BaseScene.currentTimeStep

		for p in @windPoints
			ynoise = improvedNoise.noise(p.x * @zoom + 1.0 + @offsetX , p.y * @zoom + @offsetY , @offsetZ) * currentStrength
			maxNoise = ynoise if ynoise > maxNoise
			p.force(
				improvedNoise.noise(p.x * @zoom + @offsetX , p.y * @zoom + @offsetY , @offsetZ) * currentStrength, 
				ynoise
			)
		@offsetZ += @speed
		return