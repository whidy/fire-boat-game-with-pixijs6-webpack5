import * as PIXI from 'pixi.js'
import loader from './loader'
import { collision } from './collision'
loader.load()

const w = document.documentElement.clientWidth
const h = document.documentElement.clientHeight
const dpr = 1 // window.devicePixelRatio
let ratio = w / 375 / dpr / 2

let containerMain, containerBoat, containerControl, containerBox

let playTimesTotal = 5
let totalCoin = 0

let _flagGameStart = false
let _flagBoatAdd = true
let _flagIsFiring = false

let shellSheet
let boat1Sheet
let boat2Sheet
let boat3Sheet
let coinSheet

let boatList = []
let shell

let boatSheetList = {}

let textCoinCount
const app = new PIXI.Application({
  width: w,
  height: h,
  // forceCanvas: true,
  backgroundColor: 0xffffff,
  antialias: true,
  resolution: dpr || 1,
})

loader.onProgress.add(showProgress)
loader.onComplete.add(doneLoading)
function showProgress(e) {
  // console.log(e.progress)
}

function doneLoading() {
  document.body.appendChild(app.view)
  createShellSheet() //
  initScene() // containerMain, containerBoat
  initPop() // containerPop
  initFire() // containerControl, containerBox
}

function initScene() {
  containerMain = new PIXI.Container()
  const background = new PIXI.Sprite.from(loader.resources.bg.texture)
  background.scale.set(ratio)
  background.y = -40
  createCoinSheet()
  background.interactive = true
  background.on('tap', boom)
  containerMain.addChild(background)
  containerMain.sortableChildren = true
  app.stage.addChild(containerMain)

  containerBoat = new PIXI.Container()
  containerBoat.zIndex = 1
  app.stage.addChild(containerBoat)

  containerControl = new PIXI.Container()
  let shipHead = new PIXI.Sprite.from(loader.resources.shipHead.texture)
  shipHead.x = 0
  shipHead.y = h
  shipHead.scale.set(ratio)
  // todo shipHead.height
  console.log(`shipHead: ${shipHead.height}`)
  containerControl.y = -shipHead.height
  containerControl.sortableChildren = true
  // console.log(containerControl.y)
  containerControl.addChild(shipHead)

  let cannon = new PIXI.Sprite.from(loader.resources.cannon.texture)
  cannon.x = app.stage.width / 2
  cannon.y = h + 90
  cannon.zIndex = 3
  cannon.anchor.set(0.5, 1)
  console.log(cannon.height)
  cannon.scale.set(ratio)
  containerControl.addChild(cannon)

  let btnFire = new PIXI.Sprite.from(loader.resources.btnFire.texture)
  btnFire.x = app.stage.width / 2
  btnFire.y = h + 120
  btnFire.zIndex = 5
  btnFire.anchor.set(0.5, 1)
  btnFire.scale.set(ratio)
  btnFire.interactive = true
  btnFire.on('touchstart', fireBefore)
  btnFire.on('touchendoutside', fireCanceled)
  btnFire.on('tap', fire)
  containerControl.addChild(btnFire)

  let btnFireFoot = new PIXI.Sprite.from(loader.resources.btnFireFoot.texture)
  btnFireFoot.x = app.stage.width / 2
  btnFireFoot.y = h + 120 + 10
  btnFireFoot.anchor.set(0.5, 1)
  btnFireFoot.zIndex = 4
  btnFireFoot.scale.set(ratio)
  containerControl.addChild(btnFireFoot)

  let playTimesLeftText = new PIXI.Text(
    `剩余炮弹数：${playTimesTotal}`,
    new PIXI.TextStyle({
      fontSize: 14,
      fill: '#ffffff', // gradient
      align: 'center',
    })
  )
  playTimesLeftText.name = 'times-left'
  playTimesLeftText.zIndex = 6
  playTimesLeftText.x = app.stage.width / 2 - playTimesLeftText.width / 2
  playTimesLeftText.y = h + 98
  containerControl.addChild(playTimesLeftText)

  createShellSheet()
  // createShell()

  containerBox = new PIXI.Container()
  containerBox.sortableChildren = true
  let paddingX = 20
  let box = new PIXI.Sprite.from(loader.resources.box.texture)
  box.x = paddingX
  box.y = h + 60
  box.zIndex = 2
  box.scale.set(ratio)
  box.interactive = true
  box.on('tap', function () {
    // todo 跳转到开户页面
  })
  containerBox.addChild(box)

  let boxRound = new PIXI.Graphics()
  boxRound.name = 'box-round'
  boxRound.zIndex = 1
  let roundRadius = 25
  boxRound.lineStyle(0)
  boxRound.beginFill(0xffffff, 0.4)
  boxRound.drawCircle(paddingX + roundRadius, h + 60 + roundRadius, 25)
  boxRound.endFill()
  containerBox.addChild(boxRound)

  const textCoinCountStyle = new PIXI.TextStyle({
    fontSize: 14,
    fill: '#ffffff',
    stroke: '#ff0000',
    strokeThickness: 2,
    align: 'center',
  })
  textCoinCount = new PIXI.Text(totalCoin, textCoinCountStyle)
  textCoinCount.name = 'coins-count'
  textCoinCount.zIndex = 3
  textCoinCount.x = paddingX + boxRound.width / 2 - textCoinCount.width / 2
  textCoinCount.y = h + 102
  containerBox.addChild(textCoinCount)

  let textCoinQuota = new PIXI.Text('额度', textCoinCountStyle)
  textCoinQuota.zIndex = 3
  textCoinQuota.x = paddingX + boxRound.width / 2 - textCoinQuota.width / 2
  textCoinQuota.y = h + 100 + textCoinCount.height
  containerBox.addChild(textCoinQuota)

  let btnInvite = new PIXI.Sprite.from(loader.resources.invite.texture)
  btnInvite.x = w - paddingX
  btnInvite.y = h + 30
  btnInvite.anchor.set(1, 0.5)
  btnInvite.scale.set(ratio)
  btnInvite.interactive = true
  btnInvite.on('tap', function () {
    // todo 触发分享
  })
  containerBox.addChild(btnInvite)

  let btnContact = new PIXI.Sprite.from(loader.resources.contact.texture)
  btnContact.x = w - paddingX
  btnContact.y = h + 100
  btnContact.anchor.set(1, 0.5)
  btnContact.scale.set(ratio)
  btnContact.interactive = true
  btnContact.on('tap', function () {
    // todo 触发联系客服弹层
  })
  containerBox.addChild(btnContact)

  containerControl.addChild(containerBox)
  app.stage.addChild(containerControl)
  // gameStart = true
  createBoatSheet()
  addBoat()
  app.ticker.add(TickerAddBoat)
  app.ticker.add(playing)
}

