precision mediump float;
varying vec3 vNormal;
varying vec3 vColor;

#include <common>
#include <lights_pars>

uniform float opacity;

void main() {

	vec3 c = vColor;

    #if NUM_DIR_LIGHTS > 0
    vec3 light;
	for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
		light = max( dot(normalize(vNormal), directionalLights[i].direction), 0.0) * directionalLights[i].color * 0.5;
		c += light;
	}
	#endif

	gl_FragColor = vec4(c, opacity);
}
