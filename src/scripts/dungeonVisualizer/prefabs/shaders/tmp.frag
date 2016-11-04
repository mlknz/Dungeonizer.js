precision mediump float;
varying vec3 vNormal;
varying float vIsMain;

#include <common>
#include <lights_pars>

uniform vec3 overwriteColor;
varying vec3 nothing;

void main() {
	vec3 light;

	vec3 c = (vIsMain < -0.5) ? vec3(0.8, 0.8, 0.8) : (vIsMain > 1.5) ? vec3(0.2, 0.5, 0.1) : (vIsMain > 0.5) ? vec3(0.6, 0., 0) : ambientLightColor;
    c = overwriteColor.x > 6. ? vec3(abs(sin(157.21355 * nothing.x)), abs(sin(157.21355 * nothing.x * nothing.z)) / 2., abs(sin(157.21355 * nothing.z))) : c;

    #if NUM_DIR_LIGHTS > 0
	for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
		light = max( dot(normalize(vNormal), directionalLights[i].direction), 0.0) * directionalLights[i].color * 0.5;
		c += light;
	}
	#endif

	gl_FragColor = vec4(c, 1.0);
}
