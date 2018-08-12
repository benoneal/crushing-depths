const strafable = {
  has: ['strafe', 'position'], 
  exclude: ['pooled']
}

const strafeSystem = ([strafables], deltaTime, entityManager, {input}) => {
  strafables.forEach(({id, strafe: {velocity}, position}) => {
    const left = input.ArrowLeft.start > input.ArrowLeft.end
    const right = input.ArrowRight.start > input.ArrowRight.end
    if (!left && !right) return
    const sideMod = left ? -1 : 1
    position.x += (velocity * deltaTime) * sideMod
  })
}
strafeSystem.deps = [strafable]

export default strafeSystem
