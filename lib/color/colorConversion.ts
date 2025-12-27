/**
 * Color space conversion utilities for RGB ↔ XYZ ↔ LAB transformations
 * Uses D65 illuminant (standard daylight) for XYZ/LAB conversions
 */

/**
 * Convert RGB to XYZ color space (D65 illuminant)
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns [X, Y, Z] values scaled to 0-100
 */
export function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  // Linearize sRGB values (inverse gamma correction)
  const linearize = (c: number) => {
    const normalized = c / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const rLin = linearize(r);
  const gLin = linearize(g);
  const bLin = linearize(b);

  // D65 transformation matrix (Observer: 2°, Illuminant: D65)
  const x = rLin * 0.4124564 + gLin * 0.3575761 + bLin * 0.1804375;
  const y = rLin * 0.2126729 + gLin * 0.7151522 + bLin * 0.0721750;
  const z = rLin * 0.0193339 + gLin * 0.1191920 + bLin * 0.9503041;

  return [x * 100, y * 100, z * 100]; // Scale to 0-100
}

/**
 * Convert XYZ to LAB color space (D65 white point)
 * @param x X component (0-100)
 * @param y Y component (0-100)
 * @param z Z component (0-100)
 * @returns [L*, a*, b*] values
 */
export function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  // D65 reference white point
  const xn = 95.047;
  const yn = 100.000;
  const zn = 108.883;

  // CIE LAB f(t) function
  const f = (t: number) => {
    const delta = 6 / 29;
    return t > Math.pow(delta, 3)
      ? Math.pow(t, 1 / 3)
      : t / (3 * delta * delta) + 4 / 29;
  };

  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [L, a, b];
}

/**
 * Convert LAB to XYZ color space (inverse transformation)
 * @param L L* component (0-100)
 * @param a a* component (-128 to 128)
 * @param b b* component (-128 to 128)
 * @returns [X, Y, Z] values
 */
export function labToXyz(L: number, a: number, b: number): [number, number, number] {
  // D65 reference white point
  const xn = 95.047;
  const yn = 100.000;
  const zn = 108.883;

  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  // Inverse f(t) function
  const finv = (t: number) => {
    const delta = 6 / 29;
    return t > delta ? Math.pow(t, 3) : 3 * delta * delta * (t - 4 / 29);
  };

  const x = xn * finv(fx);
  const y = yn * finv(fy);
  const z = zn * finv(fz);

  return [x, y, z];
}

/**
 * Convert XYZ to RGB color space
 * @param x X component (0-100)
 * @param y Y component (0-100)
 * @param z Z component (0-100)
 * @returns [R, G, B] values (0-255)
 */
export function xyzToRgb(x: number, y: number, z: number): [number, number, number] {
  x /= 100;
  y /= 100;
  z /= 100;

  // D65 inverse transformation matrix
  let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  let b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

  // Gamma correction (linearRGB → sRGB)
  const gammaCorrect = (c: number) => {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };

  r = Math.max(0, Math.min(1, gammaCorrect(r))) * 255;
  g = Math.max(0, Math.min(1, gammaCorrect(g))) * 255;
  b = Math.max(0, Math.min(1, gammaCorrect(b))) * 255;

  return [Math.round(r), Math.round(g), Math.round(b)];
}

/**
 * Convert hex color to RGB
 * @param hex Hex color string (e.g., "#FF5733" or "FF5733")
 * @returns [R, G, B] values (0-255)
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

/**
 * Convert RGB to hex color
 * @param r Red component (0-255)
 * @param g Green component (0-255)
 * @param b Blue component (0-255)
 * @returns Hex color string (e.g., "#ff5733")
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Complete conversion: Hex → LAB
 * @param hex Hex color string
 * @returns [L*, a*, b*] values
 */
export function hexToLab(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  const [x, y, z] = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

/**
 * Complete conversion: LAB → Hex
 * @param L L* component (0-100)
 * @param a a* component (-128 to 128)
 * @param b b* component (-128 to 128)
 * @returns Hex color string
 */
export function labToHex(L: number, a: number, b: number): string {
  const [x, y, z] = labToXyz(L, a, b);
  const [r, g, b_rgb] = xyzToRgb(x, y, z);
  return rgbToHex(r, g, b_rgb);
}
