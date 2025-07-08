import React, { useEffect, useRef } from 'react';
import spaceshipImage from './assets/spaceship.png';
import missileImage from './assets/missile.png';

const SpaceGame = () => {
  const canvasRef = useRef(null);
  const spaceshipImg = useRef(new Image());
  const missileImg = useRef(new Image());
  const canShoot = useRef(true);

  const [canvasSize, setCanvasSize] = React.useState({ width: 400, height: 600 });
  const spaceshipWidth = 40;
  const spaceshipHeight = 40;
  const missileWidth = 15;
  const missileHeight = 20;

  // Game state refs
  const spaceship = useRef({
    x: canvasSize.width / 2 - spaceshipWidth / 2,
    y: canvasSize.height - spaceshipHeight - 10,
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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    spaceshipImg.current.src = spaceshipImage;
    missileImg.current.src = missileImage;

    const width = window.innerWidth < 500 ? window.innerWidth - 20 : 400;
    const height = window.innerHeight < 700 ? window.innerHeight - 100 : 600;
    setCanvasSize({ width, height });

    const keyDownHandler = (e) => {
      if (e.key === 'ArrowLeft') leftPressed.current = true;
      if (e.key === 'ArrowRight') rightPressed.current = true;
      if (e.key === ' ' && canShoot.current) {
        spacePressed.current = true;
        canShoot.current = false;
      }
    };

    const keyUpHandler = (e) => {
      if (e.key === 'ArrowLeft') leftPressed.current = false;
      if (e.key === 'ArrowRight') rightPressed.current = false;
      if (e.key === ' ') {
        spacePressed.current = false;
        canShoot.current = true;
      }
    };

    const shoot = () => {
      if (spacePressed.current) {
        bullets.current.push({
          x: spaceship.current.x + spaceshipWidth / 2,
          y: spaceship.current.y,
          width: missileWidth,
          height: missileHeight,
        });
        spacePressed.current = false;
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

    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth < 500 ? window.innerWidth - 20 : 400,
        height: window.innerHeight < 700 ? window.innerHeight - 100 : 600,
      });
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);

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
      if (rightPressed.current && spaceship.current.x + spaceshipWidth < canvasSize.width) {
        spaceship.current.x += spaceship.current.speed;
      }

      bullets.current.forEach((b, i) => {
        b.y -= 5;
        if (b.y < 0) bullets.current.splice(i, 1);
      });

      if (Math.random() < 0.02) {
        enemies.current.push({
          x: Math.random() * (canvasSize.width - 40),
          y: 0,
          width: 40,
          height: 40,
        });
      }

      enemies.current.forEach((enemy, i) => {
        enemy.y += 2;
        if (enemy.y > canvasSize.height) enemies.current.splice(i, 1);

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
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

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
        ctx.fillText('Game Over', canvasSize.width / 2 - 60, canvasSize.height / 2);
        ctx.fillText(`Final Score: ${score.current}`, canvasSize.width / 2 - 70, canvasSize.height / 2 + 30);
      }
    };

    loop();

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center bg-black text-neon-green h-screen w-screen p-4 box-border relative">
      <h1 className="text-5xl leading-tight mb-4">Evil Eye Armada</h1>

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border-2 border-neon-green max-w-full h-auto box-border"
        style={{ touchAction: 'none' }}
      />

      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-lg flex flex-row justify-between items-end px-5 box-border gap-5">
        <div className="flex flex-col gap-2.5 items-center flex-1 min-w-[70px]">
          <button
            className="text-2xl py-3 px-4 rounded-xl bg-gray-800 text-neon-green border-2 border-neon-green font-bold cursor-pointer shadow-neon-green text-center transition-all duration-200 select-none active:bg-neon-green active:bg-opacity-25 active:scale-95 md:py-2 md:px-3 md:text-xl"
            onTouchStart={() => (leftPressed.current = true)}
            onTouchEnd={() => (leftPressed.current = false)}
          >
            ⬅
          </button>
          <button
            className="text-2xl py-3 px-4 rounded-xl bg-gray-800 text-neon-green border-2 border-neon-green font-bold cursor-pointer shadow-neon-green text-center transition-all duration-200 select-none active:bg-neon-green active:bg-opacity-25 active:scale-95 md:py-2 md:px-3 md:text-xl"
            onTouchStart={() => (rightPressed.current = true)}
            onTouchEnd={() => (rightPressed.current = false)}
          >
            ➡
          </button>
        </div>

        <div className="flex flex-col gap-2.5 items-center flex-1 min-w-[70px]">
          <button
            className="text-2xl py-3 px-4 rounded-xl bg-gray-900 text-white border-2 border-white font-bold cursor-pointer shadow-neon-green text-center transition-all duration-200 select-none active:bg-neon-green active:bg-opacity-25 active:scale-95 md:py-2 md:px-3 md:text-xl"
            onClick={() => window.location.reload()}
          >
            🔁 Restart
          </button>
        </div>

        <div className="flex flex-col gap-2.5 items-center flex-1 min-w-[70px]">
          <button
            className="text-2xl py-3 px-4 rounded-xl bg-black text-neon-red border-2 border-neon-red font-bold cursor-pointer shadow-neon-green text-center transition-all duration-200 select-none active:bg-neon-green active:bg-opacity-25 active:scale-95 md:py-2 md:px-3 md:text-xl"
            onTouchStart={() => {
              if (canShoot.current) {
                spacePressed.current = true;
                canShoot.current = false;

                // Trigger vibration on touch start
                if ('vibrate' in navigator) {
                  navigator.vibrate(50); // vibrate for 50ms
                }
              }
            }}
            onTouchEnd={() => {
              spacePressed.current = false;
              canShoot.current = true;
            }}
          >
            🚀 Fire
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaceGame;