const growable = {
  has: ['grow']
}

const moveable = {
  has: ['terrain']
}

const difficultySystem = ([growables, moveables], deltaTime, entityManager, {level}) => {
  const difficultyDelta = 1 + (level / 100) * deltaTime
  growables.forEach(({grow}) =>
    grow.rate *= difficultyDelta)
  moveables.forEach(({terrain}) =>
    terrain.velocity *= difficultyDelta)
}
difficultySystem.deps = [growable, moveable]

export default difficultySystem
