import React, { useEffect, useRef } from 'react';
import spaceshipImage from './assets/spaceship.png';
import missileImage from './assets/missile.png';

const SpaceGame = () => {
  const canvasRef = useRef(null);
  const spaceshipImg = useRef(new Image());
  const missileImg = useRef(new Image());

  const canvasWidth = 400;
  const canvasHeight = 600;
  const spaceshipWidth = 40;
  const spaceshipHeight = 40;
  const missileWidth = 15;
  const missileHeight = 20;

  // Game state refs
  const spaceship = useRef({
    x: canvasWidth / 2 - spaceshipWidth / 2,
    y: canvasHeight - spaceshipHeight - 10,
    speed: 5,
  });
  const bullets = useRef([]);
  const enemies = useRef([]);
  const score = useRef(0);
  const gameOver = useRef(false);
  const leftPressed = useRef(false);
  const rightPressed = useRef(false);
  const spacePressed = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    spaceshipImg.current.src = spaceshipImage;
    missileImg.current.src = missileImage;

    // Input handlers
    const keyDownHandler = (e) => {
      if (e.key === 'ArrowLeft') leftPressed.current = true;
      if (e.key === 'ArrowRight') rightPressed.current = true;
      if (e.key === ' ') spacePressed.current = true;
    };

    const keyUpHandler = (e) => {
      if (e.key === 'ArrowLeft') leftPressed.current = false;
      if (e.key === 'ArrowRight') rightPressed.current = false;
      if (e.key === ' ') spacePressed.current = false;
    };

    const shoot = () => {
      if (spacePressed.current) {
        bullets.current.push({
          x: spaceship.current.x + spaceshipWidth / 2,
          y: spaceship.current.y,
          width: missileWidth,
          height: missileHeight,
        });
      }
    };

    const handleTouchStart = (e) => {
      const x = e.touches[0].clientX;
      const mid = window.innerWidth / 2;
      if (x < mid) leftPressed.current = true;
      else rightPressed.current = true;
    };

    const handleTouchEnd = () => {
      leftPressed.current = false;
      rightPressed.current = false;
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);

    // Game loop
    const loop = () => {
      if (gameOver.current) return;

      update();
      draw(ctx);
      shoot();
      requestAnimationFrame(loop);
    };

    const update = () => {
      if (leftPressed.current && spaceship.current.x > 0) {
        spaceship.current.x -= spaceship.current.speed;
      }
      if (rightPressed.current && spaceship.current.x + spaceshipWidth < canvasWidth) {
        spaceship.current.x += spaceship.current.speed;
      }

      bullets.current.forEach((b, i) => {
        b.y -= 5;
        if (b.y < 0) bullets.current.splice(i, 1);
      });

      if (Math.random() < 0.02) {
        enemies.current.push({
          x: Math.random() * (canvasWidth - 40),
          y: 0,
          width: 40,
          height: 40,
        });
      }

      enemies.current.forEach((enemy, i) => {
        enemy.y += 2;
        if (enemy.y > canvasHeight) enemies.current.splice(i, 1);

        bullets.current.forEach((bullet, j) => {
          if (
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
          ) {
            enemies.current.splice(i, 1);
            bullets.current.splice(j, 1);
            score.current += 10;
          }
        });

        if (
          enemy.x < spaceship.current.x + spaceshipWidth &&
          enemy.x + enemy.width > spaceship.current.x &&
          enemy.y < spaceship.current.y + spaceshipHeight &&
          enemy.y + enemy.height > spaceship.current.y
        ) {
          gameOver.current = true;
        }
      });
    };

    const draw = (ctx) => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      ctx.drawImage(
        spaceshipImg.current,
        spaceship.current.x,
        spaceship.current.y,
        spaceshipWidth,
        spaceshipHeight
      );

      bullets.current.forEach((b) => {
        ctx.drawImage(
          missileImg.current,
          b.x - missileWidth / 2,
          b.y + b.height / 2,
          missileWidth,
          missileHeight
        );
      });

      enemies.current.forEach((enemy) => {
        ctx.font = '40px Arial';
        ctx.fillText('🪬', enemy.x, enemy.y + enemy.height / 2);
      });

      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score.current}`, 10, 30);

      if (gameOver.current) {
        ctx.fillText('Game Over', canvasWidth / 2 - 60, canvasHeight / 2);
        ctx.fillText(`Final Score: ${score.current}`, canvasWidth / 2 - 70, canvasHeight / 2 + 30);
      }
    };

    loop();

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', backgroundColor: 'black', height: '100vh', color: '#39ff14' }}>
      <h1>Evil Eye Armada</h1>
      <canvas ref={canvasRef} width={400} height={600} style={{ border: '2px solid #39ff14' }} />
      <button onClick={() => window.location.reload()} style={{ marginTop: '10px' }}>
        Restart Game
      </button>
      <div>
        <button
          id="shoot-btn"
          style={{ fontSize: '24px', marginTop: '20px' }}
          onTouchStart={() => (spacePressed.current = true)}
          onTouchEnd={() => (spacePressed.current = false)}
        >
          🚀 Fire
        </button>
      </div>
    </div>
  );
};

export default SpaceGame;