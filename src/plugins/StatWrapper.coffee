#<< plugins/BasePlugin

###

	VerletStats: Simple, static wrapper for Mr Doob's Stats utility

###


# REQUIREMENTS:
# add to html head: <script src="js/stats.js"></script>

class plugins.StatWrapper extends plugins.BasePlugin
	init: (@scene) ->
		@stats = new Stats()
		@stats.domElement.setAttribute("style","position:fixed; top: 0; left: 0;")
		document.body.appendChild(@stats.domElement)			
	update: =>
		@stats.begin()
		@stats.end()