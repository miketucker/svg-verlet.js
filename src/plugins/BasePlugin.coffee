###
	
	BasePlugin: Basic interface of a plugin

###

class plugins.BasePlugin

	constructor: ->
		# called when the object is instantiated

	init: (@scene) ->
		# called when the scene is loaded

	update: ->
		# updated every frame

	unload: ->
		# called if the scene is unloaded