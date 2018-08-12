(function () {
  'use strict';

  const growable = {
    has: ['grow']
  };

  const moveable = {
    has: ['terrain']
  };

  const difficultySystem = ([growables, moveables], deltaTime, entityManager, {level}) => {
    const difficultyDelta = 1 + (level / 100) * deltaTime;
    growables.forEach(({grow}) =>
      grow.rate *= difficultyDelta);
    moveables.forEach(({terrain}) =>
      terrain.velocity *= difficultyDelta);
  };
  difficultySystem.deps = [growable, moveable];

  const growable$1 = {
    has: ['grow', 'appearance'], 
    exclude: ['pooled']
  };

  const growSystem = ([growables], deltaTime, entityManager) => {
    growables.forEach(({grow: {rate}, appearance}) =>
      appearance.size *= (1 + rate * deltaTime));
  };
  growSystem.deps = [growable$1];

  const shrinkable = {
    has: ['shrink', 'appearance']
  };

  const shrinkSystem = ([shrinkables], deltaTime, entityManager) => {
    shrinkables.forEach(({shrink: {rate}, appearance}) =>
      appearance.size += (1 - rate) * deltaTime * appearance.size);
  };
  shrinkSystem.deps = [shrinkable];

  const shrinkable$1 = {
    has: ['shrinkOnInput', 'appearance'], 
    exclude: ['pooled']
  };

  const shrinkOnInputSystem = ([shrinkables], deltaTime, entityManager, {input}) => {
    shrinkables.forEach(({shrinkOnInput: {rate, min}, appearance}) => {
      if (input[' '].start < input[' '].end) return
      appearance.size += (1 - rate) * appearance.size;
      appearance.size = Math.max(appearance.size, min);
    });
  };
  shrinkOnInputSystem.deps = [shrinkable$1];

  const spawnable = {
    has: ['pooled', 'spawn', 'position', 'appearance']
  };

  const sine = (amplitude, phase, period) => 
    amplitude * Math.sin(2 * Math.PI * ((Date.now() % period) / period) + (phase * Math.PI / 180));

  const phase = (n1, n2) => n1 * n1 + (n2 ? (n2 * n2) : 0);

  const spawnPoint = (y, level) => 
    (0.65 - Math.random() * sine(0.1, phase(level, y), 7000)) 
      * (Math.random() < 0.5 ? 1 : -1) + sine(0.35, 1, 11000);

  const wallSpawnSystem = ([spawnables], deltaTime, entityManager, {level}) => {
    spawnables.forEach(({id, spawn: {rate}, position, appearance}) => {
      if (Math.random() > (rate * deltaTime)) return
      appearance.size = (Math.random() * 0.1 + 0.05) * (1 + (level + 1) / 100);
      position.y = (spawnables.length > 100 ? Math.random() * 5 - 2.5 : 2) * -1;
      position.x = spawnPoint(position.y, level + 1);
      entityManager.removeComponent(id, 'pooled');
    });
  };
  wallSpawnSystem.deps = [spawnable];

  const movable = {
    has: ['terrain', 'position'], 
    exclude: ['pooled']
  };

  const terrainMoveSystem = ([movables], deltaTime, entityManager) => {
    movables.forEach(({id, terrain: {velocity}, position}) => {
      position.y += (velocity * deltaTime);
      if (position.y > 2) entityManager.addComponent(id, {name: 'pooled'});
    });
  };
  terrainMoveSystem.deps = [movable];

  const fillable = {
    has: ['sideFill', 'appearance']
  };

  const fillPoint = {
    has: ['position', 'wall'], 
    exclude: ['pooled']
  };

  const sideFillSystem = ([fillables, fillPoints], deltaTime, entityManager) => {
    const leftPoints = [];
    const rightPoints = [];
    fillPoints.forEach(({position: {x, y}}) => {
      const fill = x < 0 ? leftPoints : rightPoints;
      fill.push([x, y]);
    });
    const leftFill = [[-1, 1], ...leftPoints.sort(([_, y1], [__, y2]) => y1 > y2 ? -1 : 1), [-1, -1]];
    const rightFill = [[1, 1], ...rightPoints.sort(([_, y1], [__, y2]) => y1 > y2 ? -1 : 1), [1, -1]];
    fillables.forEach(({sideFill: {side}, appearance}) => {
      appearance.size = side === 'left' ? leftFill : rightFill;
    });
  };
  sideFillSystem.deps = [fillable, fillPoint];

  const strafable = {
    has: ['strafe', 'position'], 
    exclude: ['pooled']
  };

  const strafeSystem = ([strafables], deltaTime, entityManager, {input}) => {
    strafables.forEach(({id, strafe: {velocity}, position}) => {
      const left = input.ArrowLeft.start > input.ArrowLeft.end;
      const right = input.ArrowRight.start > input.ArrowRight.end;
      if (!left && !right) return
      const sideMod = left ? -1 : 1;
      position.x += (velocity * deltaTime) * sideMod;
    });
  };
  strafeSystem.deps = [strafable];

  const killable = {
    has: ['player', 'collisions']
  };

  const deathSystem = ([killables], deltaTime, entityManager, gameState) => {
    killables.forEach(({collisions: {count}}) =>
      gameState.paused = count !== 0);
  };
  deathSystem.deps = [killable];

  const collidable = {
    has: ['collisions', 'position', 'appearance']
  };

  const wall = {
    has: ['wall', 'position', 'appearance'], 
    exclude: ['pooled']
  };

  const magnitude = ([x, y]) => Math.sqrt((x * x) + (y * y));
  const distance = ([x1, y1], [x2, y2]) => magnitude([x2 - x1, y2 - y1]);

  const collisionSystem = ([collidables, walls], deltaTime, entityManager) => {
    collidables.forEach(({position: cPos, appearance: cApp, collisions}) => {
      let count = 0, difficulty = 0;
      walls.forEach(({position: wPos, appearance: wApp}) => {
        const dist = distance([cPos.x, cPos.y], [wPos.x, wPos.y]);
        const combinedSize = cApp.size + wApp.size;
        if (dist <= combinedSize) {
          count++;
          difficulty += Math.max((wApp.size - cApp.size) * 100, 0.1);
        }
      });
      collisions.count = count;
      collisions.difficulty = difficulty;
    });
  };
  collisionSystem.deps = [collidable, wall];

  const colorable = {
    has: ['collisionColor', 'collisions', 'appearance']
  };

  const collisionColorSystem = ([colorables], deltaTime, entityManager, {level}) => {
    colorables.forEach(({collisionColor: {collided, avoided, threshold}, collisions: {count, difficulty}, appearance}) =>
      appearance.color = (count && difficulty > threshold) ? collided : avoided);
  };
  collisionColorSystem.deps = [colorable];

  const scoreable = {
    has: ['score', 'collisions']
  };

  const scoreSystem = ([scoreables], deltaTime, entityManager, {level}) => {
    scoreables.forEach(({score, collisions: {count, difficulty}}) =>
      score.points += (count * difficulty * deltaTime * (level + 1)));
  };
  scoreSystem.deps = [scoreable];

  const displayable = {
    has: ['scoreDisplay', 'appearance']
  };

  const score = {
    has: ['score']
  };

  const scoreDisplaySystem = ([displayables, scores], deltaTime, entityManager) => {
    displayables.forEach(({appearance}) => {
      const scoreText = scores.reduce((acc, {score: {points}}) => acc + points, 0);
      appearance.size = Math.floor(scoreText) + '';
    });
  };
  scoreDisplaySystem.deps = [displayable, score];

  const renderable = {
    has: ['position', 'appearance'], 
    exclude: ['pooled']
  };

  const createRenderSystem = (draw, preprocess, postprocess) => {
    const renderSystem = ([renderables], deltaTime, entityManager) => {
      preprocess && preprocess();
      renderables.forEach(({id, position: {x, y}, appearance: {shape, size, color, layer}}) => 
        draw[shape](x, y, size, color, layer));
      postprocess && postprocess();
    };
    renderSystem.deps = [renderable];
    return renderSystem
  };

  const fullCircleRad = 2 * Math.PI;
  const {keys, values} = Object;

  const radialGradient = (side) => {
    const radialGradientCanvas = document.createElement('canvas');
    radialGradientCanvas.width = side;
    radialGradientCanvas.height = side;
    const ctx = radialGradientCanvas.getContext('2d');
    const half = side / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, side, side);
    return radialGradientCanvas
  };

  const radGrad = radialGradient(500);

  const postProcessing = {
    clamp: pixels => {
      // const d = pixels.data
      // for (let i = 0; i < d.length; i += 4) {
      //   const r = d[i]
      //   const g = d[i + 1]
      //   const b = d[i + 2]
      //   const v = (0.2126 * r + 0.7152 * g + 0.0722 * b) >= 125 ? 255 : 0
      //   d[i] = d[i + 1] = d[i + 2] = v
      // }
      return pixels
    }
  };

  var createDraw = (canvasID, layerNames) => {
    const screen = document.getElementById(canvasID);
    const context = screen.getContext('2d');
    const w2 = screen.width * 0.5;
    const h2 = screen.height * 0.5;
    const tX = x => w2 + x * w2;
    const tY = y => h2 + y * -h2;
    const vec = (x, y) => [tX(x), tY(y)];

    const layers = layerNames.reduce((acc, name) => {
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = screen.width;
      layerCanvas.height = screen.height;
      acc[name] = {
        canvas: layerCanvas,
        ctx: layerCanvas.getContext('2d')
      };
      return acc
    }, {});

    return {
      clear: () => values(layers).forEach(({ctx}) =>
        ctx.clearRect(0, 0, screen.width, screen.height)),
      compose: (fx = {}) => {
        context.clearRect(0, 0, screen.width, screen.height);
        keys(layers).forEach(layer => {
          const stack = fx[layer]; 
          const {canvas, ctx} = layers[layer];
          if (stack) {
            const pixelData = ctx.getImageData(0, 0, screen.width, screen.height);
            const processed = stack.reduce((pixels, effect) => 
              postProcessing[effect](pixels), pixelData);
            ctx.putImageData(processed, 0, 0);
          }
          context.drawImage(canvas, 0, 0, screen.width, screen.height);
        });
      },
      radialGradient: (eX, eY, r, color, layer) => {
        const {ctx} = layers[layer];
        ctx.save();
        const [x, y] = vec(eX, eY);
        const w = r * Math.max(w2, h2) * 2;
        ctx.drawImage(radGrad, x - w, y - w, w * 2, w * 2);
        ctx.restore();
      },
      circle: (eX, eY, r, color, layer) => {
        const {ctx} = layers[layer];
        ctx.save();
        ctx.fillStyle = color;
        const [x, y] = vec(eX, eY);
        const rad = r * Math.max(w2, h2);

        ctx.beginPath();
        ctx.moveTo(x + rad, y);
        ctx.arc(x, y, rad, 0, fullCircleRad);

        ctx.fill();
        ctx.restore();
      },
      poly: (_, __, points, color, layer) => {
        const {ctx} = layers[layer];
        ctx.save();
        ctx.fillStyle = color;

        ctx.beginPath();
        points.forEach((p, i) =>
          ctx[i === 0 ? 'moveTo' : 'lineTo'](...vec(...p)));
        ctx.closePath();

        ctx.fill();
        ctx.restore();
      },
      text: (x, y, text, color, layer) => {
        const {ctx} = layers[layer];
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = "bold 50px 'Helvetica'";
        ctx.fillText(text, tX(x), tY(y));
        ctx.restore();
      }
    }
  };

  const addListeners = (events, handler) =>
    events.forEach(event => window.addEventListener(event, handler, false));

  var buildInput = keys => {
    const input = keys.reduce((acc, key) => ({
      ...acc,
      [key]: {
        start: 0,
        end: 1
      }
    }), {});

    addListeners(['keydown'], ({key}) => {
      if (!input[key]) return
      input[key].start = Date.now();
    });

    addListeners(['keyup'], ({key}) => {
      if (!input[key]) return
      input[key].end = Date.now();
    });

    return input
  };

  let entities = [];

  const entityManager = {
    create: components => entities.push(components),
    delete: index => entities = entities.filter((e, i) => i !== index),
    add: (index, component) => entities[index].push(component),
    remove: (index, componentName) => entities[index] = entities[index].filter(({name}) => name !== componentName),
  };
  const commandBuffer = [];
  const flushBuffer = () => commandBuffer.forEach(([method, a, b]) => entityManager[method](a, b));
  const bufferedEntityManager = {
    createEntity: components => commandBuffer.push(['create', components]),
    deleteEntity: index => commandBuffer.push(['delete', index]),
    addComponent: (index, component) => commandBuffer.push(['add', index, component]),
    removeComponent: (index, componentName) => commandBuffer.push(['remove', index, componentName]),
  };

  const getEntities = deps => deps.map(({has, exclude = []}) => {
    const entityMatches = [];
    entities.forEach((e, i) => {
      const excluded = !!e.filter(({name}) => exclude.includes(name)).length;
      if (excluded) return
      const components = e.filter(({name}) => has.includes(name));
      if (components.length !== has.length) return
      const scopedEntity = components.reduce((match, comp) => ({
        ...match,
        [comp.name]: comp
      }), {id: i});
      entityMatches.push(scopedEntity);
    });
    return entityMatches
  });

  var runSystems = systems => (deltaTime, gameState) => systems.forEach(
    system => {
      system(getEntities(system.deps), deltaTime, bufferedEntityManager, gameState);
      commandBuffer.length && flushBuffer();
    });

  var runGameLoop = (systems, gameState) => {
    const gameStart = Date.now();
    let frameStart = Date.now() - 1000;
    const run = () => {
      gameState.level = Math.floor((Date.now() - gameStart) / 5000);
      !gameState.paused && systems((Date.now() - frameStart) / 1000, gameState);
      frameStart = Date.now();
      requestAnimationFrame(run);
    };
    run();
  };

  var archetypes = {
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
  };

  // Create player
  entityManager.create(archetypes.target(0, 0, 0.3, 0.5, 'rgba(255,255,255,0.5)', 'rgba(0,60,90,0.5)'));
  entityManager.create(archetypes.player(0, 0, 0.05, 0.5, 'rgba(255,255,255,1)', 'rgba(0,60,90,1)'));
  // create wall pool
  entityManager.create(archetypes.sideFill('left', 'rgba(0,60,90,1)'));
  entityManager.create(archetypes.sideFill('right', 'rgba(0,60,90,1)'));
  for (var i = 0; i < 200; i++) {
    entityManager.create(archetypes.wall(0, -2, Math.random() * 0.15 + 0.02, 0.5, 'rgba(0,60,90,1)'));
  }
  // Score UI
  entityManager.create(archetypes.score(-0.9, -0.9, 'rgba(255,255,255,1)'));

  const draw = createDraw('game', ['low', 'high', 'ui']);

  const postEffects = {};

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
  ];

  runGameLoop(runSystems(systems), {
    paused: false,
    level: 0,
    input: buildInput([' ', 'ArrowLeft', 'ArrowRight'])
  });

}());
