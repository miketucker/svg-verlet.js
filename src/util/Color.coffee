###

	util.Color: Basic color class for converting HSV, RGB, and HEX etc

###
class util.Color

	# Convert Hexadecimal to RGB
	# Syntax: hexToRgb("#454545") or hexToRgb([45, 45, 45])
	@hexToRgb: (a) ->
		a = a.match(/\w\w/g)  if typeof a is "string"
		[ "0x" + a[0] - 0, "0x" + a[1] - 0, "0x" + a[2] - 0 ]

	@componentToHex: (c) ->
		hex = c.toString(16)
		(if hex.length is 1 then "0" + hex else hex)

	@rgbToHex: (r, g, b) ->
		"#" + @componentToHex(r) + @componentToHex(g) + @componentToHex(b)


	# expects values 0 - 1.0
	@hsvToHex: (h, s, v) ->
		r = undefined
		g = undefined
		b = undefined
		i = undefined
		f = undefined
		p = undefined
		q = undefined
		t = undefined
		if h and s is `undefined` and v is `undefined`
			s = h.s
			v = h.v
			h = h.h
		i = Math.floor(h * 6)
		f = h * 6 - i
		p = v * (1 - s)
		q = v * (1 - f * s)
		t = v * (1 - (1 - f) * s)
		switch i % 6
			when 0
				r = v
				g = t
				b = p
			when 1
				r = q
				g = v
				b = p
			when 2
				r = p
				g = v
				b = t
			when 3
				r = p
				g = q
				b = v
			when 4
				r = t
				g = p
				b = v
			when 5
				r = v
				g = p
				b = q
		@rgbToHex(Math.floor(r * 255),Math.floor(g * 255),Math.floor(b * 255))
