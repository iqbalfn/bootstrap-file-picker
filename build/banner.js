'use strict'

const year = new Date().getFullYear()

function getBanner(pluginFilename) {
  return `/*!
  * Bootstrap File Picker v0.0.3 (https://iqbalfn.github.io/bootstrap-file-picker/)
  * Copyright 2019 Iqbal Fauzi
  * Licensed under MIT (https://github.com/iqbalfn/bootstrap-file-picker/blob/master/LICENSE)
  */`
}

module.exports = getBanner
