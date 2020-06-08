import * as PIXI from 'pixi.js'
// import VConsole from 'vconsole'
// var vConsole = new VConsole()

const w = document.documentElement.clientWidth
const h = document.documentElement.clientHeight
const dpr = 1 // window.devicePixelRatio
let ratio = w / 375 / dpr / 2

let containerMain, containerControl

let gameStart = false;
let boatList = []
let _flagAddBoat = true
let shell
let shellSheet
let boatSheetList = {}
let boat1Sheet
let boat2Sheet
let boat3Sheet
let coinSheet
let isFiring = false
const app = new PIXI.Application({
  width: w,
  height: h,
  // forceCanvas: true,
  backgroundColor: 0xffffff,
  antialias: true,
  resolution: dpr || 1,
  // resolution: 1,
});

app.loader.baseUrl = "assets"
app.loader
  .add('bg', 'bg.png')
  .add('shipHead', 'ship_head.png')
  .add('cannon', 'cannon.png')
  .add('shell', 'shell.png')
  .add('btnFt', 'button_foot.png')
  .add('btn', 'button.png')
  .add('box', 'box.png')
  .add('boxBg', 'box_bg.png')
  .add('contact', 'contact.png')
  .add('invite', 'invite.png')
  .add('boat1', 'boat01_250×250.png')
  .add('boat2', 'boat02_250×250.png')
  .add('boat3', 'boat03_250×250.png')
  .add('coin', 'coin_72×72.png')
// .add('boat1', 'boat01.png')
// .add('boat2', 'boat02.png')
// .add('boat3', 'boat03.png')

app.loader.onProgress.add(showProgress)
app.loader.onComplete.add(doneLoading)
app.loader.onError.add(reportError)
app.loader.load()
function showProgress(e) {
  // console.log(e.progress)
}

function reportError(e) {
  console.log('error: ' + e.message)
}

function doneLoading(e) {
  // const containerMain = new PIXI.Container();
  // app.stage.addChild(containerMain);
  document.body.appendChild(app.view);
  initScene();
  initSprite();
  initAnimation();
  createShellSheet()

}

class Boat extends PIXI.Sprite {
  constructor(x = 0, y = 0, texture, name = 'none', speed = 5) {
    super(texture)
    this.anchor.set(.5)
    this.x = x
    this.y = y
    this.name = name
    this.speed = speed
  }
}

function initScene() {
  containerMain = new PIXI.Container();
  const background = new PIXI.Sprite.from(app.loader.resources.bg.texture)
  background.scale.set(ratio);
  background.y = -40
  createCoinSheet()
  background.interactive = true
  background.on('tap', boom);
  containerMain.addChild(background);
  app.stage.addChild(containerMain);
  containerControl = new PIXI.Container();
  let shipHead = new PIXI.Sprite.from(app.loader.resources.shipHead.texture)
  shipHead.x = 0
  shipHead.y = h
  shipHead.scale.set(ratio)
  // todo shipHead.height
  console.log(`shipHead: ${shipHead.height}`)
  containerControl.y = -shipHead.height
  containerControl.sortableChildren = true
  // console.log(containerControl.y)
  containerControl.addChild(shipHead)

  let cannon = new PIXI.Sprite.from(app.loader.resources.cannon.texture)
  cannon.x = app.stage.width / 2
  cannon.y = h + 90
  cannon.zIndex = 3
  cannon.anchor.set(0.5, 1)
  console.log(cannon.height)
  cannon.scale.set(ratio)
  containerControl.addChild(cannon)

  let btn = new PIXI.Sprite.from(app.loader.resources.btn.texture)
  btn.x = app.stage.width / 2
  btn.y = h + 120
  btn.zIndex = 5
  btn.anchor.set(0.5, 1)
  btn.scale.set(ratio)
  btn.interactive = true
  btn.on('touchstart', fireBefore);
  btn.on('touchendoutside', fireCanceled);
  btn.on('tap', fire);
  containerControl.addChild(btn)

  let btnFt = new PIXI.Sprite.from(app.loader.resources.btnFt.texture)
  btnFt.x = app.stage.width / 2
  btnFt.y = h + 120 + 10
  btnFt.anchor.set(0.5, 1)
  btnFt.zIndex = 4
  btnFt.scale.set(ratio)
  containerControl.addChild(btnFt)
  createShellSheet()
  // createShell()

  let paddingX = 20
  let box = new PIXI.Sprite.from(app.loader.resources.box.texture)
  box.x = paddingX
  box.y = h + 60
  box.zIndex = 1
  box.scale.set(ratio)

  let boxRound = new PIXI.Graphics()
  boxRound.zIndex = 0
  let roundRadius = 25
  boxRound.lineStyle(0);
  boxRound.beginFill(0xffffff, 0.4);
  boxRound.drawCircle(paddingX + roundRadius, h + 60 + roundRadius, 25);
  boxRound.endFill();
  containerControl.addChild(box)
  containerControl.addChild(boxRound)

  let invite = new PIXI.Sprite.from(app.loader.resources.invite.texture)
  invite.x = w - paddingX
  invite.y = h + 30
  invite.anchor.set(1, 0.5)
  invite.scale.set(ratio)
  containerControl.addChild(invite)

  let contact = new PIXI.Sprite.from(app.loader.resources.contact.texture)
  contact.x = w - paddingX
  contact.y = h + 100
  contact.anchor.set(1, 0.5)
  contact.scale.set(ratio)
  containerControl.addChild(contact)

  app.stage.addChild(containerControl)
  // gameStart = true
  createBoatSheet()
  addBoat()
  app.ticker.add(TickerAddBoat);
  app.ticker.add(playing);
}

