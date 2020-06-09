import * as PIXI from 'pixi.js'
const loader = new PIXI.Loader();
loader.baseUrl = "assets"
loader
  .add('bg', 'bg.png')
  .add('shipHead', 'ship_head.png')
  .add('cannon', 'cannon.png')
  .add('shell', 'shell.png')
  .add('btnFireFoot', 'button_foot.png')
  .add('btnFire', 'button.png')
  .add('box', 'box.png')
  .add('boxBg', 'box_bg.png')
  .add('contact', 'contact.png')
  .add('invite', 'invite.png')
  .add('boat1', 'boat01_250×250.png')
  .add('boat2', 'boat02_250×250.png')
  .add('boat3', 'boat03_250×250.png')
  .add('coin', 'coin_72×72.png')

export default loader