function initPop() {
  let containerPops = new PIXI.Container()
}

function TickerAddBoat() {
  let lastestBoat = boatList.length && boatList[boatList.length - 1]
  if (
    (boatList.length < 4 &&
      w - lastestBoat.x > lastestBoat.width * 10 * Math.random()) ||
    boatList.length === 0
  ) {
    addBoat()
  }
  for (let i = 0; i < boatList.length; i++) {
    const boat = boatList[i]
    boat.play()
    boat.x -= 1
    if (boat.x < -boat.width) {
      // app.stage.removeChild(boat)
      containerBoat.removeChild(boat)
      boatList.shift()
    }
  }
}

function initSprite() {
  // 创建船只
}

let boatNo = 1
function addBoat() {
  _flagBoatAdd = false
  const boatYStart = 340
  const boatYHeight = h - 340 - 220
  // 'boat' + Math.ceil(Math.random() * 3) + 'sheet'
  let boatSheet = boatSheetList['boat' + Math.ceil(Math.random() * 3) + 'Sheet']
  let boat = new PIXI.AnimatedSprite(boatSheet)
  boat.animationSpeed = 0.2 * Math.random()
  boat.loop = true

  // let boat = PIXI.Sprite.from(loader.resources['boat' + Math.ceil(Math.random() * 3)].texture)
  boat.name = `boat-${boatNo}`
  boat.scale.set(ratio)
  boat.anchor.set(0.5)
  boat.x = w + 100
  boat.y = boatYStart + Math.random() * boatYHeight
  boat.zIndex = 1
  boatList.push(boat)
  // app.stage.addChild(boat)
  containerBoat.addChild(boat)
  boatNo++
}

