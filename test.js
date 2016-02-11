var test = require('tst');

var triangle     = require('a-big-triangle')
var glslify      = require('glslify')
var toFloat  = require("./index.js")
var Shader = require('gl-shader');
var assert = require('assert');
var readFloat = require('glsl-read-float');

var canvas     = document.body.appendChild(document.createElement('canvas'))
var gl         = canvas.getContext('webgl')


test('glsl-read-float tests', function () {
  var shader = Shader(gl, "\
  attribute vec2 position;\
  void main() {\
    gl_Position = vec4(position, 0, 1);\
  }",
  glslify("\
  #pragma glslify: packFloat = require(./index.glsl)\n\
  uniform highp float f;\
  void main() {\
    gl_FragColor = packFloat(f);\
  }", {inline: true})
  );

  var FLOAT = new Float32Array(1)
  var BYTE  = new Uint8Array(FLOAT.buffer)

  function render(num) {
    //Convert to float
    FLOAT[0] = num

    //Draw shader
    shader.bind()
    shader.uniforms.f = FLOAT[0]
    triangle(gl)

    //Read back the float
    var buffer = new Uint8Array(4)
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buffer)
    var unpacked = toFloat(buffer)

    FLOAT[0] = num
    // console.log('in bits:', BYTE[3], BYTE[2], BYTE[1], BYTE[0])
    // console.log('out bits: ', buffer)

    //Log output to console
    assert.deepEqual(FLOAT, unpacked);
  }

  for(var i=-300; i<300; ++i) {
    render(i)
  }
  for(var j=0; j<100; ++j) {
    render(Math.random())
  }
  //Test edge cases
  render(1.70141184e38)
  render(-1.70141184e38)
  render(1.17549435e-38)
  render(-1.17549435e-38)
  // render(Infinity)
  // render(-Infinity)
});


test('performance', function () {
  //performance is almost the same
  canvas.height = 1;
  canvas.width = 300;
  var w = gl.drawingBufferWidth;
  var h = gl.drawingBufferHeight;

  var correctResult = (new Float32Array(300)).map(function (v, i) { return i; });

  test('glsl-to-float', function () {
    var shader = Shader(gl, "\
    attribute vec2 position;\
    void main() {\
      gl_Position = vec4(position, 0, 1);\
    }",
    glslify("\
    #pragma glslify: packFloat = require(./index.glsl)\n\
    void main() {\
      gl_FragColor = packFloat(floor(gl_FragCoord.x));\
    }", {inline: true})
    );

    //Draw shader
    shader.bind()
    triangle(gl)

    //Read back the float
    var buffer = new Uint8Array(4*w)
    gl.readPixels(0, 0, w, 1, gl.RGBA, gl.UNSIGNED_BYTE, buffer)
    var unpacked = toFloat(buffer);
    assert.deepEqual(unpacked, correctResult);
  });


  test('glsl-read-float', function () {
    var shader = Shader(gl, "\
    attribute vec2 position;\
    void main() {\
      gl_Position = vec4(position, 0, 1);\
    }",
    glslify("\
    #pragma glslify: packFloat = require(glsl-read-float)\n\
    void main() {\
      gl_FragColor = packFloat(floor(gl_FragCoord.x));\
    }", {inline: true})
    );

    //Draw shader
    shader.bind()
    triangle(gl)

    //Read back the float
    var buffer = new Uint8Array(4*w)
    gl.readPixels(0, 0, w, 1, gl.RGBA, gl.UNSIGNED_BYTE, buffer)
    var unpacked = new Float32Array(w);
    for (var i = 0, j = 0; j < w; j++, i+=4) {
      unpacked[j] = readFloat(buffer[i+0],buffer[i+1],buffer[i+2],buffer[i+3]);
    }
    assert.deepEqual(unpacked, correctResult);
  });
});