# => SRC FOLDER
toast 'src'

  # EXCLUDED FOLDERS (optional)
  # exclude: ['folder/to/exclude', 'another/folder/to/exclude', ... ]

  # => VENDORS (optional)
  # vendors: ['vendors/x.js', 'vendors/y.js', ... ]

  # => OPTIONS (optional, default values listed)
  bare: true
  # packaging: true
  # expose: ''
  minify: false

  # => HTTPFOLDER (optional), RELEASE / DEBUG (required)
  httpfolder: 'www'
  release: 'www/js/svgVerlet.js'
  debug: 'www/js/svgVerlet-debug.js'