//This file is automatically rebuilt by the Cesium build process.
define(function() {
    'use strict';
    return "float fastApproximateAtan01(float x) {\n\
return x * (-0.1784 * x - 0.0663 * x * x + 1.0301);\n\
}\n\
float fastApproximateAtan2(float x, float y) {\n\
float t = abs(x);\n\
float opposite = abs(y);\n\
float adjacent = max(t, opposite);\n\
opposite = min(t, opposite);\n\
t = fastApproximateAtan01(opposite / adjacent);\n\
t = czm_branchFreeTernaryFloat(abs(y) > abs(x), czm_piOverTwo - t, t);\n\
t = czm_branchFreeTernaryFloat(x < 0.0, czm_pi - t, t);\n\
t = czm_branchFreeTernaryFloat(y < 0.0, -t, t);\n\
return t;\n\
}\n\
vec2 czm_approximateSphericalCoordinates(vec3 normal) {\n\
float latitudeApproximation = fastApproximateAtan2(sqrt(normal.x * normal.x + normal.y * normal.y), normal.z);\n\
float longitudeApproximation = fastApproximateAtan2(normal.x, normal.y);\n\
return vec2(latitudeApproximation, longitudeApproximation);\n\
}\n\
";
});