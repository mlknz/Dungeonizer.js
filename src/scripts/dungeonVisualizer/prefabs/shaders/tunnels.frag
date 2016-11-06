precision mediump float;
varying vec3 vNormal;

#include <common>
#include <lights_pars>

uniform vec3 color;
varying vec3 nothing;

void main() {

	vec3 c = color.b > 0.4 ? vec3(abs(sin(157.21355 * nothing.x)), abs(sin(157.21355 * nothing.x * nothing.z)) / 2., abs(sin(157.21355 * nothing.z))) : color;

    #if NUM_DIR_LIGHTS > 0
    vec3 light;
	for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
		light = max( dot(normalize(vNormal), directionalLights[i].direction), 0.0) * directionalLights[i].color * 0.5;
		c += light;
	}
	#endif

	gl_FragColor = vec4(c, 1.0);
}
