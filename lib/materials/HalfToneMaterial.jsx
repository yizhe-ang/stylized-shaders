// https://threejs-journey.com/lessons/halftone-shading-shaders

import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { ambientLight, directionalLight } from "../shaders/lighting";

const HalfToneMaterial = shaderMaterial(
  {
    uColor: new THREE.Color("lightblue"),
    uPointColor: new THREE.Color("red"),
    uResolution: new THREE.Vector2(),
    uRepititions: 50,
    uDirection: new THREE.Vector3(0, -1, 0),
    uLow: -0.5,
    uHigh: 1.5,
  },
  /* glsl */ `
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
  }`,
  /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uPointColor;
  uniform vec2 uResolution;
  uniform float uRepititions;
  uniform vec3 uDirection;
  uniform float uLow;
  uniform float uHigh;

  varying vec3 vNormal;
  varying vec3 vPosition;

  ${ambientLight}
  ${directionalLight}

  void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;

    // Lights
    vec3 light = vec3(0.0);

    light += ambientLight(
      vec3(1.0), // Light color
      1.0        // Light intensity,
    );

    light += directionalLight(
      vec3(1.0, 1.0, 1.0), // Light color
      1.0,                 // Light intensity
      normal,              // Normal
      vec3(1.0, 1.0, 0.0), // Light position
      viewDirection,       // View direction
      1.0                  // Specular power
    );

    color *= light;

    // Halftone
    float intensity = dot(normal, uDirection);
    intensity = smoothstep(uLow, uHigh, intensity);

    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv *= uRepititions;
    uv = fract(uv);

    float point = distance(uv, vec2(0.5));
    point = 1.0 - step(0.5 * intensity, point);

    color = mix(color, uPointColor, point);

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`
);

export default HalfToneMaterial;
