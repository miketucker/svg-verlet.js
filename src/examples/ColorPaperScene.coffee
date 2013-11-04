#<< paperjs/Scene

###

	ColorPaperScene: Extends the Paperjs renderer to add random palettes. 

###

class examples.ColorPaperScene extends paperjs.Scene

	settings:
		defaultBg: "#FFFFFF"
		defaultFg: "#CCCCCC"

	onLoadedSVG: (e) =>
		@assignPalette($(e).find("svg")[0])
		# console.log "loaded palette!", e
		super(e)

	assignPalette: (svg) =>

		isLight = Math.random() > 0.5
		# isLight = false


		if isLight
			util.General.randomSeed = (new Date().getTime() * 0.5)

			# console.log "rnd", util.General.randomFromSeed(), util.General.randomSeed
			fgHue = Math.random()
			bgHue = fgHue + (Math.random() * 0.5 + 0.25)
			bgHue -= 1.0 if(bgHue >= 1.0) 

			@bgColor =  util.Color.hsvToHex(bgHue,0.15,0.75)
			
			fgSat = Math.random() * 0.5 + 0.5
			fgVal = 0.4 + Math.random() * 0.2

			@fgColor = util.Color.hsvToHex(fgHue,fgSat,fgVal)
			@highlightColor =  util.Color.hsvToHex( fgHue, fgSat, Math.min(fgVal + 0.5,1.0))

		else
			fgHue = Math.random()
			bgHue = fgHue + (Math.random() * 0.5 + 0.25)
			bgHue -= 1.0 if(bgHue >= 1.0) 

			@bgColor =  util.Color.hsvToHex(bgHue,0.15 + Math.random() * 0.4,0.1 + Math.random() * 0.1)
			
			fgSat = Math.random() * 0.1 + 0.3
			fgVal = 0.2 + Math.random() * 0.2

			@highlightColor = util.Color.hsvToHex(fgHue,fgSat,fgVal)
			@fgColor =  util.Color.hsvToHex( fgHue, fgSat + 0.5, Math.min(fgVal + 0.8,1.0))

		$("html, body").css("background-color",@bgColor)


		$(svg).find("line, rect, circle, polygon, polyline, path").each (i,c) =>
			$(c).attr("stroke",@fgColor) if $(c).attr("stroke")?
			fill = $(c).attr("fill") 

			if fill == @settings.defaultBg
				$(c).attr("fill", @settings.bgColor)
			else if fill == @settings.defaultFg
				$(c).attr("fill", @highlightColor )