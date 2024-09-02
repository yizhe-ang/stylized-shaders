import { OrbitControls } from "@react-three/drei";
import CartoonModel from "./CartoonModel";
import ToonMaterial from "../lib/materials/ToonMaterial";
import { extend, useThree } from "@react-three/fiber";
import OutlineEffect from "@/lib/effects/OutlineEffect";
import { EffectComposer } from "@react-three/postprocessing";
import HalfToneMaterial from "@/lib/materials/HalfToneMaterial";
import * as THREE from "three";
import CrossHatchingMaterial from "@/lib/materials/CrossHatchingMaterial";

extend({ ToonMaterial, HalfToneMaterial, CrossHatchingMaterial });

const Experience = () => {
  const { size, gl } = useThree();
  const dpr = gl.getPixelRatio()

  return (
    <>
      <OrbitControls />

      <ambientLight intensity={1} />
      <directionalLight intensity={3} />

      {/* <CartoonModel /> */}

      <mesh>
        {/* <torusKnotGeometry args={[1, 0.4, 100, 100]} /> */}
        <boxGeometry args={[3, 3, 3]} />
        {/* <halfToneMaterial
          uResolution={new THREE.Vector2(size.width, size.height)}
        /> */}
        <crossHatchingMaterial
          uResolution={new THREE.Vector2(size.width * dpr, size.height * dpr)}
        />
      </mesh>

      {/* <EffectComposer>
        <primitive object={new OutlineEffect()} />
      </EffectComposer> */}
    </>
  );
};

export default Experience;