function TickerAddBoat() {
  let lastestBoat = boatList.length && boatList[boatList.length - 1]
  if ((boatList.length < 4 && w - lastestBoat.x > lastestBoat.width * 10 * Math.random()) || boatList.length === 0) {
    addBoat()
  }
  for (let i = 0; i < boatList.length; i++) {
    const boat = boatList[i];
    boat.play()
    boat.x -= 1
    if (boat.x < -boat.width) {
      app.stage.removeChild(boat)
      boatList.shift()
    }
  }
}

function initSprite() {
  // 创建船只

}

function initAnimation() {

}

let boatNo = 1
function addBoat() {
  _flagAddBoat = false
  const boatYStart = 340
  const boatYHeight = h - 340 - 220
  // 'boat' + Math.ceil(Math.random() * 3) + 'sheet'
  let boatSheet = boatSheetList['boat' + Math.ceil(Math.random() * 3) + 'Sheet']
  let boat = new PIXI.AnimatedSprite(boatSheet)
  boat.animationSpeed = 0.2 * Math.random()
  boat.loop = true

  // let boat = PIXI.Sprite.from(app.loader.resources['boat' + Math.ceil(Math.random() * 3)].texture)
  boat.name = `boat-${boatNo}`
  boat.scale.set(ratio)
  boat.anchor.set(0.5)
  boat.x = w + 100
  boat.y = boatYStart + Math.random() * boatYHeight
  boat.zIndex = 1
  boatList.push(boat)
  app.stage.addChild(boat)
  boatNo++
}

function fireBefore(e) {
  let btn = e.currentTarget
  btn.scale.x /= 1.1;
  btn.scale.y /= 1.1;
}

function fireCanceled(e) {
  let btn = e.currentTarget
  btn.scale.x *= 1.1;
  btn.scale.y *= 1.1;
}
let _ratio
function fire(e) {
  let btn = e.currentTarget
  btn.scale.x *= 1.1;
  btn.scale.y *= 1.1;
  if (!isFiring) {
    isFiring = true
    createShell()
    // todo 执行发射
    _ratio = ratio
    app.ticker.add(bulletFlying)
  } else {
    console.log('弹药还没准备好')
  }
}

function createBoatSheet() {
  let b1sheet = new PIXI.BaseTexture.from(app.loader.resources['boat1'].url)
  let b2sheet = new PIXI.BaseTexture.from(app.loader.resources['boat2'].url)
  let b3sheet = new PIXI.BaseTexture.from(app.loader.resources['boat3'].url)
  let w = 250
  let h = 250
  boat1Sheet = [
    new PIXI.Texture(b1sheet, new PIXI.Rectangle(0 * w, 0, w, h)),
    new PIXI.Texture(b1sheet, new PIXI.Rectangle(1 * w, 0, w, h)),
  ]
  boat2Sheet = [
    new PIXI.Texture(b2sheet, new PIXI.Rectangle(0 * w, 0, w, h)),
    new PIXI.Texture(b2sheet, new PIXI.Rectangle(1 * w, 0, w, h)),
  ]
  boat3Sheet = [
    new PIXI.Texture(b3sheet, new PIXI.Rectangle(0 * w, 0, w, h)),
    new PIXI.Texture(b3sheet, new PIXI.Rectangle(1 * w, 0, w, h)),
  ]
  boatSheetList.boat1Sheet = boat1Sheet
  boatSheetList.boat2Sheet = boat2Sheet
  boatSheetList.boat3Sheet = boat3Sheet
}

