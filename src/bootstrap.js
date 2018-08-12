import difficultySystem from './difficultySystem'
import growSystem from './growSystem'
import shrinkSystem from './shrinkSystem'
import shrinkOnInputSystem from './shrinkOnInputSystem'
import wallSpawnSystem from './wallSpawnSystem'
import terrainMoveSystem from './terrainMoveSystem'
import sideFillSystem from './sideFillSystem'
import strafeSystem from './strafeSystem'
import deathSystem from './deathSystem'
import collisionSystem from './collisionSystem'
import collisionColorSystem from './collisionColorSystem'
import scoreSystem from './scoreSystem'
import scoreDisplaySystem from './scoreDisplaySystem'
import createRenderSystem from './renderSystem'

import createDraw from './draw'
import buildInput from './input'
import runSystems, {entityManager} from './ecs'
import runGameLoop from './gameLoop'

import archetypes from './archetypes'

const rand = (n = 1) => Math.floor(Math.random() * n)
// Create player
entityManager.create(archetypes.target(0, 0, 0.3, 0.5, 'rgba(255,255,255,0.5)', 'rgba(0,60,90,0.5)'))
entityManager.create(archetypes.player(0, 0, 0.05, 0.5, 'rgba(255,255,255,1)', 'rgba(0,60,90,1)'))
// create wall pool
entityManager.create(archetypes.sideFill('left', 'rgba(0,60,90,1)'))
entityManager.create(archetypes.sideFill('right', 'rgba(0,60,90,1)'))
for (var i = 0; i < 200; i++) {
  entityManager.create(archetypes.wall(0, -2, Math.random() * 0.15 + 0.02, 0.5, 'rgba(0,60,90,1)'))
}
// Score UI
entityManager.create(archetypes.score(-0.9, -0.9, 'rgba(255,255,255,1)'))

const draw = createDraw('game', ['low', 'high', 'ui'])

const postEffects = {}

const systems = [
  difficultySystem,
  wallSpawnSystem,
  terrainMoveSystem,
  growSystem,
  shrinkSystem,
  shrinkOnInputSystem,
  strafeSystem,
  sideFillSystem,
  collisionSystem,
  collisionColorSystem,
  deathSystem,
  scoreSystem,
  scoreDisplaySystem,
  createRenderSystem(draw, draw.clear, () => draw.compose(postEffects))
]

runGameLoop(runSystems(systems), {
  paused: false,
  level: 0,
  input: buildInput([' ', 'ArrowLeft', 'ArrowRight'])
})
