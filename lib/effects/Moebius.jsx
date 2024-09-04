// https://blog.maximeheckel.com/posts/moebius-style-post-processing/

import { Effect, EffectAttribute } from "postprocessing";
import { forwardRef } from "react";
import { resolveLygia } from "resolve-lygia";
import * as THREE from "three";
import { crosshatch } from "../shaders/shadows";

const fragmentShader = resolveLygia(/* glsl */ `
    uniform sampler2D sceneDepth;
    uniform sampler2D sceneNormal;

    const mat3 Sx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 );
    const mat3 Sy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 );

    #include "lygia/color/luma.glsl"
    ${crosshatch}

    float hash(vec2 p) {
      vec3 p3  = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);

      return fract((p3.x + p3.y) * p3.z);
    }

    float readDepth( sampler2D depthTexture, vec2 coord ) {
      float fragCoordZ = texture2D( depthTexture, coord ).x;
      float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
      return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor)
    {
      vec3 color = inputColor.rgb;

      float outlineThickness = 3.0;
      vec3 outlineColor = vec3(0.0, 0.0, 0.0);

      float depth = readDepth(sceneDepth, uv);
      vec4 normal = texture(sceneNormal, uv);

      // Wiggle outline
      float frequency = 0.05;
      float amplitude = 2.0;

      vec2 displacement = vec2(
        (hash(gl_FragCoord.xy) * sin(gl_FragCoord.y * frequency)),
        (hash(gl_FragCoord.xy) * cos(gl_FragCoord.x * frequency))
      ) * amplitude / resolution.xy;

      vec2 displacedUv = uv + displacement;

      // Sample depth buffer

      float depth00 = readDepth(sceneDepth, displacedUv + outlineThickness * texelSize * vec2(-1, 1));
      float depth01 = readDepth(sceneDepth, displacedUv + outlineThickness * texelSize * vec2(-1, 0));
      float depth02 = readDepth(sceneDepth, displacedUv + outlineThickness * texelSize * vec2(-1, -1));

      float depth10 = readDepth(sceneDepth, displacedUv + outlineThickness * texelSize * vec2(0, -1));
      float depth11 = readDepth(sceneDepth, displacedUv + outlineThickness * texelSize * vec2(0, 0));
      float depth12 = readDepth(sceneDepth, displacedUv + outlineThickness * texelSize * vec2(0, 1));

      float depth20 = readDepth(sceneDepth, displacedUv + outlineThickness * texelSize * vec2(1, -1));
      float depth21 = readDepth(sceneDepth, displacedUv + outlineThickness * texelSize * vec2(1, 0));
      float depth22 = readDepth(sceneDepth, displacedUv + outlineThickness * texelSize * vec2(1, 1));

      float xSobelValue = Sx[0][0] * depth00 + Sx[1][0] * depth01 + Sx[2][0] * depth02 +
                      Sx[0][1] * depth10 + Sx[1][1] * depth11 + Sx[2][1] * depth12 +
                      Sx[0][2] * depth20 + Sx[1][2] * depth21 + Sx[2][2] * depth22;

      float ySobelValue = Sy[0][0] * depth00 + Sy[1][0] * depth01 + Sy[2][0] * depth02 +
                          Sy[0][1] * depth10 + Sy[1][1] * depth11 + Sy[2][1] * depth12 +
                          Sy[0][2] * depth20 + Sy[1][2] * depth21 + Sy[2][2] * depth22;

      float gradientDepth = sqrt(pow(xSobelValue, 2.0) + pow(ySobelValue, 2.0));

      // Sample normal buffer
      float normal00 = luma(texture(sceneNormal, displacedUv + outlineThickness * texelSize * vec2(-1, -1)).rgb);
      float normal01 = luma(texture(sceneNormal, displacedUv + outlineThickness * texelSize * vec2(-1, 0)).rgb);
      float normal02 = luma(texture(sceneNormal, displacedUv + outlineThickness * texelSize * vec2(-1, 1)).rgb);

      float normal10 = luma(texture(sceneNormal, displacedUv + outlineThickness * texelSize * vec2(0, -1)).rgb);
      float normal11 = luma(texture(sceneNormal, displacedUv + outlineThickness * texelSize * vec2(0, 0)).rgb);
      float normal12 = luma(texture(sceneNormal, displacedUv + outlineThickness * texelSize * vec2(0, 1)).rgb);

      float normal20 = luma(texture(sceneNormal, displacedUv + outlineThickness * texelSize * vec2(1, -1)).rgb);
      float normal21 = luma(texture(sceneNormal, displacedUv + outlineThickness * texelSize * vec2(1, 0)).rgb);
      float normal22 = luma(texture(sceneNormal, displacedUv + outlineThickness * texelSize * vec2(1, 1)).rgb);

      float xSobelNormal =
        Sx[0][0] * normal00 + Sx[1][0] * normal10 + Sx[2][0] * normal20 +
        Sx[0][1] * normal01 + Sx[1][1] * normal11 + Sx[2][1] * normal21 +
        Sx[0][2] * normal02 + Sx[1][2] * normal12 + Sx[2][2] * normal22;

      float ySobelNormal =
        Sy[0][0] * normal00 + Sy[1][0] * normal10 + Sy[2][0] * normal20 +
        Sy[0][1] * normal01 + Sy[1][1] * normal11 + Sy[2][1] * normal21 +
        Sy[0][2] * normal02 + Sy[1][2] * normal12 + Sy[2][2] * normal22;

      float gradientNormal = sqrt(pow(xSobelNormal, 2.0) + pow(ySobelNormal, 2.0));

      float outline = gradientDepth * 25.0 + gradientNormal;

      // Shadow pattern
      float diffuseLight = normal.a;
      // Ensure areas with a darker color but lit by our light do not show too much shadow patterns
      float pixelLuma = luma(inputColor.rgb + diffuseLight * 0.65);

      color = crosshatch(
        color,
        pixelLuma,
        depth,
        uv + displacement,
        resolution,
        outlineThickness,
        outlineColor
      );

      // Add specular highlight
      if (normal.r >= 1.0 && normal.g >= 1.0 && normal.b >= 1.0) {
        color = vec3(1.0, 1.0, 1.0);
      }

      color = mix(color, outlineColor, outline);

      outputColor = vec4(color, 1.0);
    }
`);

class MoebiusEffect extends Effect {
  constructor({ sceneDepth, sceneNormal }) {
    super("MoebiusEffect", fragmentShader, {
      uniforms: new Map([
        ["sceneDepth", new THREE.Uniform(sceneDepth)],
        ["sceneNormal", new THREE.Uniform(sceneNormal)],
      ]),
      // attributes: EffectAttribute.DEPTH,
    });
  }
}

export default forwardRef(function Moebius(props, ref) {
  const effect = new MoebiusEffect(props);

  return <primitive ref={ref} object={effect} />;
});
