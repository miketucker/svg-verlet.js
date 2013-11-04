#<< svg/Scene

###

	ColorSvgScene: Extends SvgScene to add random palettes. 

###

class examples.ColorSvgScene extends svg.Scene

	settings:
		defaultBgColor: 		"#FFFFFF"
		defaultFgColor: 		"#666666"
		defaultHighlightColor: 	"#CCCCCC"
		defaultSecondaryColor: 	"#999999"

	constructor: (options) ->
		super(options)
		@generatePalette()

	onLoaded: =>
		super()
		@assignPalette()


	generatePalette: ->
		@isLight = Math.random() > 0.5



		if @isLight
			util.General.randomSeed = (new Date().getTime() * 0.001)
			fgHue =  util.General.randomFromSeed()
			bgHue = fgHue + (Math.random() * 0.5 + 0.25)
			bgHue -= 1.0 if(bgHue >= 1.0) 

			
			fgSat = Math.random() * 0.5 + 0.5
			fgVal = 0.5 + Math.random() * 0.2

			@bgColor =  util.Color.hsvToHex(bgHue,Math.random() * 0.1,0.8)


			@fgColor = util.Color.hsvToHex(fgHue,fgSat,fgVal)
			highlightVal =  Math.min(fgVal + 0.5,1.0)
			@highlightColor =  util.Color.hsvToHex( fgHue, fgSat, highlightVal)

			secHue = fgHue + 0.1
			secHue -= 1.0 if secHue > 1.0

			secSat = Math.min(fgVal + Math.random() * 0.4,1.0);
			@secondaryColor = util.Color.hsvToHex(secHue,secSat,highlightVal)


		else
			util.General.randomSeed = (new Date().getTime() * 0.5)
			fgHue =  util.General.randomFromSeed()
			bgHue = fgHue + (Math.random() * 0.5 + 0.25)
			bgHue -= 1.0 if(bgHue >= 1.0) 

			@bgColor =  util.Color.hsvToHex(bgHue,0.15 + Math.random() * 0.2,0.1 + Math.random() * 0.1)
			
			fgSat = Math.random() * 0.5 + 0.3
			fgVal = 0.7 + Math.random() * 0.3

			@fgColor = util.Color.hsvToHex(fgHue,fgSat,fgVal)
			highlightVal =  Math.min(fgVal - 0.4,1.0)
			@highlightColor =  util.Color.hsvToHex( fgHue, fgSat, highlightVal)

			secHue = fgHue + 0.2
			secHue -= 1.0 if secHue > 1.0

			secSat = Math.min(fgSat + Math.random() * 0.4,1.0);
			@secondaryColor = util.Color.hsvToHex(secHue,secSat,fgVal)

		# $("html, body").css("background-color",@bgColor)


	assignPalette: ->

		$(@svg).find("line, rect, circle, polygon, polyline, path").each (i,c) =>
			stroke = $(c).attr("stroke")
			fill = $(c).attr("fill")

			switch stroke
				when @settings.defaultFgColor
					$(c).attr("stroke",@fgColor)
				when @settings.defaultBgColor
					$(c).attr("stroke",@bgColor)
				when @settings.defaultHighlightColor
					$(c).attr("stroke",@highlightColor)
				when @settings.defaultSecondaryColor
					$(c).attr("stroke",@secondaryColor)

			switch fill
				when @settings.defaultFgColor
					$(c).attr("fill",@fgColor)			
				when @settings.defaultBgColor
					$(c).attr("fill",@bgColor)	
				when @settings.defaultHighlightColor
					$(c).attr("fill",@highlightColor)
				when @settings.defaultSecondaryColor
					$(c).attr("fill",@secondaryColor)