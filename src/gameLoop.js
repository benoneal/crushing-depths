export default (systems, gameState) => {
  const gameStart = Date.now()
  let frameStart = Date.now() - 1000
  const run = () => {
    gameState.level = Math.floor((Date.now() - gameStart) / 5000)
    !gameState.paused && systems((Date.now() - frameStart) / 1000, gameState)
    frameStart = Date.now()
    requestAnimationFrame(run)
  }
  run()
}
