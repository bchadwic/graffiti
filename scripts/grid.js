import { ROW_COUNT, COLUMN_COUNT } from "./consts.js";

export class Grid {
	constructor(cursor){
		this.grid = new Array(COLUMN_COUNT*ROW_COUNT);
		this.cursor = cursor;

		for (let i = 0; i < COLUMN_COUNT*ROW_COUNT; i++) {
			let _grid = document.getElementById('grid');
			let cell = document.createElement('div');
			cell.innerHTML = '&nbsp;';
			cell.onclick = function() {
				cursor.curr = i;
			}
			_grid.appendChild(cell);
			this.grid[i] = cell;
		}
		this.render();
	}

	render(){
		let prev = this.grid[this.cursor.prev];
		if(prev != null){
			prev.classList.remove("cursor");
		}
		let curr = this.grid[this.cursor.curr];
		console.log(`prev:${this.cursor.prev} - curr:${this.cursor.curr}`)
		curr.style.color = "blue";
		curr.innerHTML = this.cursor.key;
		curr.classList.add("cursor");
	}
}