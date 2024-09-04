import { OrbitControls, PerspectiveCamera, useFBO } from "@react-three/drei";
import CartoonModel from "./CartoonModel";
import ToonMaterial from "../lib/materials/ToonMaterial";
import { extend, useFrame, useThree } from "@react-three/fiber";
import OutlineEffect from "@/lib/effects/OutlineEffect";
import { EffectComposer, ToneMapping } from "@react-three/postprocessing";
import HalfToneMaterial from "@/lib/materials/HalfToneMaterial";
import * as THREE from "three";
import CrossHatchingMaterial from "@/lib/materials/CrossHatchingMaterial";
import ComicDotted from "@/lib/effects/ComicDotted";
import Moebius from "@/lib/effects/Moebius";
import { useMemo, useRef } from "react";
import CustomNormalMaterial from "@/lib/materials/CustomNormalMaterial";

extend({ ToonMaterial, HalfToneMaterial, CrossHatchingMaterial });

const Experience = () => {
  const { size, gl } = useThree();
  const dpr = gl.getPixelRatio();

  const mesh = useRef();
  const ground = useRef();

  const lightPosition = useMemo(() => {
    return [10, 10, 10];
  }, []);

  const depthTexture = useMemo(
    () => new THREE.DepthTexture(size.width, size.height),
    [size]
  );

  const depthRenderTarget = useFBO(size.width, size.height, {
    depthTexture,
    depthBuffer: true,
  });

  const normalRenderTarget = useFBO();

  useFrame((state) => {
    const { gl, scene, camera } = state;

    // Render depth buffer
    gl.setRenderTarget(depthRenderTarget);
    gl.render(scene, camera);

    // Render normal buffer
    const originalSceneMaterial = scene.overrideMaterial;

    gl.setRenderTarget(normalRenderTarget);

    scene.matrixWorldNeedsUpdate = true;
    scene.overrideMaterial = CustomNormalMaterial;
    scene.overrideMaterial.uniforms.lightPosition.value = lightPosition;

    gl.render(scene, camera);

    scene.overrideMaterial = originalSceneMaterial;

    gl.setRenderTarget(null);
  });

  return (
    <>
      <OrbitControls />

      <PerspectiveCamera
        makeDefault
        position={[0, 5, 10]}
        near={0.01}
        far={200}
      />

      <color attach="background" args={["#1B43BA"]} />

      <ambientLight intensity={0.2} color="#FFFFFF" />
      <directionalLight
        castShadow
        position={lightPosition}
        // intensity={4.5}
        intensity={25}
        color="#fff"
        target={ground.current}
      />
      <mesh castShadow receiveShadow position={[-1, 2, 1]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        rotation={[0, Math.PI / 3, 0]}
        position={[2, 1, 2]}
      >
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <mesh
        ref={ground}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[10, 10, 100, 100]} />
        <meshStandardMaterial color="white" />
      </mesh>

      <EffectComposer toneMapping>
        {/* <ComicDotted
          resolution={new THREE.Vector2(size.width * dpr, size.height * dpr)}
        /> */}
        <Moebius
          sceneDepth={depthRenderTarget.depthTexture}
          sceneNormal={normalRenderTarget.texture}
        />
        {/* <ToneMapping /> */}
      </EffectComposer>
    </>
  );
};

export default Experience;
