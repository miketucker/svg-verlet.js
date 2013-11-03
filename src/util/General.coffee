###

	GeneralUtil: Misc helper functions
	
###

class util.General

	@copyObject: (from,to) ->
		for k,v of from
			to[k] = v  
		return


	@propertyById: (obj,id) ->
		i = 0
		# console.log 'propbyid', obj, id
		for k,v of obj
			return obj[k] if i == id
			i++ 
		return undefined

	@randomSeed = 1
	@randomFromSeed: () ->
		x = Math.sin(@randomSeed++) * 10000
		x - Math.floor(x)

	@randomPropery: (obj) ->
		count = 0
		result = null 
		for p of obj
			result = p if(Math.random() < 1/++count)
		obj[result]

	@copyToNewObject: (from) ->
		to = {}
		to[k] = v for k,v of from
		return to

	@objectPropertyLength: (obj) ->
		i = 0
		for k,v of obj
			i++
		return i

	@randomFromArray: (array) ->
		array[Math.floor(Math.random()*array.length)]

	@randomFromRange: (start, end) ->
		start + (Math.random() * (end - start))


# Math

RAD_2_DEG = (180 / Math.PI) 
