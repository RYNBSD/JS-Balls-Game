import "./style.css";
import { Enemy, Particle, Player, Shot } from "./ball";

const HIGH_SCORE = "high-score";

class Game {
  constructor() {
    this.canvas = document.querySelector("canvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");

    this.init();
    this.events();
  }

  init() {
    this.player = Player.new(10, "white", this.context);
    this.shots = [];
    this.particles = [];
    this.enemies = [];
    this.interval = {
      mouse: null,
      enemy: null,
    };
    this.enemyRadius = {
      min: 5,
      max: 30,
    };
    this.mouse = {
      x: 0,
      y: 0,
    };
    this.keysPressed = [];
    this.delta = 0;
    this.prevAnimateTime = 0;
  }

  handlePlayer() {
    this.keysPressed.forEach((key) => this.player.update(this.delta, key));
  }

  handleShot() {
    for (let i = 0; i < this.shots.length; i++) {
      const shot = this.shots[i];
      if (
        shot.x + shot.radius <= 0 ||
        shot.x + shot.radius >= this.canvas.width
      ) {
        this.shots.splice(i, 1);
        i--;
      } else if (
        shot.y + shot.radius <= 0 ||
        shot.y + shot.radius >= this.canvas.height
      ) {
        this.shots.splice(i, 1);
        i--;
      } else {
        shot.update(this.delta / 1.5);
      }
    }
  }

  hanldeParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      particle.update(this.delta / 2);

      if (particle.alpha <= 0 || particle.radius <= 0) {
        this.particles.splice(i, 1);
        i--;
      }
    }
  }

  handleEnemies(animationId) {
    const score = document.querySelector("#score");

    for (let i = 0; i < this.enemies.length; i++) {
      const enemy = this.enemies[i];
      enemy.update(this.player);

      const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
      if (dist - enemy.radius - this.player.radius < 1) {
        cancelAnimationFrame(animationId);
        const localHighScore = localStorage.getItem(HIGH_SCORE) ?? 0;
        const highScore =
          localHighScore > parseInt(score.textContent)
            ? localHighScore
            : parseInt(score.textContent);
        localStorage.setItem(HIGH_SCORE, highScore);
        window.location.reload();
        return;
      }

      for (let j = 0; j < this.shots.length; j++) {
        const shot = this.shots[j];
        const dist = Math.hypot(shot.x - enemy.x, shot.y - enemy.y);

        if (dist - enemy.radius - shot.radius < 1) {
          for (let i = 0; i < enemy.radius * 2; i++) {
            this.particles.push(Particle.new(shot, this.context));
          }

          if (enemy.radius - 10 > 5) {
            gsap.to(enemy, {
              radius: enemy.radius - 10,
            });

            this.shots.splice(j, 1);
            j--;
          } else {
            score.textContent = parseInt(score.textContent) + 1;

            this.enemies.splice(i, 1);
            i--;

            this.shots.splice(j, 1);
            j--;
          }
        }
      }
    }
  }

  animate(time) {
    const animationId = requestAnimationFrame(this.animate.bind(this));
    this.context.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.delta = time - this.prevAnimateTime;
    this.prevAnimateTime = time;

    this.player.draw();
    this.handlePlayer();
    this.handleShot();
    this.hanldeParticles();
    this.handleEnemies(animationId);
  }

  events() {
    window.addEventListener("keydown", (e) => {
      if (this.keysPressed.includes(e.key)) return;
      this.keysPressed.push(e.key);
    });

    window.addEventListener("keyup", (e) => {
      this.keysPressed = this.keysPressed.filter((key) => key !== e.key);
    });

    window.addEventListener("mousedown", (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;

      this.interval.mouse = setInterval(() => {
        this.shots.push(
          Shot.new(this.player, this.mouse.x, this.mouse.y, this.context)
        );
      }, 100);
    });

    window.addEventListener("mouseup", () => {
      clearInterval(this.interval.mouse);
      this.interval.mouse = null;
    });

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.x;
      this.mouse.y = e.y;
    });

    window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });
  }

  static new() {
    return new Game();
  }

  static start() {
    const game = Game.new();
    game.animate(0);
    game.interval.enemy = setInterval(() => {
      game.enemies.push(
        Enemy.new(game.enemyRadius.min, game.enemyRadius.max, game.context)
      );
    }, 1000);
  }
}

function main() {
  const menu = document.querySelector("#menu");
  const highScore = document.querySelector("#high-score");
  const start = document.querySelector("#start");
  const score = document.querySelector("#score");

  score.style.display = "none";
  highScore.textContent += localStorage.getItem(HIGH_SCORE) ?? 0;

  start.addEventListener("click", () => {
    menu.style.display = "none";
    score.style.display = "block";
    Game.start();
  });
}

main();
