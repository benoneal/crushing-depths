const growable = {
  has: ['grow', 'appearance'], 
  exclude: ['pooled']
}

const growSystem = ([growables], deltaTime, entityManager) => {
  growables.forEach(({grow: {rate}, appearance}) =>
    appearance.size *= (1 + rate * deltaTime))
}
growSystem.deps = [growable]

export default growSystem
