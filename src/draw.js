const fullCircleRad = 2 * Math.PI
const {keys, values} = Object

const radialGradient = (side) => {
  const radialGradientCanvas = document.createElement('canvas')
  radialGradientCanvas.width = side
  radialGradientCanvas.height = side
  const ctx = radialGradientCanvas.getContext('2d')
  const half = side / 2
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
  gradient.addColorStop(0, 'white')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, side, side)
  return radialGradientCanvas
}

const radGrad = radialGradient(500)

const postProcessing = {
  clamp: pixels => {
    // const d = pixels.data
    // for (let i = 0; i < d.length; i += 4) {
    //   const r = d[i]
    //   const g = d[i + 1]
    //   const b = d[i + 2]
    //   const v = (0.2126 * r + 0.7152 * g + 0.0722 * b) >= 125 ? 255 : 0
    //   d[i] = d[i + 1] = d[i + 2] = v
    // }
    return pixels
  }
}

export default (canvasID, layerNames) => {
  const screen = document.getElementById(canvasID)
  const context = screen.getContext('2d')
  const w2 = screen.width * 0.5
  const h2 = screen.height * 0.5
  const tX = x => w2 + x * w2
  const tY = y => h2 + y * -h2
  const vec = (x, y) => [tX(x), tY(y)]

  const layers = layerNames.reduce((acc, name) => {
    const layerCanvas = document.createElement('canvas')
    layerCanvas.width = screen.width
    layerCanvas.height = screen.height
    acc[name] = {
      canvas: layerCanvas,
      ctx: layerCanvas.getContext('2d')
    }
    return acc
  }, {})

  return {
    clear: () => values(layers).forEach(({ctx}) =>
      ctx.clearRect(0, 0, screen.width, screen.height)),
    compose: (fx = {}) => {
      context.clearRect(0, 0, screen.width, screen.height)
      keys(layers).forEach(layer => {
        const stack = fx[layer] 
        const {canvas, ctx} = layers[layer]
        if (stack) {
          const pixelData = ctx.getImageData(0, 0, screen.width, screen.height)
          const processed = stack.reduce((pixels, effect) => 
            postProcessing[effect](pixels), pixelData)
          ctx.putImageData(processed, 0, 0)
        }
        context.drawImage(canvas, 0, 0, screen.width, screen.height)
      })
    },
    radialGradient: (eX, eY, r, color, layer) => {
      const {ctx} = layers[layer]
      ctx.save()
      const [x, y] = vec(eX, eY)
      const w = r * Math.max(w2, h2) * 2
      ctx.drawImage(radGrad, x - w, y - w, w * 2, w * 2)
      ctx.restore()
    },
    circle: (eX, eY, r, color, layer) => {
      const {ctx} = layers[layer]
      ctx.save()
      ctx.fillStyle = color
      const [x, y] = vec(eX, eY)
      const rad = r * Math.max(w2, h2)

      ctx.beginPath()
      ctx.moveTo(x + rad, y)
      ctx.arc(x, y, rad, 0, fullCircleRad)

      ctx.fill()
      ctx.restore()
    },
    poly: (_, __, points, color, layer) => {
      const {ctx} = layers[layer]
      ctx.save()
      ctx.fillStyle = color

      ctx.beginPath()
      points.forEach((p, i) =>
        ctx[i === 0 ? 'moveTo' : 'lineTo'](...vec(...p)))
      ctx.closePath()

      ctx.fill()
      ctx.restore()
    },
    text: (x, y, text, color, layer) => {
      const {ctx} = layers[layer]
      ctx.save()
      ctx.fillStyle = color
      ctx.font = "bold 50px 'Helvetica'"
      ctx.fillText(text, tX(x), tY(y))
      ctx.restore()
    }
  }
}
