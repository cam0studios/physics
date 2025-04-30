# @cam0studios/physics

## Installation
```bash
bun i @cam0studios/vector-library @cam0studios/physics
```
or
```bash
npm i @cam0studios/vector-library @cam0studios/physics
```

## Usage
```js
import { Circle, physics, draw } from "path/to/physics-lib";
import Vector from "@cam0studios/vector-library";

// example circle rigidbody
new Circle({
    position: new Vector(100, 100),
	rotation: 0,
	mass: 1,
	velocity: new Vector(5, 0),
	friction: 0,
	bounce: 1,
	radius: 75,
	color: "red",
	constrain: {
		min: new Vector(0, 0),
		max: new Vector(window.innerWidth, window.innerHeight),
	},
	gravity: new Vector(0, 0.2),
});

// drawing and physics loop
const ctx = document.querySelector("canvas").getContext("2d");
function loop() {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	physics(1);
	draw(ctx);
	requestAnimationFrame(loop);
}
loop();
```

## Development
```bash
git clone https://github.com/cam0studios/physics
cd physics

bun i
bun run dev
# or
npm i
bun run dev
```