function fireBefore(e) {
  let btn = e.currentTarget
  btn.scale.x /= 1.1
  btn.scale.y /= 1.1
}

function fireCanceled(e) {
  let btn = e.currentTarget
  btn.scale.x *= 1.1
  btn.scale.y *= 1.1
}
let _ratio
function fire(e) {
  let btn = e.currentTarget
  btn.scale.x *= 1.1
  btn.scale.y *= 1.1
  if (!_flagIsFiring) {
    _flagIsFiring = true
    createShell()
    // todo 执行发射
    _ratio = ratio
    app.ticker.add(bulletFlying)
  } else {
    console.log('弹药还没准备好')
  }
}

function createBoatSheet() {
  let b1sheet = new PIXI.BaseTexture.from(loader.resources['boat1'].url)
  let b2sheet = new PIXI.BaseTexture.from(loader.resources['boat2'].url)
  let b3sheet = new PIXI.BaseTexture.from(loader.resources['boat3'].url)
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
  let ssheet = new PIXI.BaseTexture.from(loader.resources['shell'].url)
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
    new PIXI.Texture(ssheet, new PIXI.Rectangle(7 * w, 0, w, h)),
  ]
}

function createCoinSheet() {
  let csheet = new PIXI.BaseTexture.from(loader.resources['coin'].url)
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
  shell.zIndex = 20
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
    // 未击中，清理精灵
    _flagIsFiring = false
    containerControl.removeChild(shell)
    app.ticker.remove(bulletFlying)
    // bullet.visible = false;
  }
}

function playing() {
  for (let i = 0; i < boatList.length; i++) {
    const boat = boatList[i]
    if (_flagIsFiring) {
      // console.log('碰撞检测')
      if (collision(shell, boat)) {
        // console.log('boom')
        let name = boat.name
        let idx
        for (let j = 0; j < boatList.length; j++) {
          if (boatList[j].name === name) {
            idx = j
            break
          }
        }
        // const boundsShell = shell.getBounds()
        const boundsBoat = boat.getBounds()
        // console.log(boundsShell)
        // console.log(boundsBoat)
        boatList.splice(idx, 1)

        // _flagIsFiring = false
        containerControl.removeChild(shell)
        containerBoat.removeChild(boat)
        app.ticker.remove(bulletFlying)
        boom(boundsBoat)
      }
    }
  }
}
const coinList = []
// let _flagCoinDrop = false
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
    app.stage.addChild(coin)
    coin.x += 50 * (Math.random() - Math.random())
    coin.y += 20 * Math.random()
    coin.play()
    if (coin.y > h + 200) {
      app.stage.removeChild(coin)
      coinList.shift()
    }
  }
  if (coinList.length === 0) {
    // _flagCoinDrop = false
    // 宝箱加钱
    totalCoin += 1000
    if (totalCoin === 1000) {
      // todo 触发首次击中提示弹窗
    }
    refreshBoxContainer()
    app.ticker.remove(coinDrop)
    _flagIsFiring = false
  }
}

function refreshBoxContainer() {
  const _coinsCount = containerBox.getChildByName('coins-count')
  let _lastCoinsCountWidth = _coinsCount.width
  _coinsCount.text = totalCoin
  let curX = _coinsCount.x
  _coinsCount.x = curX - (_coinsCount.width - _lastCoinsCountWidth) / 2
}
