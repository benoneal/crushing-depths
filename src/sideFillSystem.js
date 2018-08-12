const fillable = {
  has: ['sideFill', 'appearance']
}

const fillPoint = {
  has: ['position', 'wall'], 
  exclude: ['pooled']
}

const sideFillSystem = ([fillables, fillPoints], deltaTime, entityManager) => {
  const leftPoints = []
  const rightPoints = []
  fillPoints.forEach(({position: {x, y}}) => {
    const fill = x < 0 ? leftPoints : rightPoints
    fill.push([x, y])
  })
  const leftFill = [[-1, 1], ...leftPoints.sort(([_, y1], [__, y2]) => y1 > y2 ? -1 : 1), [-1, -1]]
  const rightFill = [[1, 1], ...rightPoints.sort(([_, y1], [__, y2]) => y1 > y2 ? -1 : 1), [1, -1]]
  fillables.forEach(({sideFill: {side}, appearance}) => {
    appearance.size = side === 'left' ? leftFill : rightFill
  })
}
sideFillSystem.deps = [fillable, fillPoint]

export default sideFillSystem
