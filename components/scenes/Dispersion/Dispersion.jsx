import { useFrame } from "@react-three/fiber";

const Dispersion = () => {
  const mesh = useRef();
  const mainRenderTarget = useFBO();

  const uniforms = useMemo(
    () => ({
      uTexture: {
        value: null,
      },
      winResolution: {
        value: new THREE.Vector2(
          window.innerWidth,
          window.innerHeight
        ).multiplyScalar(Math.min(window.devicePixelRatio, 2)),
      },
    }),
    []
  );

  useFrame((state) => {
    const { gl, scene, camera } = state;
    mesh.current.visible = false;
    gl.setRenderTarget(mainRenderTarget);
    gl.render(scene, camera);

    mesh.current.material.uniforms.uTexture.value = mainRenderTarget.texture;

    gl.setRenderTarget(null);
    mesh.current.visible = false;
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[2, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const vertexShader = /* glsl */ `
  varying vec3 worldNormal;
  varying vec3 eyeVector;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec4 mvPosition = viewMatrix * worldPos;

    gl_Position = projectionMatrix * mvPosition;
    eyeVector = normalize(worldPos.xyz - cameraPosition);

    vec3 transformedNormal = normalMatrix * normal;
    worldNormal = normalize(transformedNormal);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec2 winResolution;
  uniform sampler2D uTexture;

  varying vec3 worldNormal;
  varying vec3 eyeVector;

  vec3 sat(vec3 rgb, float intensity) {
    vec3 L = vec3(0.2125, 0.7154, 0.0721);
    vec3 grayscale = vec3(dot(rgb, L));
    return mix(grayscale, rgb, intensity);
  }

  void main() {
    float iorRatio = 1.0 / 1.31;

    vec2 uv = gl_FragCoord.xy / winResolution.xy;
    vec3 normal = worldNormal;

    for(int i = 0; i < LOOP; i++) {
      float slide = float(i) / float(LOOP) * 0.1;

      vec3 refractVecR = refract(eyeVector, normal, iorRatioRed);
      vec3 refractVecR = refract(eyeVector, normal, iorRatioRed);
      vec3 refractVecR = refract(eyeVector, normal, iorRatioRed);

      color.r += texture2D(uTexture, uv + refractVecR.xy * (uRefractPower + slide * 1.0) * uChromaticAberration).r;
    }

    color /= float(LOOP);

    gl_FragColor = color;
  }
`;

export default Dispersion;
