import Vector from "@cam0studios/vector-library";

export const world = [];
export function physics(dt = 1) {
	for (const node of world) {
		node.physics(dt);
	}
}
export function draw(canvas) {
	for (const node of world) {
		node.draw(canvas);
	}
}

/**
 * @property {Component[]} components
 */
export class Node {
	components = [];
	constructor() {
		world.push(this);
	}
	physics(dt = 1) {
		for (const component of this.components) {
			if (component.physics) {
				// component.physics.call(this, dt);
				component.physics(dt);
			}
		}
	}
	draw(canvas) {
		for (const component of this.components) {
			if (component.draw) {
				// component.draw.call(this, canvas);
				component.draw(canvas);
			}
		}
	}
	add(obj) {
		if (obj instanceof Component) {
			if (obj.required) {
				for (const req of obj.required) {
					if (!this.getComponent(req)) {
						this.add(new req());
					}
				}
			}
			this.components.push(obj);
			obj.node = this;
		} else {
			throw new Error("Invalid object type");
		}
	}
	getComponent(type) {
		for (const component of this.components) {
			if (
				(typeof type === "string" && component.name === type) ||
				(typeof type === "function" && component instanceof type)
			) {
				return component;
			}
		}
		return null;
	}
}

export class Component {
	constructor() { }
	/**
	 * @type {typeof Component[]}
	 */
	required = [];
	name = "Component";
	/**
	 * @type {Node}
	 */
	node = null;
	physics(dt = 1) { }
	draw(canvas) { }
}
export class Transform extends Component {
	constructor({
		position = Vector.zero,
		rotation = 0,
	}) {
		super();
		this.position = position;
		this.rotation = rotation;
	}
	name = "Transform";
	physics(dt = 1) { }
	draw(canvas) { }
}
export class Body extends Component {
	constructor({ mass = 1, velocity = Vector.zero, friction = 0, gravity = Vector.zero }) {
		super();
		this.mass = mass;
		this.velocity = velocity;
		this.acceleration = new Vector(0, 0);
		this.friction = friction;
		this.gravity = gravity;
	}
	required = [Transform];
	name = "Body";
	addForce(force) {
		this.acceleration["+="](force["/"](this.mass));
	}
	physics(dt = 1) {
		let transform = this.node.getComponent(Transform);
		this.acceleration["+="](this.gravity);
		this.velocity["+="]((this.acceleration)["*"](dt));
		transform.position["+="]((this.velocity)["*"](dt));
		this.acceleration["="](Vector.zero);
		this.velocity["*="](Math.pow(1 - this.friction, this.velocity.mag));
	}
	draw(canvas) { }
}
export class CircleCollider extends Component {
	constructor({ radius = 1, bounce = 1, constrain = null }) {
		super();
		this.radius = radius;
		this.bounce = bounce;
		this.constrain = constrain;
	}
	required = [Transform, Body];
	name = "CircleCollider";
	physics(dt = 1) {
		let transform = this.node.getComponent(Transform);
		let body = this.node.getComponent(Body);
		if (this.constrain) {
			if (transform.position.y > this.constrain.max.y - this.radius) {
				transform.position.y = this.constrain.max.y - this.radius;
				body.velocity.y *= -getBounce(this.bounce);
			}
			if (transform.position.x > this.constrain.max.x - this.radius) {
				transform.position.x = this.constrain.max.x - this.radius;
				body.velocity.x *= -getBounce(this.bounce);
			}
			if (transform.position.x < this.constrain.min.x + this.radius) {
				transform.position.x = this.constrain.min.x + this.radius;
				body.velocity.x *= -getBounce(this.bounce);
			}
			if (transform.position.y < this.constrain.min.y + this.radius) {
				transform.position.y = this.constrain.min.y + this.radius;
				body.velocity.y *= -getBounce(this.bounce);
			}
		}
		world.forEach((node) => {
			if (node !== this.node) {
				let collider = node.getComponent(CircleCollider);
				if (collider) {
					circleCircleCollision(this.node, node, dt);
				}
			}
		});
	}
	draw(canvas) { }
}

export class CircleSprite extends Component {
	constructor({ radius = 1, color = "white" }) {
		super();
		this.radius = radius;
		this.color = color;
	}
	required = [Transform];
	name = "CircleSprite";
	physics(dt = 1) { }
	draw(canvas) {
		let transform = this.node.getComponent(Transform);
		canvas.fillStyle = this.color;
		canvas.beginPath();
		canvas.arc(
			transform.position.x,
			transform.position.y,
			this.radius,
			0,
			Math.PI * 2
		);
		canvas.fill();
	}
}

export class Circle extends Node {
	constructor({
		position = Vector.zero,
		rotation = 0,
		mass = 1,
		velocity = Vector.zero,
		friction = 0,
		radius = 1,
		bounce = 1,
		color = "white",
		constrain = null,
		gravity = Vector.zero,
	}) {
		super();
		this.add(new Transform({ position, rotation }));
		this.add(new Body({ mass, velocity, friction, gravity }));
		this.add(new CircleCollider({ radius, bounce, constrain }));
		this.add(new CircleSprite({ radius, color }));
	}
}

function getBounce(bounce = 1, velocity = 0) {
	return Math.pow(bounce, velocity + 1);
}
function circleCircleCollision(circleA, circleB, dt) {
	let transformA = circleA.getComponent(Transform);
	let transformB = circleB.getComponent(Transform);
	let colliderA = circleA.getComponent(CircleCollider);
	let colliderB = circleB.getComponent(CircleCollider);
	let dif = ((transformB.position)["-"](transformA.position));
	let dist = dif.mag;
	if (dist <= colliderA.radius + colliderB.radius) {
		let bodyA = circleA.getComponent(Body);
		let bodyB = circleB.getComponent(Body);
		let overlap = colliderA.radius + colliderB.radius - dist;
		let normal = (dif)["/"](dist);
		transformA.position["-="]((normal)["*"](overlap / 2));
		transformB.position["+="]((normal)["*"](overlap / 2));
		let relativeVelocity = (bodyB.velocity)["-"](bodyA.velocity);
		let velocityAlongNormal = relativeVelocity.dot(normal);
		if (velocityAlongNormal > 0) {
			return;
		}
		let bounce = getBounce(colliderA.bounce * colliderB.bounce, -velocityAlongNormal);
		let impulse = (normal)["*"]((-(1 + bounce) * velocityAlongNormal) / (1 / bodyA.mass + 1 / bodyB.mass));
		bodyA.velocity["-="]((impulse)["/"](bodyA.mass));
		bodyB.velocity["+="]((impulse)["/"](bodyB.mass));
	}
}