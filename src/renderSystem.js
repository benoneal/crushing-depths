const renderable = {
  has: ['position', 'appearance'], 
  exclude: ['pooled']
}

const createRenderSystem = (draw, preprocess, postprocess) => {
  const renderSystem = ([renderables], deltaTime, entityManager) => {
    preprocess && preprocess()
    renderables.forEach(({id, position: {x, y}, appearance: {shape, size, color, layer}}) => 
      draw[shape](x, y, size, color, layer))
    postprocess && postprocess()
  }
  renderSystem.deps = [renderable]
  return renderSystem
}

export default createRenderSystem
