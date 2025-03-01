import { Cursor } from "./cursor.js"
import { Direction } from "./direction.js"
import { Grid } from "./grid.js"

class Runner {
  constructor(){
    this.grid = new Grid();
    this.cursor = new Cursor();
    document.addEventListener('keydown', this.typed.bind(this));
    for (let i = 0; i < this.grid.cells.length; i++) {
      this.grid.cells[i].addEventListener('click', function(){this.clickedCell(i);}.bind(this));
    }
  }

  clickedCell(i){
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
      // console.log(`prev:${this.cursor.prev} - curr:${this.cursor.curr}`)
      curr.style.color = "blue";
      curr.classList.add("cursor");
    }
    if(this.cursor.justTyped | this.cursor.justBackspaced){
      curr.innerHTML = this.cursor.key;
    }
	}
}

new Runner();