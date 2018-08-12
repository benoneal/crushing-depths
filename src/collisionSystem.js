const collidable = {
  has: ['collisions', 'position', 'appearance']
}

const wall = {
  has: ['wall', 'position', 'appearance'], 
  exclude: ['pooled']
}

const magnitude = ([x, y]) => Math.sqrt((x * x) + (y * y))
const distance = ([x1, y1], [x2, y2]) => magnitude([x2 - x1, y2 - y1])

const collisionSystem = ([collidables, walls], deltaTime, entityManager) => {
  collidables.forEach(({position: cPos, appearance: cApp, collisions}) => {
    let count = 0, difficulty = 0
    walls.forEach(({position: wPos, appearance: wApp}) => {
      const dist = distance([cPos.x, cPos.y], [wPos.x, wPos.y])
      const combinedSize = cApp.size + wApp.size
      if (dist <= combinedSize) {
        count++
        difficulty += Math.max((wApp.size - cApp.size) * 100, 0.1)
      }
    })
    collisions.count = count
    collisions.difficulty = difficulty
  })
}
collisionSystem.deps = [collidable, wall]

export default collisionSystem
