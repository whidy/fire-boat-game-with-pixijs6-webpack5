import * as PIXI from 'pixi.js'

const app = new PIXI.Application({
  width: 720,
  height: 1280,
  backgroundColor: 0x1099bb,
  view: document.querySelector('#scene')
});

const texture = PIXI.Texture.from('assets/lion.jpg');
const lion = new PIXI.Sprite(texture);
lion.anchor.set(0.5);
lion.x = 160
lion.y = 160
app.stage.addChild(lion);

app.ticker.add((delta) => {
  lion.rotation -= 0.01 * delta;
});
