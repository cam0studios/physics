import Vector from "@cam0studios/vector-library";
import { Circle, physics, draw } from ".";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

new Circle({
	position: new Vector(100, 100),
	rotation: 0,
	mass: 1,
	velocity: new Vector(Math.random() * 5 + 5, 0).rotate(Math.random() * Math.PI * 2),
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
new Circle({
	position: new Vector(500, 100),
	rotation: 0,
	mass: 3,
	velocity: new Vector(Math.random() * 5 + 5, 0).rotate(Math.random() * Math.PI * 2),
	friction: 0,
	bounce: 1,
	radius: 50,
	color: "black",
	constrain: {
		min: new Vector(0, 0),
		max: new Vector(window.innerWidth, window.innerHeight),
	},
	gravity: new Vector(0, 0.2),
});

function update() {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	physics(1);
	draw(ctx);
}

update();
requestAnimationFrame(function loop() {
	update();
	requestAnimationFrame(loop);
});