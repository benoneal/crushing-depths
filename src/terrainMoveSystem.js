const movable = {
  has: ['terrain', 'position'], 
  exclude: ['pooled']
}

const terrainMoveSystem = ([movables], deltaTime, entityManager) => {
  movables.forEach(({id, terrain: {velocity}, position}) => {
    position.y += (velocity * deltaTime)
    if (position.y > 2) entityManager.addComponent(id, {name: 'pooled'})
  })
}
terrainMoveSystem.deps = [movable]

export default terrainMoveSystem
