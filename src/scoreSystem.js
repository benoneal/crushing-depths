const scoreable = {
  has: ['score', 'collisions']
}

const scoreSystem = ([scoreables], deltaTime, entityManager, {level}) => {
  scoreables.forEach(({score, collisions: {count, difficulty}}) =>
    score.points += (count * difficulty * deltaTime * (level + 1)))
}
scoreSystem.deps = [scoreable]

export default scoreSystem
