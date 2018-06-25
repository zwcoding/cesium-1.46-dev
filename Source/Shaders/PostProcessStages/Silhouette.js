//This file is automatically rebuilt by the Cesium build process.
define(function() {
    'use strict';
    return "uniform sampler2D colorTexture;\n\
uniform sampler2D silhouetteTexture;\n\
varying vec2 v_textureCoordinates;\n\
void main(void)\n\
{\n\
vec4 silhouetteColor = texture2D(silhouetteTexture, v_textureCoordinates);\n\
gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), silhouetteColor, silhouetteColor.a);\n\
}\n\
";
});