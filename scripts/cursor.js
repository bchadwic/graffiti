import { Direction } from "./direction.js";
import { ROW_COUNT, COLUMN_COUNT } from "./consts.js";

export class Cursor {
	constructor(){
		this.col = 0
		this.row = 0
		this._prev = null;
		this.justMoved = true;
		this.justTyped = false;
		this.justBackspaced = false;
		this.key = '&nbsp;';
	}

	get curr(){
		return this.row*COLUMN_COUNT+this.col;
	}

	get prev(){
		return this._prev;
	}

	set curr(curr){
		console.log(`row: ${this.row}, col: ${this.col}`);
		this._prev = this.curr
		this.row = Math.floor(curr/COLUMN_COUNT);
		this.col = curr-this.row*COLUMN_COUNT
		this.justMoved = true;
		this.justTyped = false;
		this.justBackspaced = false;
	}

	type(key){
		this.key = key;
		if (!this.justMoved) {
			let _prev = this.curr
			this.move(Direction.RIGHT);
			if(this.col == 0){
				this.move(Direction.DOWN);
			}
			this._prev = _prev;
		}
		this.justMoved = false;
		this.justTyped = true;
		this.justBackspaced = false;
	}

	backspace(){
		if(!this.justTyped){
			let _prev = this.curr
			this.move(Direction.LEFT);
			if(this.col == COLUMN_COUNT-1){
				this.move(Direction.UP);
			}
			this._prev = _prev;
		}
		this.key = String.fromCharCode(160); // non-collapsing whitespace
		this.justMoved = true;
		this.justTyped = false;
		this.justBackspaced = true;
	}

	move(direction){
		this._prev = this.curr
		switch(direction){
			case Direction.LEFT:
				this.col--;
				if(this.col < 0){
						this.col = COLUMN_COUNT-1;
				}
				break
			case Direction.UP:
				this.row--;
				if(this.row < 0){
						this.row = ROW_COUNT-1;
				}
				break
			case Direction.RIGHT:
				this.col++;
				if(this.col >= COLUMN_COUNT){
						this.col = 0;
				}
				break
			case Direction.ENTER:
				this.col = 0;
			case Direction.DOWN:
				this.row++;
				if(this.row >= ROW_COUNT){
						this.row = 0;
				}
				break
			default:
				console.error(`unknown direction: ${direction}`)
		}
		this.justMoved = true;
		this.justTyped = false;
		this.justBackspaced = false;
		console.log(`row: ${this.row}, col: ${this.col}`);
	}
}