function createShellSheet() {
  let ssheet = new PIXI.BaseTexture.from(app.loader.resources['shell'].url)
  let w = 140
  let h = 140
  shellSheet = [
    new PIXI.Texture(ssheet, new PIXI.Rectangle(0 * w, 0, w, h)),
    new PIXI.Texture(ssheet, new PIXI.Rectangle(1 * w, 0, w, h)),
    new PIXI.Texture(ssheet, new PIXI.Rectangle(2 * w, 0, w, h)),
    new PIXI.Texture(ssheet, new PIXI.Rectangle(3 * w, 0, w, h)),
    new PIXI.Texture(ssheet, new PIXI.Rectangle(4 * w, 0, w, h)),
    new PIXI.Texture(ssheet, new PIXI.Rectangle(5 * w, 0, w, h)),
    new PIXI.Texture(ssheet, new PIXI.Rectangle(6 * w, 0, w, h)),
    new PIXI.Texture(ssheet, new PIXI.Rectangle(7 * w, 0, w, h))
  ]
}

function createCoinSheet() {
  let csheet = new PIXI.BaseTexture.from(app.loader.resources['coin'].url)
  let w = 72
  let h = 72
  coinSheet = [
    new PIXI.Texture(csheet, new PIXI.Rectangle(0 * w, 0, w, h)),
    new PIXI.Texture(csheet, new PIXI.Rectangle(1 * w, 0, w, h)),
    new PIXI.Texture(csheet, new PIXI.Rectangle(2 * w, 0, w, h)),
    new PIXI.Texture(csheet, new PIXI.Rectangle(3 * w, 0, w, h)),
  ]
}

function createShell() {
  shell = new PIXI.AnimatedSprite(shellSheet)
  shell.anchor.set(0.5)
  shell.scale.set(ratio)
  shell.animationSpeed = 1
  shell.zIndex = 2
  shell.loop = true
  shell.x = app.view.width / 2
  shell.y = h
  containerControl.addChild(shell)
}

function bulletFlying() {
  shell.y -= 10
  shell.play()
  let scale = shell.y / (h - 100)
  // console.log(Math.sin(scale) * ratio)
  console.log(scale)

  _ratio -= (ratio - ratio / 2) / 10
  shell.scale.set(_ratio)
  // todo shipHead
  if (shell.y < 300 + 145.5) {
    isFiring = false
    containerControl.removeChild(shell)
    app.ticker.remove(bulletFlying)
    // bullet.visible = false;
  }
}

function playing() {
  for (let i = 0; i < boatList.length; i++) {
    const boat = boatList[i];
    if (isFiring) {
      // console.log('碰撞检测')
      if (testForAABB(shell, boat)) {
        // console.log('boom')
        let name = boat.name
        let idx
        for (let j = 0; j < boatList.length; j++) {
          if (boatList[j].name === name) {
            idx = j
            break
          }
        }
        const boundsShell = shell.getBounds()
        const boundsBoat = boat.getBounds()
        console.log(boundsShell)
        console.log(boundsBoat)
        isFiring = false
        boatList.splice(idx, 1)
        containerControl.removeChild(shell)
        app.stage.removeChild(boat)
        boom(boundsBoat)
      }
    }

  }
}
const coinList = []
let _flagCoinDrop = false
function boom(bounds) {
  // console.log(e.data.global)
  // if (_flagCoinDrop) return
  const { x, y, width, height } = bounds
  // const { x, y } = e.data.global
  for (let i = 0; i < 25; i++) {
    let coin = new PIXI.AnimatedSprite(coinSheet)
    coin.zIndex = 10
    coin.x = x + width / 2
    coin.y = y + height / 2
    coin.anchor.set(0.5)
    coinList.push(coin)
  }
  app.ticker.add(coinDrop)
}

function coinDrop() {
  // _flagCoinDrop = true
  for (let i = 0; i < coinList.length; i++) {
    let coin = coinList[i]
    app.stage.addChild(coin);
    coin.x += 20 * (Math.random() - Math.random())
    coin.y += 20 * Math.random()
    coin.play()
    if (coin.y > h + 300) {
      app.stage.removeChild(coin)
      coinList.shift()
    }
  }
  if (coinList.length === 0) {
    // _flagCoinDrop = false
    app.ticker.remove(coinDrop)
  }
}


function testForAABB(r1, r2) {
  // const bounds1 = object1.getBounds();
  // const bounds2 = object2.getBounds();
  // return bounds1.x < bounds2.x + bounds2.width
  //   && bounds1.x + bounds2.width > bounds2.x
  //   && bounds1.y < bounds2.y + bounds2.height
  //   && bounds1.y + bounds2.height > bounds2.y;
  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  //hit will determine whether there's a collision
  hit = false;
  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;
  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;
  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX;
  vy = r1.centerY - r2.centerY;
  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth;
  combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true;
    } else {
      //There's no collision on the y axis
      hit = false;
    }
  } else {
    //There's no collision on the x axis
    hit = false;
  }
  //`hit` will be either `true` or `false`
  return hit;

}
