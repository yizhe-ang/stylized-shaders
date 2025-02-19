import { shaderMaterial } from "@react-three/drei";

const surfaceVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);

  // Set the final position of the vertex
  gl_Position = projectionMatrix * modelViewPosition;
}
`;

const surfaceFragment = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uAberration;

  varying vec2 vUv;

  const int SAMPLES = 16;

  float random(vec2 p){
    return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  vec3 sat(vec3 rgb, float adjustment) {
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return mix(intensity, rgb, adjustment);
  }

  void main() {
    vec2 uv = vUv;
    vec4 color = vec4(0.0);

    vec3 refractCol = vec3(0.0);

    for (int i = 0; i < SAMPLES; i++) {
      float noiseIntensity = 0.01;
      float noise = random(uv) * noiseIntensity;
      float slide = float(i) / float(SAMPLES) * 0.1 + noise;

      refractCol.r += texture2D(uTexture, uv + (uAberration * slide * 1.0)).r;
      refractCol.g += texture2D(uTexture, uv + (uAberration * slide * 2.0)).g;
      refractCol.b += texture2D(uTexture, uv + (uAberration * slide * 3.0)).b;
    }

    refractCol /= float(SAMPLES);
    refractCol = sat(refractCol, 1.265);

    color = refractCol;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const NormalMaterial = shaderMaterial({}, surfaceVertex, surfaceFragment);

export default NormalMaterial;
