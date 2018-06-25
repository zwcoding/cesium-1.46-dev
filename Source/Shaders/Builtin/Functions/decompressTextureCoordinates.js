//This file is automatically rebuilt by the Cesium build process.
define(function() {
    'use strict';
    return "vec2 czm_decompressTextureCoordinates(float encoded)\n\
{\n\
float temp = encoded / 4096.0;\n\
float xZeroTo4095 = floor(temp);\n\
float stx = xZeroTo4095 / 4095.0;\n\
float sty = (encoded - xZeroTo4095 * 4096.0) / 4095.0;\n\
return vec2(stx, sty);\n\
}\n\
";
});