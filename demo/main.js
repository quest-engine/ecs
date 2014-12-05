
var canvas = document.getElementById('game'),
  ctx      = canvas.getContext('2d'),
  ecs      = new ECS(),
  mousePos = {x: 0, y: 0},
  eCount   = 0;

canvas.addEventListener('mousemove', function(evt) {
  var rect = canvas.getBoundingClientRect();

  mousePos = {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
});

ecs.registerComponent('draw', {
  color: 'grey'
});

ecs.registerComponent('decay', {
  size: 30
});

ecs.registerComponent('pos', {
  x: 0,
  y: 0
});

ecs.registerComponent('player', {
  isPlayer: true
});


var deps = ['draw', 'decay', 'pos'];

var player = ecs.createEntity(deps.concat(['player']));

player.update('draw', {
  color: 'blue'
});

ecs.createSystem('movePlayer', ['player', 'pos'], function (id, components) {
  var pos = components.pos;

  pos.x = mousePos.x;
  pos.y = mousePos.y;
});

ecs.createSystem('draw', ['draw', 'pos', 'decay'], function (id, components) {
  var size    = components.decay.size,
    halfSize  = size / 2,
    pos       = components.pos;

  ctx.fillStyle = components.draw.color;

  ctx.fillRect(pos.x - halfSize, pos.y - halfSize, size, size);
});

function render() {
  canvas.width = canvas.width;

  if (eCount < 20 && Math.random() < 0.05) {
    var entity = ecs.createEntity(deps);

    entity.update('pos', {
      x: Math.ceil(Math.random() * 400),
      y: Math.ceil(Math.random() * 300)
    });

    entity.update('decay', {
      size: 10
    });

    eCount += 1;
  }

  ecs.tick();

  requestAnimationFrame(render);
}

render();