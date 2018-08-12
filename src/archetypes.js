export default {
  player: (x, y, size, velocity, color, deadColor) => [
    {
      name: 'player'
    },
    {
      name: 'collisions',
      count: 0
    },
    {
      name: 'collisionColor',
      collided: deadColor,
      avoided: color,
      threshold: -1
    },
    {
      name: 'position',
      x,
      y
    },
    {
      name: 'appearance',
      layer: 'low',
      shape: 'circle',
      size, 
      color,
    },
    {
      name: 'strafe',
      velocity
    }
  ],
  score: (x, y, color) => [
    {
      name: 'scoreDisplay'
    },
    {
      name: 'position',
      x,
      y
    },
    {
      name: 'appearance',
      layer: 'ui',
      shape: 'text',
      size: '0', 
      color,
    }
  ],
  target: (x, y, size, velocity, color, missColor) => [
    {
      name: 'target'
    },
    {
      name: 'score',
      points: 0
    },
    {
      name: 'collisions',
      count: 0,
      difficulty: 0 
    },
    {
      name: 'collisionColor',
      collided: color,
      avoided: missColor,
      threshold: 0,
    },
    {
      name: 'position',
      x,
      y
    },
    {
      name: 'appearance',
      layer: 'low',
      shape: 'circle',
      size, 
      color: missColor
    },
    {
      name: 'strafe',
      velocity
    },
    {
      name: 'shrink',
      rate: 1.0175
    }
  ],
  wall: (x, y, size, velocity, color) => [
    {
      name: 'wall'
    },
    {
      name: 'spawn',
      rate: 0.5
    },
    {
      name: 'position',
      x,
      y
    },
    {
      name: 'appearance',
      layer: 'high',
      shape: 'circle',
      size, 
      color,
    },
    {
      name: 'grow',
      rate: 0.7
    },
    {
      name: 'shrinkOnInput',
      rate: 1.025,
      min: 0.1
    },
    {
      name: 'terrain',
      velocity
    },
    {
      name: 'pooled'
    }
  ],
  sideFill: (side, color) => [
    {
      name: 'sideFill',
      side
    },
    {
      name: 'position',
      x: 0,
      y: 0
    },
    {
      name: 'appearance',
      layer: 'high',
      shape: 'poly',
      size: [], 
      color
    }
  ]
}
