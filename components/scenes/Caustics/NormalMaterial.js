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
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 normal = normalize(vNormal);
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
  }
`;

const NormalMaterial = shaderMaterial({}, surfaceVertex, surfaceFragment);

export default NormalMaterial;
