const killable = {
  has: ['player', 'collisions']
}

const deathSystem = ([killables], deltaTime, entityManager, gameState) => {
  killables.forEach(({collisions: {count}}) =>
    gameState.paused = count !== 0)
}
deathSystem.deps = [killable]

export default deathSystem
