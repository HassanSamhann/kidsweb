export function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 255
  } : { r: 0, g: 0, b: 0, a: 255 };
}

export function floodFill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fillColorHex: string
) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  const targetColor = getPixel(data, x, y, ctx.canvas.width);
  const fillColor = hexToRgb(fillColorHex);

  if (colorsMatch(targetColor, fillColor)) {
    return;
  }

  const pixelsToCheck = [x, y];
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  while (pixelsToCheck.length > 0) {
    const cy = pixelsToCheck.pop()!;
    const cx = pixelsToCheck.pop()!;

    const currentColor = getPixel(data, cx, cy, width);

    if (colorsMatch(currentColor, targetColor)) {
      setPixel(data, cx, cy, width, fillColor);

      if (cx > 0) pixelsToCheck.push(cx - 1, cy);
      if (cx < width - 1) pixelsToCheck.push(cx + 1, cy);
      if (cy > 0) pixelsToCheck.push(cx, cy - 1);
      if (cy < height - 1) pixelsToCheck.push(cx, cy + 1);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function getPixel(data: Uint8ClampedArray, x: number, y: number, width: number) {
  const index = (y * width + x) * 4;
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3]
  };
}

function setPixel(
  data: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  color: { r: number, g: number, b: number, a: number }
) {
  const index = (y * width + x) * 4;
  data[index] = color.r;
  data[index + 1] = color.g;
  data[index + 2] = color.b;
  data[index + 3] = color.a;
}

function colorsMatch(
  c1: { r: number, g: number, b: number, a: number },
  c2: { r: number, g: number, b: number, a: number }
) {
  return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
}
