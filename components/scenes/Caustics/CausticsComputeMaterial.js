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
  uniform vec3 uLight;
  uniform float uIntensity;

  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vec2 uv = vUv;

    vec3 normalTexture = texture(uTexture, uv).rgb;
    vec3 normal = normalize(normalTexture);
    vec3 lightDir = normalize(uLight);

    vec3 ray = refract(lightDir, normal, 1.0 / 1.25);

    vec3 newPos = vPosition.xyz + ray;
    vec3 oldPos = vPosition.xyz;

    float lightArea = length(dFdx(oldPos)) * length(dFdy(oldPos));
    float newLightArea = length(dFdx(newPos)) * length(dFdy(newPos));

    float value = lightArea / newLightArea;
    float scale = clamp(value, 0.0, 1.0) * uIntensity;
    scale *= scale;

    gl_FragColor = vec4(vec3(scale), 1.0);
  }
`;

const NormalMaterial = shaderMaterial({}, surfaceVertex, surfaceFragment);

export default NormalMaterial;
