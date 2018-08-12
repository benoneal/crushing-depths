let entities = []

export const entityManager = {
  create: components => entities.push(components),
  delete: index => entities = entities.filter((e, i) => i !== index),
  add: (index, component) => entities[index].push(component),
  remove: (index, componentName) => entities[index] = entities[index].filter(({name}) => name !== componentName),
}
const commandBuffer = []
const flushBuffer = () => commandBuffer.forEach(([method, a, b]) => entityManager[method](a, b))
const bufferedEntityManager = {
  createEntity: components => commandBuffer.push(['create', components]),
  deleteEntity: index => commandBuffer.push(['delete', index]),
  addComponent: (index, component) => commandBuffer.push(['add', index, component]),
  removeComponent: (index, componentName) => commandBuffer.push(['remove', index, componentName]),
}

const getEntities = deps => deps.map(({has, exclude = []}) => {
  const entityMatches = []
  entities.forEach((e, i) => {
    const excluded = !!e.filter(({name}) => exclude.includes(name)).length
    if (excluded) return
    const components = e.filter(({name}) => has.includes(name))
    if (components.length !== has.length) return
    const scopedEntity = components.reduce((match, comp) => ({
      ...match,
      [comp.name]: comp
    }), {id: i})
    entityMatches.push(scopedEntity)
  })
  return entityMatches
})

export default systems => (deltaTime, gameState) => systems.forEach(
  system => {
    system(getEntities(system.deps), deltaTime, bufferedEntityManager, gameState)
    commandBuffer.length && flushBuffer()
  })
