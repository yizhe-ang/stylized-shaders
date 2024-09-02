// https://www.youtube.com/watch?v=3Q6Ik1V75I8

import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { directionalLight } from "../shaders/lighting";
import { rotate2D } from "../shaders/common";
import { resolveLygia } from "resolve-lygia";

const CrossHatchingMaterial = shaderMaterial(
  {
    uResolution: new THREE.Vector2(),
    uHatchDirection: new THREE.Vector2(-1, 1).normalize(),
    uRepetitions: 200,
    uThickness: 0.2,
    uContrast: 0.3,
  },
  /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Position
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Model normal
    vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

    // Varyings
    vNormal = modelNormal;
    vPosition = modelPosition.xyz;
    vUv = uv;
  }
  `,
  resolveLygia(/* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform vec2 uResolution;
  uniform vec2 uHatchDirection;
  uniform float uRepetitions;
  uniform float uThickness;
  uniform float uContrast;

  ${directionalLight}
  ${rotate2D}

  #include "lygia/generative/voronoi.glsl"

  vec2 skew(vec2 uv, float skewAmount, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    mat2 rotationMatrix = mat2(c, -s, s, c);
    uv = rotationMatrix * uv;
    uv.x += uv.y * skewAmount;
    uv = inverse(rotationMatrix) * uv;
    return uv;
}

  float crosshatch(
    vec2 uv,
    vec2 hatchDirection,
    float repetitions,
    float thickness,
    float contrast
  ) {
    float hatch = dot(uv, hatchDirection);
    hatch = fract(hatch * repetitions);
    hatch = abs(hatch * 2.0 - 1.0);

    hatch -= thickness;
    hatch /= contrast;
    hatch = clamp(hatch, 0.0, 1.0);

    return hatch;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv -= 0.5;

    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(1.0);

    // float repetitions = uResolution.y / 10.0;

    vec2 skewedUv = skew(uv, 1.5, radians(-25.0));
    vec3 v = voronoi(skewedUv * 20.0, 0.0);

    // Random rotation for each cell
    float randomDeg = (v.x - 0.5) * 20.0;

    // Random number of lines for each cell
    float repetitions = uRepetitions * (1.0 + (v.y - 0.5) * 0.5);

    // FIXME: Different number of hatches depending on light

    // Hatching
    float hatch = crosshatch(
      uv,
      rotate2D(uHatchDirection, radians(randomDeg)),
      repetitions,
      uThickness,
      uContrast
    );

    hatch = min(crosshatch(
      uv,
      rotate2D(uHatchDirection, radians(90.0 + randomDeg)),
      repetitions,
      uThickness,
      uContrast
    ), hatch);

    // Lights
    vec3 light = vec3(0.0);

    light += directionalLight(
      vec3(1.0, 1.0, 1.0), // Light color
      1.0,                 // Light intensity
      normal,              // Normal
      vec3(1.0, 1.0, 1.0), // Light position
      viewDirection,       // View direction
      1.0                  // Specular power
    );

    color = mix(vec3(hatch), color, light);

    // color = vec3(v.x);

    gl_FragColor = vec4(color, 1.0);
    // #include <tonemapping_fragment>
    // #include <colorspace_fragment>

    // TODO: How to add ambient occlusion
    // TODO: Add paper texture
  }
  `)
);

export default CrossHatchingMaterial;
