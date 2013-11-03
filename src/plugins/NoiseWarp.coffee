### 

	NoiseWarp: Applies a turbulance force 

###


class plugins.NoiseWarp
	noise: null
	speed: 0.01
	zoom: 0.002
	strength: 0.1

	offsetX: 1.0
	offsetY: 1.0
	offsetZ: 2.0
	skip: 0

	constructor: ->
		@noise = new util.ImprovedNoise()


	init: (@scene) ->
		_ = @

		for p in @scene.points
			p.warpDampen = Math.max(@noise.noise(p.x * 0.1 , p.y * 0.1 , 1.0 ) * 0.2 + 0.1,0.01)

		@update = ->
			currentStrength = BaseScene.currentTimeStep * @strength

			for p in @scene.points
				p.x += ((p.originalX + @noise.noise(p.x * @zoom + @offsetX , p.y * @zoom + @offsetY , @offsetZ) * currentStrength) - p.x) * p.warpDampen
				p.y += ((p.originalY + @noise.noise(p.x * @zoom + 1.0 + @offsetX , p.y * @zoom + @offsetY , @offsetZ) * currentStrength) - p.y) * p.warpDampen
			@offsetZ += @speed

			for p in @scene.elementPoints
				p.update()

	update: ->
		return