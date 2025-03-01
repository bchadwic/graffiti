import { ROW_COUNT, COLUMN_COUNT } from "./consts.js";

export class Grid {
	constructor(){
		this.cells = new Array(COLUMN_COUNT*ROW_COUNT);
		for (let i = 0; i < COLUMN_COUNT*ROW_COUNT; i++) {
			let grid = document.getElementById('grid');
			let cell = document.createElement('div');
			cell.innerHTML = '&nbsp;';
			grid.appendChild(cell);
			this.cells[i] = cell;
		}
	}
}