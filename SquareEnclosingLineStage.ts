const w : number = window.innerWidth
const h : number = window.innerHeight
const nodes : number = 5
const lines : number = 2
const scGap : number = 0.05
const scDiv : number = 0.51
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const foreColor : string = "#1565C0"
const backColor : string = "#bdbdbd"

class ScaleUtil {
    static scaleFactor(scale : number) : number {
        return Math.floor(scale / scDiv)
    }

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n))
    }

    static mirrorValue(scale : number, a : number, b : number) : number {
        const k : number = ScaleUtil.scaleFactor(scale)
        return (1 - k) / a + k / b
    }

    static updateValue(scale : number, dir : number, a : number, b : number) : number {
        return ScaleUtil.mirrorValue(scale, a, b) * dir * scGap
    }
}

class DrawingUtil {

      static drawRotatingLine(context : CanvasRenderingContext2D, i : number, size : number, deg : number) {
          const sf : number = 1 - 2 * i
          context.save()
          context.translate(size * sf, size)
          context.rotate(-(sf * deg) * Math.PI / 180)
          context.beginPath()
          context.moveTo(0, 0)
          context.lineTo(2 * size * sf, 0)
          context.stroke()
          context.restore()
      }

      static drawMovingLine(context : CanvasRenderingContext2D, size : number, scale : number) {
          context.save()
          context.translate(-(w/2 + size) * (1 - scale), -size)
          context.beginPath()
          context.moveTo(-size, 0)
          context.lineTo(size, 0)
          context.stroke()
          context.restore()
      }

      static drawStaticLine(context : CanvasRenderingContext2D, size : number) {
          context.beginPath()
          context.moveTo(-size, size)
          context.lineTo(size, size)
          context.stroke()
      }

      static drawSELNode(context : CanvasRenderingContext2D, i : number, scale : number) {
          const gap : number = h / (nodes + 1)
          const size : number = gap / sizeFactor
          const sc1 : number = ScaleUtil.divideScale(scale, 0, 2)
          const sc2 : number = ScaleUtil.divideScale(scale, 1, 2)
          context.strokeStyle = foreColor
          context.lineWidth = Math.min(w, h) / strokeFactor
          context.lineCap = 'round'
          context.save()
          context.translate(w / 2, gap * (i + 1))
          DrawingUtil.drawMovingLine(context, size, sc1)
          DrawingUtil.drawStaticLine(context, size)
          for (var j = 0; j < lines; j++) {
              DrawingUtil.drawRotatingLine(context, j, size, 90 * ScaleUtil.divideScale(sc2, j, lines))
          }
          context.restore()
      }
}

class SquareEnclosingLineStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : SquareEnclosingLineStage = new SquareEnclosingLineStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += ScaleUtil.updateValue(this.scale, this.dir, 1, lines)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}
