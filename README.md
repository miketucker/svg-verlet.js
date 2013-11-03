# SvgVerlet.js

#### Version 0.1

A verlet-based physics library for SVG files written in Coffeescript.

This library implements portions of the SVG spec, but there are still a lot of holes. I'd recommend using the included SVG files as a rough idea of what will work and what won't. 
 
==========

### Examples

This library was abstracted out of my current portfolio:

[http://mike-tucker.com/13](http://mike-tucker.com/13/)

### Plugins

There are various plugins included, and here are some examples:

* [MousePull](http://mike-tucker.com/13/hello) - Attractor based on mouse or touch inputs
* [Gravity](http://mike-tucker.com/13/contact) - Constant force applied to all verlet points
* [Wind](http://mike-tucker.com/13/grid) - Applies forces to verlet points using perlin noise
* [NoiseWarp](http://mike-tucker.com/13/media_space) - Offsets verlet points with a perlin noise field
* StatWrapper - Because every JS library needs some [Mr Doob](github.com/mrdoob/) stats.

==========

## Getting Started: For Designers

This isn't the easiest thing to get working, but later versions might fix that. For the time being, I'd recommend using an existing example page as a template. 

A common workflow without code would be:

1. Open one of the example `.svg` files in Illustrator or whatever vector program.
2. Open the corresponding HTML page in a browser.
2. Make changes to the SVG file, hit save.
3. Refresh the browser to see the changes.

==========

## Getting Started: For Developers

If you're new to CoffeeScript, I'd suggest reading up here: [coffeescript.org](http://coffeescript.org/)

#### 1) Install the [NPM](https://npmjs.org/) packages

`	npm install
`

#### 2) Start watching for coffeescript updates

This library uses [coffee-toaster](https://github.com/serpentem/coffee-toaster) for compiling all of the `.coffee` files together. 

I'm sure there are other ones out there, so if any others work for you, let me know.


`
	toaster -w
`

#### 3) Save and Iterate

Any changes to your `.coffee` files will automatically compile into `js/main.js`. 

Then just refresh your browser, or try using [LiveReload](http://livereload.com/).


#### 4) "But I hate coffeescript"

Calm down, you don't need to use it. Just include the main js file, and extend the classes however you want.

However, you'll probably want to read the `.coffee` source files to get an idea of what is going on inside.


#### 5) Loading external SVG files

Copy and pasting SVG data into the HTML file gets old fast.

Open the `external-file.html` example. 

This requires a webserver because of local file policies with javascript. If you're just starting out, I recommend [MAMP](http://www.mamp.info/en/index.html) (Mac) or [WAMP](http://www.wampserver.com/en/) (Windows)


#### 6) Extras

You'll notice in the examples files, there are little tidbits that are done outside of the classes. This is where plugins can go, and other changes to the scene.


==========

## Rendering


If you're browsing through the source, you may notice fragments of a [Paper.js](http://paperjs.org/) renderer. I explored this briefly with the hope that Canvas rendering on Mobile would be faster than SVG. The experiment failed, maybe Paper.js was too heavy? Or the code sucked, not sure.

Perhaps another canvas library would be a better match. If you have recommendations, please let me know!

==========


## Thank the tech gods

Here are some various techs that this library takes advantage of (if you're not already familiar.)


### [SVG](http://en.wikipedia.org/wiki/Scalable_Vector_Graphics)

An open-source vector format supported by most browsers. Easy for designers to lay out thing. Looks great on high-density screens.

At the moment, all renderering is done by manipulating SVG elements on the stage.

### [Verlet Integration](http://en.wikipedia.org/wiki/Verlet_integration)

A simple, and optimized way of implementing soft-body physics. It simply maintains a distance between two points.

### [Perlin Noise](http://en.wikipedia.org/wiki/Perlin_noise)

This is the secret sauce for procedural animation. If you're not familiar with it, you should be. It's use for the wind animation, among other things.

#### [Quadtree](http://en.wikipedia.org/wiki/Quadtree)

This is used to determine which points are overlapping, and then creates the appropriate verlet connections.

