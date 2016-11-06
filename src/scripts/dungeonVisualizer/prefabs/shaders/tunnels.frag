precision mediump float;
varying vec3 vNormal;

#include <common>
#include <lights_pars>

varying vec3 vColor;
varying vec2 vUv;

void main() {

	vec3 c = vColor * sqrt(vUv.y);

    #if NUM_DIR_LIGHTS > 0
    vec3 light;
	for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
		light = max( dot(normalize(vNormal), directionalLights[i].direction), 0.0) * directionalLights[i].color * 0.5;
		c += light;
	}
	#endif

	gl_FragColor = vec4(c, 1.0);
}
