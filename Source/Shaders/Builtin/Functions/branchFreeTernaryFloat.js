//This file is automatically rebuilt by the Cesium build process.
define(function() {
    'use strict';
    return "float czm_branchFreeTernaryFloat(bool comparison, float a, float b) {\n\
float useA = float(comparison);\n\
return a * useA + b * (1.0 - useA);\n\
}\n\
";
});