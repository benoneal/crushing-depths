const spawnable = {
  has: ['pooled', 'spawn', 'position', 'appearance']
}

const sine = (amplitude, phase, period) => 
  amplitude * Math.sin(2 * Math.PI * ((Date.now() % period) / period) + (phase * Math.PI / 180))

const phase = (n1, n2) => n1 * n1 + (n2 ? (n2 * n2) : 0)

const spawnPoint = (y, level) => 
  (0.65 - Math.random() * sine(0.1, phase(level, y), 7000)) 
    * (Math.random() < 0.5 ? 1 : -1) + sine(0.35, 1, 11000)

const wallSpawnSystem = ([spawnables], deltaTime, entityManager, {level}) => {
  spawnables.forEach(({id, spawn: {rate}, position, appearance}) => {
    if (Math.random() > (rate * deltaTime)) return
    appearance.size = (Math.random() * 0.1 + 0.05) * (1 + (level + 1) / 100)
    position.y = (spawnables.length > 100 ? Math.random() * 5 - 2.5 : 2) * -1
    position.x = spawnPoint(position.y, level + 1)
    entityManager.removeComponent(id, 'pooled')
  })
}
wallSpawnSystem.deps = [spawnable]

export default wallSpawnSystem
