export default class PicklesCartesianPlane {
  constructor({graph, height, width, xMin, xMax, yMin, yMax, values}) {
    Object.assign(this, {
      graph,
      height,
      width,
      xMin: xMin || 0,
      xMax: xMax || (values ? values.length : 1),
      yMin: yMin || (values ? Math.min(...values) : 0),
      yMax: yMax || (values ? Math.max(...values) : 0),
    })
  }

  set dimensions({height, width}) {
    Object.assign(this, {height, width})
  }

  set values(values) {
  }

  get center() {
    return {
      x: this.width / 2,
      y: this.height / 2,
    }
  }

  get radius() {
    return Math.min(this.width, this.height) / 2
  }

  get yRange() {
    console.log(this)
    return this.yMax - this.yMin
  }

  get xRange() {
    console.log(this)
    return this.xMax - this.xMin
  }
}
