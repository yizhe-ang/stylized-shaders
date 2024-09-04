import * as THREE from "three";

const CustomNormalMaterial = new THREE.ShaderMaterial({
  uniforms: { lightPosition: new THREE.Uniform(new THREE.Vector3()) },
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 eyeVector;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vec4 mvPosition = viewMatrix * worldPos;

      gl_Position = projectionMatrix * mvPosition;

      vec3 transformedNormal = normalMatrix * normal;
      vNormal = normalize(transformedNormal);
      eyeVector = normalize(worldPos.xyz - cameraPosition);
    }
    `,
  fragmentShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 eyeVector;
    uniform vec3 lightPosition;

    const float shininess = 600.0;
    const float diffuseness = 0.5;

    vec2 phong() {
      vec3 normal = normalize(vNormal);
      vec3 lightDirection = normalize(lightPosition);
      vec3 halfVector = normalize(eyeVector - lightDirection);

      float NdotL = dot(normal, lightDirection);
      float NdotH =  dot(normal, halfVector);
      float NdotH2 = NdotH * NdotH;

      float kDiffuse = max(0.0, NdotL) * diffuseness;
      float kSpecular = pow(NdotH2, shininess);

      return vec2(kSpecular, kDiffuse);
    }

    void main() {
      vec3 color = vec3(vNormal);
      vec2 phongLighting = phong();

      float specularLight = phongLighting.x;
      float diffuseLight = phongLighting.y;

      // Draw specular
      if (specularLight >= 0.25) {
        color = vec3(1.0, 1.0, 1.0);
      }

      gl_FragColor = vec4(color, diffuseLight);
    }
    `,
});

export default CustomNormalMaterial;
