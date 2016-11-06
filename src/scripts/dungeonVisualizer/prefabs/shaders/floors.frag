precision mediump float;
varying vec3 vNormal;
varying vec3 vColor;
varying vec2 vUv;

#include <common>
#include <lights_pars>

uniform float opacity;

void main() {

    vec2 uv = mod(vUv, 1.) - 0.5;
    float d = clamp(uv.x * uv.x + uv.y * uv.y, 0., 1.);
	vec3 c = d * d * vColor;

    #if NUM_DIR_LIGHTS > 0
    vec3 light;
	for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
		light = max( dot(normalize(vNormal), directionalLights[i].direction), 0.0) * directionalLights[i].color * 0.5;
		c += light;
	}
	#endif

	gl_FragColor = vec4(c, opacity);
}
