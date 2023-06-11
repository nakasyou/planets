window.onload = () => {

window.addEventListener("error", e=>{
  document.body.innerHTML = (e.error.name+": "+e.error.message +"\n"+e.error.stack).replaceAll("\n","<br>");
});
//alert("Created by nakasyou. MIT LICENSED.")
const w = window.innerWidth;
const h = window.innerHeight;

const app = new PIXI.Application({
  width: w,
  height: h,
  resolution: window.devicePixelRatio || 1,
  //autoResize: true,
  backgroundColor: 0x000000,
});
document.body.append(app.view);

/*window.addEventListener("resize", () =>{
  app.view.width = document.body.clientWidth;
  app.view.height = document.body.clientHeight;
});*/
const $viewRange = document.getElementById("view-range");
let view = parseInt($viewRange.value / 100); // 視点
// pointerData
const pointerData = {
  lastTime: 0,
  lastOn: false,
  lastX: 0,
  lastY: 0,
  
  speedX: 0,
  speedY: 0,
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
    const z = this.z + view; // 視点の半径
    this.raw.x = x / z * 400 + w/4;
    this.raw.y = y / z * 400 + h/4;
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
    this.culcPosition();
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
let planetId = 0;
function addPlanet(scene){
  const planet = new RotatePlanet({
    z: 1,
    r: 1000,
    color: Math.floor(Math.random() * 0xffffff),
  });
      
  planet.range = Math.random() * 1;
  planet.vr = -0.01;
  planet.dx = Math.random()* 360;
  planet.dy = Math.random()* 360;

  planet.raw.id = planetId;
  planet.id = planetId;

  scene.planets.push(planet);
  scene.planetsContainer.addChild(planet.raw);
  
  planetId ++;
}
const randRange = (min, max) => Math.random() * (max - min) + min;

const $sizeRange = document.getElementById("size-range");
let size = parseInt($sizeRange.value);
$sizeRange.oninput = e => {
  size = parseInt(e.target.value);
};
class Scene {
  constructor(){
    this.planetsContainer = new PIXI.Container();
    this.planetsContainer.sortableChildren = true;
    this.planets = [];
    
    // 惑星の創造開始
    for(const i of range(100)){
      addPlanet(this);
    }
    app.stage.addChild(this.planetsContainer);
  }
  step(arg){
    pointerData.speedX *= 0.9;
    pointerData.speedY *= 0.9;
    this.planets.forEach(planet => {
      planet.dy += pointerData.speedX;
      //planet.dx += 0.1//pointerData.speedY;
      
      planet.range += planet.vr;
      planet.r = size;
      
      if(Math.abs(planet.range)>2){
        const baseSpeed = Math.random() * randRange(0.01,0.02);
        
        const pm = planet.range / Math.abs(planet.range);
        planet.vr = baseSpeed * pm * -1;
      }
      
      planet.raw.zIndex = -planet.z;
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
    pointerData.lastY = e.clientY;
  }
  pointerData.lastOn = true;
  
  const deltaTime = now - pointerData.lastTime;
  pointerData.lastTime = now;
  // x
  const deltaX = e.clientX - pointerData.lastX;
  pointerData.lastX = e.clientX;
  // y
  const deltaY = e.clientY - pointerData.lastY;
  pointerData.lastY = e.clientY;

  const speedX = deltaX / deltaTime;
  const speedY = deltaX / deltaTime;

  pointerData.speedX = speedX ? speedX : 0;
  pointerData.speedY = speedY ? speedY : 0;
});
app.view.addEventListener("pointerup", e => {
  if(e.pointerId === pointers[0])
    pointerData.lastOn = false;
  
  pointers.splice(pointers.indexOf(e.pointerId), 1);
});

$viewRange.oninput = e => {
  view = parseInt(e.target.value / 100);
};

const scene = new Scene();

const $nRange = document.getElementById("n-range");
const $n = document.getElementById("n");

$nRange.oninput = (evt) =>{
  $n.textContent = evt.target.value;
  
  const n = parseInt(evt.target.value);
  if(scene.planets.length < n){
    while(true){
      addPlanet(scene);
      if(scene.planets.length === n){
        break;
      }
    }
  }
  if(scene.planets.length > n){
    const removeN = scene.planets.length - n;
    //scene.planets.splice(0, removeN);
    //scene.planetsContainer.children.splice(0, removeN);
    
    const removeIds = [];
    while(true){
      const id = scene.planets[0].id;
      removeIds.push(id);
      scene.planets.splice(0,1);
      
      const removeIndexForCont = scene.planetsContainer.children.findIndex(child=>child.id===id);
      
      scene.planetsContainer.children.splice(removeIndexForCont,1);
      
      if(n === scene.planets.length){
        break;
      }
    }
  }
};

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


};
