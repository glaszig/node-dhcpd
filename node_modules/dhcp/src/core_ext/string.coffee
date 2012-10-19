if (!String.prototype.trim)
 String.prototype.trim = () ->
  this.replace /^\s+|\s+$/g, ''