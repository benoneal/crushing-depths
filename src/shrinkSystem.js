const shrinkable = {
  has: ['shrink', 'appearance']
}

const shrinkSystem = ([shrinkables], deltaTime, entityManager) => {
  shrinkables.forEach(({shrink: {rate}, appearance}) =>
    appearance.size += (1 - rate) * deltaTime * appearance.size)
}
shrinkSystem.deps = [shrinkable]

export default shrinkSystem
