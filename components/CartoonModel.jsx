// https://www.youtube.com/watch?v=V5UllFImvoE

import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

const CartoonModel = () => {
  const texture = useTexture("./textures/fiveTone.jpg");
  texture.minFilter = texture.magFilter = THREE.NearestFilter;

  const mesh = useMemo(() => {
    const mesh = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1, 0.4, 100, 100),
      new THREE.MeshToonMaterial({
        color: "lightblue",
        gradientMap: texture,
      })
    );

    return mesh;
  }, [texture]);

  const meshOutline = useMemo(() => {
    const meshOutline = solidify(mesh);

    return meshOutline;
  }, [mesh]);

  return (
    <>
      <primitive object={mesh} />
      <primitive object={meshOutline} />
    </>
  );
};

function solidify(mesh) {
  const THICKNESS = 0.02;
  const geometry = mesh.geometry;
  const material = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      void main() {
        vec3 newPosition = position + normal * ${THICKNESS};
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    `,
    side: THREE.BackSide,
  });

  const outline = new THREE.Mesh(geometry, material);

  return outline;
}

export default CartoonModel;
