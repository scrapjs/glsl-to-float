Read float values from WebGL. An alternative to [glsl-read-float](https://www.npmjs.com/package/glsl-read-float), based on other [technique](http://stackoverflow.com/a/20859830/1052640), allows just read resulting buffer as array.

```js
var triangle     = require('a-big-triangle')
var glslify      = require('glslify')
var toFloat  = require("glsl-to-float")
var Shader = require('gl-shader')

var shader = Shader(gl, "\
    attribute vec2 position;\
    void main() {\
      gl_Position = vec4(position, 0, 1);\
    }",
    glslify("\
    #pragma glslify: packFloat = require(glsl-to-float)\n\
    void main() {\
      gl_FragColor = packFloat(floor(gl_FragCoord.x));\
    }", {inline: true})
);

var canvas     = document.body.appendChild(document.createElement('canvas'))
var gl         = canvas.getContext('webgl')

//Draw shader
shader.bind()
triangle(gl)

//Read back the float
var w = gl.drawingBufferWidth;
var buffer = new Uint8Array(4*w);
gl.readPixels(0, 0, w, 1, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
var result = toFloat(buffer);

//result is a Float32Array with [0.5, 1.5, 2.5, ...]
```