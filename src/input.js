const addListeners = (events, handler) =>
  events.forEach(event => window.addEventListener(event, handler, false))

export default keys => {
  const input = keys.reduce((acc, key) => ({
    ...acc,
    [key]: {
      start: 0,
      end: 1
    }
  }), {})

  addListeners(['keydown'], ({key}) => {
    if (!input[key]) return
    input[key].start = Date.now()
  })

  addListeners(['keyup'], ({key}) => {
    if (!input[key]) return
    input[key].end = Date.now()
  })

  return input
}
