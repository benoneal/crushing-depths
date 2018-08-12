const colorable = {
  has: ['collisionColor', 'collisions', 'appearance']
}

const collisionColorSystem = ([colorables], deltaTime, entityManager, {level}) => {
  colorables.forEach(({collisionColor: {collided, avoided, threshold}, collisions: {count, difficulty}, appearance}) =>
    appearance.color = (count && difficulty > threshold) ? collided : avoided)
}
collisionColorSystem.deps = [colorable]

export default collisionColorSystem
