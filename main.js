class Color{
  constructor(r,g,b,a){
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a ?? 1;
  }
  clone(color){
    return new Color(this.r, this.g, this.b, this.a);
  }
  mix(color){
    return new Color(
      Math.min(1, this.r ),
      Math.min(1, this.g),
      Math.min(1, this.b),
      Math.min(1, this.a + color.a)
    );
  }
  addAlpha(alpha){
    this.a = Math.min(1, this.a + alpha);
  }
  toHtml(){
    return "rgba(" + this.r*255 + ", " +this.g*255 + ", " +this.b*255 + ", " + this.a + ")";
  }
}


class Table{
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.cells = [];
    this.tds = [];
    let table = document.createElement("table");
    for(let i = 0; i < height; i++){
      let row = document.createElement("tr");
      let currCellRow = [];
      let currTdRow = []
      for(let j = 0; j< width;j++){
        let td = document.createElement("td");
        currCellRow = [...currCellRow, new Color(0,0,0,0)]
        currTdRow.push(td);
        row.appendChild(td);
      }
      this.cells = [...this.cells, currCellRow];
      this.tds.push(currTdRow);
      table.appendChild(row)
    }
    document.querySelector("body").appendChild(table);
  }

  render(particles){

    this.tds.forEach(row => row.forEach(td =>td.style.backgroundColor = "#000000"));

    // document.querySelectorAll("td").forEach(td =>td.style.backgroundColor = "black");

    for(let i = 0; i < this.height; i++){
      for(let j = 0; j< this.width;j++){
        table.cells[j][i] = new Color(0,0,0,0);
      }
    }

    particles.forEach(particle => {
      particle.render();
    });

    for(let i = 0; i < this.height; i++){
      for(let j = 0; j< this.width;j++){
        this.#tdAt(i,j).style.backgroundColor = table.cells[j][i].toHtml();
      }
    }
  }

  cellAt(x,y){
    return this.cells[Math.round(y)][Math.round(x)]
  }

  setCellAt(x,y, color){
    this.cells[Math.round(y)][Math.round(x)] = color;
  }

  #tdAt(x,y){
    return this.tds[table.height - y -1][x];
  }
}


const table = new Table(40,40);

class Particle{
  constructor(x,y, color,  ...behaviours){
    this.x = x;
    this.y = y;
    this.color = color;
    this.behaviours = behaviours;
    this.alive = true;

    this.glowRadius = 1;
  }
  step(){
    this.behaviours.forEach( behaviour => behaviour(this));
  }

  render(){
    // table.cells[this.y][this.x] = this.color.mix(table.cells[this.y][this.x]);
    // glow

    let x = this.x;
    let y = this.y;
    const r = this.glowRadius;
    const yScaling = 1;
    for(let i = Math.max(x - r, 0); i < Math.min(x + r, table.width - 0.5); i++){
      for(let j = Math.max(y - r* yScaling, 0); j < Math.min(y + r*yScaling, table.height - 0.5); j++){
        if((i-x)*(i-x) + (j-y)*(j-y) / yScaling*yScaling < r*r){
        // if((i-x)**2 + (j-y)**2 / yScaling**2 < r**2){

          let color = this.color.clone();
          color.a = (1-((i-x)*(i-x) + (j-y)*(j-y) / yScaling*yScaling)/(r*r))**1.25 * color.a;
          table.setCellAt(i,j, color.mix(table.cellAt(i,j)));
        }
      }
    }
  }
  withGlowRadius(glowRadius){
    this.glowRadius = glowRadius;
    return this;
  }
}



function rise(particle){
  particle.y = particle.y + 0.8;
  if(particle.y >= table.height - 0.6){
    particle.alive = false;
  }
}

function wobble(particle){
  particle
  particle.x += (Math.random() - 0.5) * 0.7;
}

function fade(particle){
  particle.color.a = particle.color.a*0.90;
}

function drift(particle){
  particle.x = particle.x + 0.5;
  if(particle.x >= table.width - 0.6){
    particle.alive = false;
  }
}

function shrink(particle){
  particle.glowRadius = Math.max(0, particle.glowRadius - 0.08);
  if(particle.glowRadius <= 0){
    particle.alive = false;
  }
}

let particles = []// [new Particle(0,0, new Color(1,1,1)), new Particle(1,2, new Color(0,1,1,1), rise)];

function step(){
  particles.forEach(particle => {
    particle.step();
  })
  particles = particles.filter(p => p.alive);
}



let driftAmount = 0.4;
function wind(particle){
  particle.x = particle.x + driftAmount;
  if(particle.x >= table.width - 0.6 || particle.x <= 0.6){
    particle.alive = false;
  }
}


const baseColor = new Color(235/255, 164/255, 33/255, 0.2);

particles.push(new Particle(table.width/2, 0, baseColor.mix(baseColor).mix(baseColor)).withGlowRadius(6));

let steps = 0;
function runStep(){
  step()

  for(let i = 0; i < table.width; i++){
    if(Math.random()<0.7 * ( 1 - Math.abs((i - table.width/2)/table.width)*2)**9){
      let height = 3 * Math.random() ;
      if(Math.random() < 0.7){
        particles.push(new Particle(i,height, baseColor.clone(), rise, fade, wobble, wind));
        
      }else{
        particles.push(new Particle(i, height, baseColor.clone(), rise, fade, wind, shrink));
      }
      particles[particles.length - 1].glowRadius = (1 - (1- Math.random()**1.5))*10 + 1;
    }
    // particles.push(new Particle(i, Math.random()*8, baseColor.clone(), rise, fade, wobble, wind));
  }
  if(steps % 35 == 0) {
    driftAmount = Math.random()*0.5 - 0.25;
  }
  steps++;
  table.render(particles);
}

setInterval(runStep, 10);


