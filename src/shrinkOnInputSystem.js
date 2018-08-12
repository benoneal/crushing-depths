const shrinkable = {
  has: ['shrinkOnInput', 'appearance'], 
  exclude: ['pooled']
}

const shrinkOnInputSystem = ([shrinkables], deltaTime, entityManager, {input}) => {
  shrinkables.forEach(({shrinkOnInput: {rate, min}, appearance}) => {
    if (input[' '].start < input[' '].end) return
    appearance.size += (1 - rate) * appearance.size
    appearance.size = Math.max(appearance.size, min)
  })
}
shrinkOnInputSystem.deps = [shrinkable]

export default shrinkOnInputSystem
