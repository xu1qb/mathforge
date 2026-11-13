// EXPORTS: contourSegments
// Marching Squares：在网格 z[j][i]（对应坐标 x[i]、y[j]）上提取 z=level 的等值线。
// 返回带 null 分隔的折线坐标，可直接用于 ECharts 折线或 Plotly scatter3d。
export interface ContourSegments {
  x: (number | null)[];
  y: (number | null)[];
  z: (number | null)[];
}

export function contourSegments(
  x: number[],
  y: number[],
  z: number[][],
  level = 0,
): ContourSegments {
  const px: (number | null)[] = [];
  const py: (number | null)[] = [];
  const pz: (number | null)[] = [];
  const push = (x1: number, y1: number, x2: number, y2: number) => {
    px.push(x1, x2, null);
    py.push(y1, y2, null);
    pz.push(level, level, null);
  };
  const interp = (
    x1: number, y1: number, v1: number,
    x2: number, y2: number, v2: number,
  ): [number, number] => {
    const t = (level - v1) / (v2 - v1 || 1e-12);
    return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
  };

  for (let j = 0; j < y.length - 1; j++) {
    for (let i = 0; i < x.length - 1; i++) {
      const v00 = z[j]?.[i];
      const v10 = z[j]?.[i + 1];
      const v11 = z[j + 1]?.[i + 1];
      const v01 = z[j + 1]?.[i];
      if (![v00, v10, v11, v01].every((v) => Number.isFinite(v))) continue;

      const pts: [number, number][] = [];
      if ((v00 >= level) !== (v10 >= level)) pts.push(interp(x[i], y[j], v00, x[i + 1], y[j], v10));
      if ((v10 >= level) !== (v11 >= level)) pts.push(interp(x[i + 1], y[j], v10, x[i + 1], y[j + 1], v11));
      if ((v11 >= level) !== (v01 >= level)) pts.push(interp(x[i + 1], y[j + 1], v11, x[i], y[j + 1], v01));
      if ((v01 >= level) !== (v00 >= level)) pts.push(interp(x[i], y[j + 1], v01, x[i], y[j], v00));

      if (pts.length === 2) {
        push(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
      } else if (pts.length === 4) {
        // 鞍点：拆成两条线段
        push(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
        push(pts[2][0], pts[2][1], pts[3][0], pts[3][1]);
      }
    }
  }
  return { x: px, y: py, z: pz };
}
