export const tonal = /* glsl */ `
  vec3 tonal(
    vec3 color,
    float pixelLuma,
    float depth
  ) {
    if (pixelLuma <= 0.35 && depth <= 0.99) {
      return color * 0.0;
    }

    if (pixelLuma <= 0.45 && depth <= 0.99) {
      return color * 0.25;
    }

    if (pixelLuma <= 0.6 && depth <= 0.99) {
      return color * 0.5;
    }

    if (pixelLuma <= 0.75 && depth <= 0.99) {
      return color * 0.7;
    }
  }
`;

export const raster = /* glsl */ `
  vec3 raster(
    vec3 color,
    float pixelLuma,
    float depth,
    vec2 uv,
    vec2 resolution
  ) {
    const float rasterSize = 6.0;
    // Compute circle
    float raster = length(mod(uv * resolution, vec2(rasterSize)) / rasterSize - vec2(0.5));

    // Less luminance, bigger circles
    if (pixelLuma <= raster * 1.25 && depth <= 0.99) {
      return vec3(0.0);
    } else {
      return color;
    }
  }
`;

export const crosshatch = /* glsl */ `
  vec3 crosshatch(
    vec3 color,
    float pixelLuma,
    float depth,
    vec2 uv,
    vec2 resolution,
    float outlineThickness,
    vec3 outlineColor
  ) {
    const float modVal = 11.0;

    if (pixelLuma < 0.35 && depth < 0.99) {
      if (mod(uv.y * resolution.y, modVal) < outlineThickness) {
        return outlineColor;
      };
    }
    if (pixelLuma < 0.55 && depth < 0.99) {
      if (mod(uv.x * resolution.x, modVal) < outlineThickness) {
        return outlineColor;
      };

    }
    if (pixelLuma < 0.80 && depth < 0.99) {
      if (mod(uv.x * resolution.y + uv.y * resolution.x, modVal) < outlineThickness) {
        return outlineColor;
      };
    }

    return color;
  }
`;
