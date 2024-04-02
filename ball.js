class Ball {
  constructor(x, y, radius, color, context) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.context = context;
  }

  draw() {
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.context.fillStyle = this.color;
    this.context.fill();
    this.context.closePath();
  }
}

export class Player extends Ball {
  constructor(radius, color, context) {
    super(
      window.innerWidth / 2,
      window.innerHeight / 2,
      radius,
      color,
      context
    );
    this.bound = 50;
  }

  update(delta, key) {
    const boundTop = this.y - this.bound;
    const boundBottom = this.y + this.bound;
    const boundLeft = this.x - this.bound;
    const boundRight = this.x + this.bound;

    switch (key) {
      case "w":
        if (boundTop - this.radius <= 0) break;
        this.y -= delta;
        break;
      case "s":
        if (boundBottom + this.radius >= window.innerHeight) break;
        this.y += delta;
        break;
      case "a":
        if (boundLeft - this.radius <= 0) break;
        this.x -= delta;
        break;
      case "d":
        if (boundRight + this.radius >= window.innerWidth) break;
        this.x += delta;
        break;
    }
  }

  static new(radius, color, context) {
    return new Player(radius, color, context);
  }
}

export class Shot extends Ball {
  constructor(x, y, radius, color, mouseX, mouseY, context) {
    super(x, y, radius, color, context);
    const atanY = mouseX - this.x;
    const atanX = mouseY - this.y;
    this.angle = Math.atan2(atanY, atanX);
  }

  update(delta) {
    this.x += Math.sin(this.angle) * delta;
    this.y += Math.cos(this.angle) * delta;
    this.draw();
  }

  static new(player, mouseX, mouseY, context) {
    return new Shot(
      player.x,
      player.y,
      player.radius / 2,
      player.color,
      mouseX,
      mouseY,
      context
    );
  }
}

export class Particle extends Shot {
  constructor(x, y, radius, color, velocityX, velocityY, context) {
    super(x, y, radius, color, velocityX, velocityY, context);
    this.alpha = 1;
  }

  draw() {
    this.context.save();
    this.context.globalAlpha = this.alpha;
    super.draw();
    this.context.restore();
  }

  update(delta) {
    super.update(delta);
    this.radius -= 0.001;
    this.alpha -= 0.01;
  }

  static new(shot, context) {
    const randomRadius = Math.random() * 3;
    const velocityX = Math.random() * window.innerWidth;
    const velocityY = Math.random() * window.innerHeight;

    return new Particle(
      shot.x,
      shot.y,
      randomRadius,
      shot.color,
      velocityX,
      velocityY,
      context
    );
  }
}

export class Enemy extends Ball {
  constructor(x, y, radius, color, context) {
    super(x, y, radius, color, context);
  }

  update(player) {
    const atanX = player.x - this.x;
    const atanY = player.y - this.y;
    const angle = Math.atan2(atanX, atanY);

    this.x += Math.sign(angle);
    this.y += Math.cos(angle);

    this.draw();
  }

  static #randomSpawn(radius) {
    if (Math.random() > 0.5) {
      const min = -radius - 100;
      const max = radius;
      return Math.random() * (max - min) + min;
    } else {
      const min = radius + window.innerWidth;
      const max = min + 100;
      return Math.random() * (max - min) + min;
    }
  }

  static #randomColor() {
    const char = "0123456789ABCDEF";
    let color = "#";

    for (let i = 0; i < 6; i++) {
      const random = Math.floor(Math.random() * char.length);
      color += char.charAt(random);
    }

    return color;
  }

  static #randomRadius(min, max) {
    return Math.random() * (max - min) + min;
  }

  static new(radiusMin, radiusMax, context) {
    const randomRadius = Enemy.#randomRadius(radiusMin, radiusMax);
    const randomColor = Enemy.#randomColor();
    const randomX = Enemy.#randomSpawn(randomRadius);
    const randomY = Enemy.#randomSpawn(randomRadius);

    return new Enemy(randomX, randomY, randomRadius, randomColor, context);
  }
}
