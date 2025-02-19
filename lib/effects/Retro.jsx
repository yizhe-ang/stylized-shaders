// https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web/

import { forwardRef, useMemo } from "react";
import { orderedDither, orderedDitherQuantized, whiteNoiseDither } from "../shaders/dithering";
import { Effect } from "postprocessing";
import { resolveLygia } from "resolve-lygia";

const fragmentShader = resolveLygia(/* glsl */ `
  #include "lygia/sample/dither.glsl"
  #include "lygia/color/luma.glsl"
  ${orderedDitherQuantized}

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor)
  {
    // CRT curvature
    vec2 curveUV = uv * 2.0 - 1.0;
    vec2 offset = curveUV.yx * curve;
    curveUV += curveUV * offset * offset;
    curveUV = curveUV * 0.5 + 0.5;

    vec2 edge = smoothstep(0.0, 0.02, curveUV) * (1.0 - smoothstep(1.0 - 0.02, 1.0, curveUV));
    color.rgb *= edge.x * edge.y;

    // Pixelize
    // float pixelSize = 2.0;
    // vec2 normalizedPixelSize = pixelSize / resolution;
    // vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

    //  vec3 color = texture(inputBuffer, uvPixel).rgb;

    // TODO: XOR shader CRT mask

    // #define DITHER_PRECISION 4
    // #define SAMPLEDITHER_FNC ditherBayer

    // color = sampleDither(inputBuffer, uv, resolution * 0.2).rgb;
    // color = vec3(luma(color));

    // float lum = dot(vec3(0.2126, 0.7152, 0.0722), color);
    // color = orderedDither(uv, lum, resolution / 2.0);

    color = orderedDitherQuantized(uvPixel, color, resolution);

    // Scanlines
    float lines = sin(uv.y * 2000.0 + time * 100.0);
    color *= lines + 1.0;

    outputColor = vec4(color, 1.0);
  }

  void main(inout vec2 uv) {
    // Some distortion
    uv.x += shake * 1.5;
  }
`);

class RetroEffect extends Effect {
  constructor() {
    super("RetroEffect", fragmentShader, {
      uniforms: new Map([]),
    });
  }
}

const Retro = forwardRef(({ param }, ref) => {
  const effect = useMemo(() => new RetroEffect(param), [param]);

  return <primitive ref={ref} object={effect} dispose={null} />;
});

export default Retro;
