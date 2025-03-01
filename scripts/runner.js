import { Cursor } from "./cursor.js"
import { Direction } from "./direction.js"
import { Grid } from "./grid.js"

class Runner {
  constructor(){
    this.uuid = crypto.randomUUID();
    this.socket = new WebSocket('ws://localhost:8080/ws');
    this.grid = new Grid();
    this.cursor = new Cursor();

    this.red = Math.floor(this.getRandomNumber(20, 255));
    this.green = Math.floor(this.getRandomNumber(20, 255));
    this.blue = Math.floor(this.getRandomNumber(20, 255));

    console.log(this.red)
    console.log(this.green)
    console.log(this.blue)

    let sliderRed = document.getElementById("slider-red")
    let sliderGreen = document.getElementById("slider-green")
    let sliderBlue = document.getElementById("slider-blue")

    sliderRed.value = this.red
    sliderGreen.value = this.green
    sliderBlue.value = this.blue

    document.addEventListener('keydown', this.typed.bind(this));
    sliderRed.addEventListener('input', this.slided.bind(this));
    sliderGreen.addEventListener('input', this.slided.bind(this));
    sliderBlue.addEventListener('input', this.slided.bind(this));

    for (let i = 0; i < this.grid.cells.length; i++) {
      this.grid.cells[i].addEventListener('click', function(){this.clicked(i);}.bind(this));
    }


    this.socket.addEventListener('open', this.message.bind(this));
    this.socket.addEventListener('message', this.message.bind(this));
    this.socket.addEventListener('close', event => {
      console.log('Disconnected from WebSocket server');
    });
    this.socket.addEventListener('error', event => {
      console.error('WebSocket error:', event);
    });
  }

  open(event){
    // console.log(event);
    // console.log(event.data);
  }

  message(event){
    if(event.data == undefined){
      return;
    }
    let json = JSON.parse(event.data);
    console.log(json);
    if(json.type == "load"){
      for(const cell of json.data){
        let cellDiv = this.grid.cells[cell.id];
        cellDiv.innerHTML = String.fromCharCode(cell.key);
        cellDiv.style.color = `rgb(${cell.red}, ${cell.green}, ${cell.blue})`;
      }
    } else if(json.type == "update"){
      let cell = json.data;
      if(cell.uuid == this.uuid){
        console.log("ignoring")
        return;
      }
      let cellDiv = this.grid.cells[cell.id];
      cellDiv.innerHTML = String.fromCharCode(cell.key);
      cellDiv.style.color = `rgb(${cell.red}, ${cell.green}, ${cell.blue})`;
    }
  }

  slided(elem){
    switch (elem.target.id) {
      case "slider-red":
        this.red = Math.floor(elem.target.value);
        break
      case "slider-green":
        this.green = Math.floor(elem.target.value);
        break
      case "slider-blue":
        this.blue = Math.floor(elem.target.value);
        break
    }
    document.getElementById("outer-color-picker").style.backgroundColor = this.color();
  }

  clicked(i){
    this.cursor.curr = i;
    this.render();
  }

  typed(event){
      const key = event.key;
      switch (key) {
        case "Backspace":
          this.cursor.backspace();
          break;
        case "ArrowLeft":
          this.cursor.move(Direction.LEFT);
          break;
        case "ArrowUp":
          this.cursor.move(Direction.UP);
          break;
        case "ArrowRight":
          this.cursor.move(Direction.RIGHT);
          break;
        case "ArrowDown":
          this.cursor.move(Direction.DOWN);
          break;
        case "Enter":
          this.cursor.move(Direction.ENTER);
          break;
        default:
          if (key.length > 1 || event.ctrlKey || event.altKey || event.metaKey || event.isComposing) {
            return;
          }
          this.cursor.type(key);
      }
      this.render();
  }

	render(){
    let curr = this.grid.cells[this.cursor.curr];
    if(this.cursor.justMoved || this.cursor.justTyped){
      let prev = this.grid.cells[this.cursor.prev];
      if(prev != null){
        prev.classList.remove("cursor");
      }
      curr.classList.add("cursor");
    }
    if(this.cursor.justTyped | this.cursor.justBackspaced){
      curr.style.color = this.color();
      curr.innerHTML = this.cursor.key;
      let msg = {
        uuid: this.uuid,
        id: this.cursor.curr,
        key: this.cursor.key.charCodeAt(0),
        red: this.red,
        green: this.green,
        blue: this.blue,
      }
      this.socket.send(JSON.stringify(msg));
    }
	}

  color(){
    return `rgb(${this.red}, ${this.green}, ${this.blue})`
  }

  getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }
}

new Runner();