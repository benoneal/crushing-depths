const displayable = {
  has: ['scoreDisplay', 'appearance']
}

const score = {
  has: ['score']
}

const scoreDisplaySystem = ([displayables, scores], deltaTime, entityManager) => {
  displayables.forEach(({appearance}) => {
    const scoreText = scores.reduce((acc, {score: {points}}) => acc + points, 0)
    appearance.size = Math.floor(scoreText) + ''
  })
}
scoreDisplaySystem.deps = [displayable, score]

export default scoreDisplaySystem
