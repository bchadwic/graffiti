import { Cursor } from "./cursor.js"
import { Direction } from "./direction.js"
import { Grid } from "./grid.js"

const cursor = new Cursor();
const grid = new Grid(cursor);

document.addEventListener('keydown', function(event) {
  const key = event.key;
  switch (key) {
    case "Backspace":
      cursor.backspace();
      grid.render();
      break;
    case "ArrowLeft":
      cursor.move(Direction.LEFT);
      break;
    case "ArrowUp":
      cursor.move(Direction.UP);
      break;
    case "ArrowRight":
      cursor.move(Direction.RIGHT);
      break;
    case "ArrowDown":
      cursor.move(Direction.DOWN);
      break;
    default:
      if (key.length > 1 || event.ctrlKey || event.altKey || event.metaKey || event.isComposing) {
        return;
      }
      cursor.type(key);
      grid.render();
  }
});