import { fragment, vertex } from "./lens-shaders";

export function createLens(canvas: HTMLCanvasElement, source: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", { premultipliedAlpha: false, alpha: true, antialias: false });
  if (!gl) return null;
  const program = gl.createProgram();
  if (!program) return null;
  const shaders: WebGLShader[] = [];
  for (const [type, code] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "Lens shader failed");
    gl.attachShader(program, shader);
    shaders.push(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Lens linking failed");
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const uniforms = Object.fromEntries(["uView", "uDpr", "uCount", "uRect", "uRadius", "uParam", "uDispersion", "uFrost"].map(name => [name, gl.getUniformLocation(program, name)]));
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  return {
    draw() {
      if (gl.isContextLost() || !source.width || !source.height) return;
      const dpr = devicePixelRatio || 1;
      const width = Math.round(innerWidth * dpr), height = Math.round(innerHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      gl.viewport(0, 0, width, height);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.generateMipmap(gl.TEXTURE_2D);
      const rects = new Float32Array(48), radii = new Float32Array(12), params = new Float32Array(48);
      let count = 0;
      for (const element of document.querySelectorAll<HTMLElement>("[data-lens]")) {
        if (count === 12) break;
        const box = element.getBoundingClientRect(), style = getComputedStyle(element);
        if (!box.width || !box.height || style.visibility === "hidden" || style.display === "none") continue;
        rects.set([box.left, box.top, box.width, box.height], count * 4);
        radii[count] = parseFloat(style.borderTopLeftRadius) || 0;
        params.set(element.dataset.lens === "panel" ? [4.6, 0.5, 30, 26] : [1, 0.3, 18, 16], count * 4);
        count++;
      }
      gl.uniform2f(uniforms.uView ?? null, innerWidth, innerHeight);
      gl.uniform1f(uniforms.uDpr ?? null, dpr);
      gl.uniform1i(uniforms.uCount ?? null, count);
      gl.uniform4fv(uniforms.uRect ?? null, rects);
      gl.uniform1fv(uniforms.uRadius ?? null, radii);
      gl.uniform4fv(uniforms.uParam ?? null, params);
      gl.uniform1f(uniforms.uDispersion ?? null, 0.12);
      gl.uniform1f(uniforms.uFrost ?? null, 1.6);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    destroy() { gl.deleteTexture(texture); gl.deleteBuffer(buffer); shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program); },
  };
}
