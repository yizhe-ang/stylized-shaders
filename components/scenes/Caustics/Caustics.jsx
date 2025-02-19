import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

const Caustics = () => {
  const mesh = useRef();
  const causticsPlane = useRef();

  const light = new THREE.Vector3(-10, 13, -10);

  const normalRenderTarget = useFBO(2000, 2000, {});

  const [normalCamera] = useState(
    () => new THREE.PerspectiveCamera(65, 1, 0.1, 1000)
  );

  const [normalMaterial] = useState(() => new NormalMaterial());

  const causticsComputeRenderTarget = useFBO(2000, 2000, {});
  const [causticsQuad] = useState(() => new FullScreenQuad());

  const [causticsComputeMaterial] = useState(
    () => new causticsComputeMaterial()
  );

  const [causticsPlaneMaterial] = useState(() => new CausticsPlaneMaterial());
  causticsPlaneMaterial.transparent = true;
  causticsPlaneMaterial.blending = THREE.CustomBlending;
  causticsPlaneMaterial.blendSrc = THREE.OneFactor;
  causticsPlaneMaterial.blendDst = THREE.SrcAlphaFactor;

  useFrame(() => {
    const { gl } = state;

    const originalMaterial = mesh.current.material;

    mesh.current.material = normalMaterial;
    mesh.current.material.side = THREE.BackSide;

    gl.setRenderTarget(normalRenderTarget);
    gl.render(mesh.current, normalCamera);

    mesh.current.material = originalMaterial;

    causticsQuad.material = causticsComputeMaterial;
    causticsQuad.material.uniforms.uTexture.value = normalRenderTarget.texture;
    causticsQuad.material.uniforms.uLight.value = light;
    causticsQuad.material.uniforms.uIntensity.value = intensity;

    gl.setRenderTarget(causticsRenderTarget);
    causticsQuad.render(gl);

    causticsPlane.current.material.map = normalRenderTarget.texture;

    gl.setRenderTarget(null);

    const bounds = new THREE.Box3().setFromObject(mesh.current, true);

    let boundsVertices = [];
    boundsVertices.push(
      new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.min.z)
    );

    const lightDir = new THREE.Vector3(light.x, light.y, light.z).normalize();

    const newVertices = boundsVertices.map((v) => {
      const newX = v.x + lightDir.x * (-v.y / lightDir.y);

      return THREE.Vector3(newX, newX, newX);
    });

    const centerPos = newVertices
      .reduce((a, b) => a.add(b), new THREE.Vector3(0, 0, 0))
      .divideScalar(newVertices.length)

    causticsPlane.current.position.set(centerPos.x, centerPos.y, centerPos.z)

    normalCamera.position.set(light.x, light.y, light.z);
    normalCamera.lookAt(
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).x,
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).y,
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).z
    );
    normalCamera.up = new THREE.Vector3(0, 1, 0);
  });

  return (
    <>
      <mesh ref={mesh} position={[0, 6.5, 0]}>
        <torusKnotGeometry args={[10, 3, 16, 100]} />
        <MeshTransmissionMaterial backside {...rest} />
      </mesh>
      <mesh
        ref={causticsPlane}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[5, 0, 5]}
      >
        <planeGeometry />
        <meshBasicMaterial />
      </mesh>
    </>
  );
};

export default Caustics;
