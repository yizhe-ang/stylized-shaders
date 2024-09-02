import { shaderMaterial } from "@react-three/drei";

const ToonMaterial = shaderMaterial(
  {},
  /* glsl */ `
  void main() {
    float test = dot(lightDirection, normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  /* glsl */ `
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
  `
);

export default ToonMaterial;
