window.addEventListener("error", e=>{
  document.body.innerHTML = (e.error.name+": "+e.error.message +"\n"+e.error.stack).replaceAll("\n","<br>");
});
const app = new PIXI.Application({
  width: document.body.clientWidth,
  height: document.body.clientHeight,
  resolution: window.devicePixelRatio || 1,
  autoResize: true,
  backgroundColor: 0x000000,
});
document.body.append(app.view);
window.addEventListener("resize", () =>{
  app.view.width = document.body.clientWidth;
  app.view.height = document.body.clientHeight;
});
// pointerData
const pointerData = {
  lastTime: 0,
  lastOn: false,
  lastX: 0,
  
  speed: 0,
};

class Circle extends PIXI.Graphics {
  constructor(options) {
    super();
    options = Object.assign({
      color: 0x000000,
      r: 10
    }, options);
    this.options = options;
    this.beginFill(options.color);
    this.drawCircle(0, 0, options.r);
    this.endFill();
    
    this._r = options.r;
  }
  set r(r){
    this.width = r / this.options.r * 2;
    this.height = this.width;
    this._r = r;
  }
  get r(){
    return this._r;
  }
}
function *range(n){
  for(let i=0;i!==n;i++){
    yield i;
  }
}
const safeLog = (...args) => {if(Math.random()<0.1)console.log(...args)};

class Planet{
  constructor(options){
    options = Object.assign({
      x:0, y:0, z:1,
      r: 1,
      color: 0x000000,
    }, options);
    
    this.raw = new Circle({
      color: options.color,
    });
    
    this._x = options.x;
    this._y = options.y;
    this._z = options.z;
    this._r = options.r;
    this.culcPosition();
  }
  culcPosition(){
    const x = this.x;
    const y = this.y;
    const z = this.z + 15;
    this.raw.x = x / z *50 + 100;
    this.raw.y = y / z *50 + 100;
    this.raw.r = this.r / z;
  }
  get x(){
    return this._x;
  }
  set x(v){
    this._x = v;
    this.culcPosition();
  }
  get y(){
    return this._y;
  }
  set y(v){
    this._y = v;
    this.culcPosition();
  }
  get z(){
    return this._z;
  }
  set z(v){
    this._z = v;
    this.culcPosition();
  }
  get r(){
    return this._r;
  }
  set r(v){
    this._r = v;
    this.culcPosition;
  }
}
class RotatePlanet extends Planet{
  constructor(options){
    super(options);
    options = Object.assign({
      dx: 0,
      dy: 0,
      range: 0,
      
      origin: {
        x: app.view.width / 2,
        y: app.view.height / 2,
        z: 10,
      }
    }, options);
    this._dx = options.dx;
    this._dy = options.dy;
    this._range = options.range;
    this.options = options;
    
    this.culcXYZ();
  }
  culcXYZ(){
    const { sin, cos } = Math; // 三角関数の展開
  
    //const { x, y, z } = Object.assign({}, this.options.origin);
    
    let x = this.range;
    let y = x;
    let z = x;
    let tmp = 0;  // X,Y,Zの一時保管
    
    // Rotate X
    tmp = y;
    y = y * cos(this.dx) + z * sin(this.dx);
    z = (-tmp) * sin(this.dx) + z * cos(this.dx);
    // Rotate Y
    tmp = x;
    x = x * cos(this.dy) - z * sin(this.dy);
    z = tmp * sin(this.dy) + z * cos(this.dy);
    
    const { origin } = this.options;
    this.x = x;
    this.y = y;
    this.z = z;
    //safeLog();
  }
  get dx(){
    return this._dx;
  }
  set dx(v){
    this._dx = v;
    this.culcXYZ();
  }
  get dy(){
    return this._dy;
  }
  set dy(v){
    this._dy = v;
    this.culcXYZ();
  }
  get range(){
    return this._range;
  }
  set range(v){
    this._range = v;
    this.culcXYZ();
  }
}
class Scene {
  constructor(){
    this.planets = [];
    
    // 惑星の創造開始
    for(const i of range(2048)){
      const planet = new RotatePlanet({
        z: 1,
        r: 50,
        color: 0xffffff,
      });
      
      planet.range = Math.random() * 7;
      planet.dx = Math.random()* 360;
      planet.dy = Math.random()* 360;
      
      app.stage.addChild(planet.raw);
      this.planets.push(planet);
    }
  }
  step(arg){
    pointerData.speed *= 0.9;
    this.planets.forEach(planet => {
      planet.dy += pointerData.speed;
    });
  }
}

// Pointer event
const pointers = [];
app.view.addEventListener("pointerdown", e=>{
  pointers.push(e.pointerId);
});
app.view.addEventListener("pointermove", e => {
  if(e.pointerId !== pointers[0])
    return;
  const now = new Date().getTime();
  if(!pointerData.lastOn){
    pointerData.lastTime = now;
    pointerData.lastX = e.clientX;
  }
  pointerData.lastOn = true;
  
  const deltaTime = now - pointerData.lastTime;
  pointerData.lastTime = now;
  const deltaX = e.clientX - pointerData.lastX;
  pointerData.lastX = e.clientX;
  
  const speed = deltaX / deltaTime;

  pointerData.speed = speed ? speed : 0;
});
app.view.addEventListener("pointerup", e => {
  if(e.pointerId === pointers[0])
    pointerData.lastOn = false;
  
  pointers.splice(pointers.indexOf(e.pointerId), 1);
});
const scene = new Scene();
const data = {
  lastTime: 0,
};
function step(time){
  const delta = time - data.lastTime;
  data.lastTime = time;
  const fps = 1000 / delta;
  scene.step({
    time,
    fps,
  });
  requestAnimationFrame(step);
}

step();
