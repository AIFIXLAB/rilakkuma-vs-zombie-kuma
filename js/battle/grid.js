// ===== Grid System (doc PART 4) =====
// Real grid coordinates; every cell stores Row, Column, Position X/Y, Occupied, Unit ID, Trap ID,
// Terrain Type, Is Walkable, Is Buildable. Rows/columns are 1-based in data (doc 4.2) and 0-based internally.
(function () {
  class Grid {
    constructor(mapDef) {
      this.m = mapDef; this.rows = mapDef.rows; this.cols = mapDef.cols;
      const ry = mapDef.rowY; this.y0 = ry[0]; this.y1 = ry[ry.length - 1];
      this.cells = [];
      for (let r = 0; r < this.rows; r++) {
        const row = [];
        for (let c = 0; c < this.cols; c++) {
          const ctr = this.cellCenter(r, c);
          row.push({ row: r + 1, column: c + 1, positionX: ctr.x, positionY: ctr.y, occupied: false, unitId: null, trapId: null,
                     terrainType: mapDef.terrain || 'Normal Ground', isWalkable: true, isBuildable: true });
        }
        this.cells.push(row);
      }
    }
    _t(y) { return RK.util.clamp((y - this.y0) / (this.y1 - this.y0), 0, 1); }
    edgesAtY(y) { const t = this._t(y), m = this.m; return { l: RK.util.lerp(m.topL, m.botL, t), r: RK.util.lerp(m.topR, m.botR, t) }; }
    rowTop(r) { return this.m.rowY[r]; }
    rowBottom(r) { return this.m.rowY[r + 1]; }
    rowMidY(r) { return (this.m.rowY[r] + this.m.rowY[r + 1]) / 2; }
    cellW(r) { const e = this.edgesAtY(this.rowMidY(r)); return (e.r - e.l) / this.cols; }
    cellH(r) { return this.rowBottom(r) - this.rowTop(r); }
    // continuous column coordinate (0 = left board edge, 9 = right edge) -> pixel x on row r
    colToX(r, col) { const e = this.edgesAtY(this.rowMidY(r)); return e.l + (e.r - e.l) * col / this.cols; }
    footY(r) { return this.rowTop(r) + this.cellH(r) * 0.86; }
    cellCenter(r, c) { return { x: this.colToX(r, c + 0.5), y: this.rowMidY(r) }; }
    get(row1, col1) { return this.cells[row1 - 1] && this.cells[row1 - 1][col1 - 1]; }   // 1-based lookup, e.g. get(5,9)
    // pixel -> {r,c} (0-based) or null
    cellAt(x, y) {
      if (y < this.y0 || y >= this.y1) return null;
      let r = -1; for (let i = 0; i < this.rows; i++) if (y >= this.m.rowY[i] && y < this.m.rowY[i + 1]) { r = i; break; }
      if (r < 0) return null;
      const e = this.edgesAtY(y); const c = Math.floor((x - e.l) / ((e.r - e.l) / this.cols));
      if (c < 0 || c >= this.cols) return null;
      return { r, c };
    }
    // cell polygon (for highlight drawing)
    cellPoly(r, c) {
      const yt = this.rowTop(r), yb = this.rowBottom(r), et = this.edgesAtY(yt), eb = this.edgesAtY(yb), n = this.cols;
      const xt0 = et.l + (et.r - et.l) * c / n, xt1 = et.l + (et.r - et.l) * (c + 1) / n;
      const xb0 = eb.l + (eb.r - eb.l) * c / n, xb1 = eb.l + (eb.r - eb.l) * (c + 1) / n;
      return [[xt0, yt], [xt1, yt], [xb1, yb], [xb0, yb]];
    }
  }
  RK.Grid = Grid;
})();
