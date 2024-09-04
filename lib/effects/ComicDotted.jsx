// https://www.youtube.com/watch?v=ldv94GUzTOA

import { Effect } from "postprocessing";
import { forwardRef } from "react";
import * as THREE from "three";

const fragmentShader = /* glsl */ `
    float drawDot(
      vec2 uv,
      float size
    ) {
      float dot = length(uv);
      dot *= sqrt(2.0);
      dot -= size;
      dot /= 0.01;
      dot = clamp(dot, 0.0, 1.0);

      return dot;
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor)
    {
      float repetitions = 40.0;

      vec2 newUv = uv;
      // newUv.x *= resolution.x / resolution.y;
      newUv.x *= aspect;
      newUv = fract(newUv * repetitions) - 0.5;

      // Sample neighboring colors from quantized input image
      vec3 newInputColor = texture(inputBuffer, floor(uv * repetitions) / repetitions).rgb;
      float gray = dot(newInputColor, vec3(0.299, 0.587, 0.114));

      float dot = drawDot(newUv, gray);

      vec3 color = vec3(dot);

      outputColor = vec4(color, 1.0);
      // outputColor = inputColor;
    }
`;

class ComicDottedEffect extends Effect {
  constructor({ resolution }) {
    super("ComicDottedEffect", fragmentShader, {
      // uniforms: new Map([["resolution", new THREE.Uniform(resolution)]]),
    });
  }
}

export default forwardRef(function ComicDotted(props, ref) {
  const effect = new ComicDottedEffect(props);

  return <primitive ref={ref} object={effect} />;
});
