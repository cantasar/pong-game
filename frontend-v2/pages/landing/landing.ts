import './crtShader.js';

export function init() {
  console.log('Home page loaded');

  // Use Babylon.js from window (CDN loaded in index.html)
  const BABYLON = (window as any).BABYLON;
  if (!BABYLON) {
    console.error('BABYLON is not loaded. Please include Babylon.js via CDN in your index.html.');
    return;
  }

  // Create a fullscreen background canvas for Babylon.js
  let canvas = document.getElementById('babylon-canvas');
  let realCanvas: HTMLCanvasElement;
  if (canvas instanceof HTMLCanvasElement) {
    realCanvas = canvas;
  } else {
    const createdCanvas = document.createElement('canvas');
    createdCanvas.id = 'babylon-canvas';
    // Fullscreen, fixed, background
    createdCanvas.style.position = 'fixed';
    createdCanvas.style.top = '0';
    createdCanvas.style.left = '0';
    createdCanvas.style.width = '100vw';
    createdCanvas.style.height = '100vh';
    createdCanvas.style.zIndex = '-1';
    createdCanvas.style.pointerEvents = 'none';
    createdCanvas.style.display = 'block';
    createdCanvas.style.background = 'black';
    document.body.appendChild(createdCanvas);
    realCanvas = createdCanvas;
    // Make sure body and html backgrounds are transparent for canvas visibility
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
  }

  // Expose a function to close the Babylon game
  (window as any).closeBabylonGame = function() {
    try {
      engine.stopRenderLoop();
      engine.dispose();
    } catch (e) {}
    if (realCanvas && realCanvas.parentNode) {
      realCanvas.parentNode.removeChild(realCanvas);
    }
    // Optionally, clean up any other global state if needed
  };

  // Babylon.js engine and scene
  const engine = new BABYLON.Engine(realCanvas, true);
  const scene = new BABYLON.Scene(engine);
  // Set world background color to white
  scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

  // Helper to update canvas size to window
  function resizeCanvas() {
    realCanvas.width = window.innerWidth;
    realCanvas.height = window.innerHeight;
    realCanvas.style.width = '100vw';
    realCanvas.style.height = '100vh';
    engine.resize();
  }
  resizeCanvas();

  // Camera (top-down)
  const aspect = window.innerWidth / window.innerHeight;
  const camera = new BABYLON.ArcRotateCamera('camera', Math.PI / 2, 0, 8, BABYLON.Vector3.Zero(), scene);
  camera.setPosition(new BABYLON.Vector3(0, 6, 0));
  camera.setTarget(BABYLON.Vector3.Zero());

  // --- CRT Shader ---
  // Use CRT shader from window (set by crtShader.js)
  const crtFragmentShader = (window as any).crtFragmentShader;
  BABYLON.Effect.ShadersStore["crtFragmentShader"] = crtFragmentShader;

  // Attach CRT post-process to camera
  const crtPostProcess = new BABYLON.PostProcess(
    "CRTShaderPostProcess",
    "crt",
    ["curvature", "screenResolution", "scanLineOpacity", "vignetteOpacity", "brightness", "vignetteRoundness"],
    null,
    1.0,
    camera
  );
  crtPostProcess.onApply = function (effect: any) {
    effect.setFloat2("curvature", 3.0, 3.0);
    effect.setFloat2("screenResolution", realCanvas.width, realCanvas.height);
    effect.setFloat2("scanLineOpacity", 1, 1);
    effect.setFloat("vignetteOpacity", 1);
    effect.setFloat("brightness", 1.2);
    effect.setFloat("vignetteRoundness", 2.0);
  };

  // Light
  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene);

  // Pong game objects
  // Table
  const table = BABYLON.MeshBuilder.CreateBox('table', { width: 8, height: 0.1, depth: 4 }, scene);
  const tableMat = new BABYLON.StandardMaterial('tableMat', scene);
  tableMat.diffuseColor = new BABYLON.Color3(0, 0, 0); // pitch black
  tableMat.emissiveColor = new BABYLON.Color3(0.08, 0.08, 0.08); // subtle glow
  tableMat.specularColor = new BABYLON.Color3(0,0,0);
  table.material = tableMat;
  table.position.y = -0.05;

  // Neon glowing borders (red left, blue right)
  const borderThickness = 0.12;
  // Left border (red neon)
  const leftBorder = BABYLON.MeshBuilder.CreateBox('leftBorder', { width: borderThickness, height: 0.13, depth: 4.1 }, scene);
  leftBorder.position.x = -4 + borderThickness/2;
  leftBorder.position.y = 0.01;
  const leftMat = new BABYLON.StandardMaterial('leftMat', scene);
  leftMat.emissiveColor = new BABYLON.Color3(1, 0, 0);
  leftMat.diffuseColor = new BABYLON.Color3(0.2, 0, 0);
  leftMat.specularColor = new BABYLON.Color3(1,0,0);
  leftMat.alpha = 0.85;
  leftBorder.material = leftMat;
  // Right border (blue neon)
  const rightBorder = BABYLON.MeshBuilder.CreateBox('rightBorder', { width: borderThickness, height: 0.13, depth: 4.1 }, scene);
  rightBorder.position.x = 4 - borderThickness/2;
  rightBorder.position.y = 0.01;
  const rightMat = new BABYLON.StandardMaterial('rightMat', scene);
  rightMat.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
  rightMat.diffuseColor = new BABYLON.Color3(0, 0, 0.2);
  rightMat.specularColor = new BABYLON.Color3(0,0.5,1);
  rightMat.alpha = 0.85;
  rightBorder.material = rightMat;
  // Top border (white neon)
  const topBorder = BABYLON.MeshBuilder.CreateBox('topBorder', { width: 8, height: 0.13, depth: borderThickness }, scene);
  topBorder.position.z = 2 - borderThickness/2;
  topBorder.position.y = 0.01;
  const topMat = new BABYLON.StandardMaterial('topMat', scene);
  topMat.emissiveColor = new BABYLON.Color3(0.7, 0.7, 1);
  topMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
  topMat.alpha = 0.7;
  topBorder.material = topMat;
  // Bottom border (white neon)
  const bottomBorder = BABYLON.MeshBuilder.CreateBox('bottomBorder', { width: 8, height: 0.13, depth: borderThickness }, scene);
  bottomBorder.position.z = -2 + borderThickness/2;
  bottomBorder.position.y = 0.01;
  const bottomMat = new BABYLON.StandardMaterial('bottomMat', scene);
  bottomMat.emissiveColor = new BABYLON.Color3(0.7, 0.7, 1);
  bottomMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
  bottomMat.alpha = 0.7;
  bottomBorder.material = bottomMat;

  // Paddles (shorter and broader, neon effect)
  const paddleWidth = 0.2, paddleHeight = 0.5, paddleDepth = 0.9;
  const paddle1 = BABYLON.MeshBuilder.CreateBox('paddle1', { width: paddleWidth, height: paddleHeight, depth: paddleDepth }, scene);
  const paddle2 = BABYLON.MeshBuilder.CreateBox('paddle2', { width: paddleWidth, height: paddleHeight, depth: paddleDepth }, scene);
  const paddle1Mat = new BABYLON.StandardMaterial('paddle1Mat', scene);
  paddle1Mat.diffuseColor = new BABYLON.Color3(0.7, 0, 0);
  paddle1Mat.emissiveColor = new BABYLON.Color3(1, 0, 0);
  paddle1Mat.specularColor = new BABYLON.Color3(1, 0.2, 0.2);
  paddle1Mat.alpha = 0.95;
  paddle1.material = paddle1Mat;
  const paddle2Mat = new BABYLON.StandardMaterial('paddle2Mat', scene);
  paddle2Mat.diffuseColor = new BABYLON.Color3(0, 0, 0.7);
  paddle2Mat.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
  paddle2Mat.specularColor = new BABYLON.Color3(0.2, 0.2, 1);
  paddle2Mat.alpha = 0.95;
  paddle2.material = paddle2Mat;
  paddle1.position.x = -3.7;
  paddle2.position.x = 3.7;
  paddle1.position.y = paddle2.position.y = paddleHeight/2 - 0.05;

  // Ball
  const ball = BABYLON.MeshBuilder.CreateSphere('pongBall', { diameter: 0.3 }, scene);
  const ballMat = new BABYLON.StandardMaterial('ballMat', scene);
  ballMat.diffuseColor = new BABYLON.Color3(1, 0.8, 0.2);
  ball.material = ballMat;
  ball.position.y = paddleHeight/2;

  function randomColor3() {
    return new BABYLON.Color3(Math.random(), Math.random(), Math.random());
  }

  // Ball and paddle state
  let ballDirX = 0.09, ballDirZ = 0.07; // slower ball
  // Paddle state: if a paddle is returning to a corner, we animate it
  let paddle1ToCorner: number | null = null;
  let paddle2ToCorner: number | null = null;

  // Animation loop
  engine.runRenderLoop(() => {
    // Make paddles slower
    const paddleSpeed = 0.09;
    // Paddle 1
    if (paddle1ToCorner !== null) {
      const dz = paddle1ToCorner - paddle1.position.z;
      if (Math.abs(dz) < 0.1) {
        paddle1.position.z = paddle1ToCorner;
        paddle1ToCorner = null;
      } else {
        paddle1.position.z += Math.sign(dz) * paddleSpeed * 1.2;
      }
    } else {
      paddle1.position.z += Math.sign(ball.position.z - paddle1.position.z) * paddleSpeed;
    }
    // Paddle 2
    if (paddle2ToCorner !== null) {
      const dz = paddle2ToCorner - paddle2.position.z;
      if (Math.abs(dz) < 0.1) {
        paddle2.position.z = paddle2ToCorner;
        paddle2ToCorner = null;
      } else {
        paddle2.position.z += Math.sign(dz) * paddleSpeed * 1.2;
      }
    } else {
      paddle2.position.z += Math.sign(ball.position.z - paddle2.position.z) * paddleSpeed;
    }
    // Clamp paddles to table bounds
    paddle1.position.z = Math.max(Math.min(paddle1.position.z, 1.5), -1.5);
    paddle2.position.z = Math.max(Math.min(paddle2.position.z, 1.5), -1.5);

    // Move ball
    ball.position.x += ballDirX;
    ball.position.z += ballDirZ;

    // Ball collision with top/bottom (bouncy)
    if (ball.position.z > 1.85) {
      ball.position.z = 1.85;
      ballDirZ *= -1;
    }
    if (ball.position.z < -1.85) {
      ball.position.z = -1.85;
      ballDirZ *= -1;
    }

    // Ball collision with paddles
    if (
      (ball.position.x < paddle1.position.x + paddleWidth/2 + 0.15 &&
        ball.position.x > paddle1.position.x &&
        Math.abs(ball.position.z - paddle1.position.z) < paddleHeight/2)
    ) {
      ballDirX *= -1;
      // Move paddle1 to the back (left) corner when hit
      paddle1ToCorner = -1.5;
    }
    if (
      (ball.position.x > paddle2.position.x - paddleWidth/2 - 0.15 &&
        ball.position.x < paddle2.position.x &&
        Math.abs(ball.position.z - paddle2.position.z) < paddleHeight/2)
    ) {
      ballDirX *= -1;
      // Move paddle2 to the back (right) corner when hit
      paddle2ToCorner = 1.5;
    }

    // Ball out of bounds (bounce back, never reset)
    if (ball.position.x < -3.85 || ball.position.x > 3.85) {
      // Neon Hockey: Particle and light effect on border hit
      const borderX = ball.position.x < 0 ? -3.85 : 3.85;
      // Particle system
      const particleSystem = new BABYLON.ParticleSystem("borderHit", 100, scene);
      particleSystem.particleTexture = new BABYLON.Texture("https://playground.babylonjs.com/textures/flare.png", scene);
      particleSystem.emitter = new BABYLON.Vector3(borderX, ball.position.y, ball.position.z);
      particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
      particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
      particleSystem.color1 = borderX < 0 ? new BABYLON.Color4(1, 0.2, 0.2, 1) : new BABYLON.Color4(0.2, 0.6, 1, 1);
      particleSystem.color2 = borderX < 0 ? new BABYLON.Color4(1, 0.5, 0.5, 1) : new BABYLON.Color4(0.5, 0.8, 1, 1);
      particleSystem.minSize = 0.15;
      particleSystem.maxSize = 0.35;
      particleSystem.minLifeTime = 0.2;
      particleSystem.maxLifeTime = 0.5;
      particleSystem.emitRate = 120;
      particleSystem.direction1 = new BABYLON.Vector3(borderX < 0 ? 1 : -1, 0.2, 0.2);
      particleSystem.direction2 = new BABYLON.Vector3(borderX < 0 ? 1 : -1, -0.2, -0.2);
      particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
      particleSystem.targetStopDuration = 0.3;
      particleSystem.start();
      // Neon flash light
      const flash = new BABYLON.PointLight("borderFlash", new BABYLON.Vector3(borderX, 1, ball.position.z), scene);
      flash.diffuse = borderX < 0 ? new BABYLON.Color3(1, 0.2, 0.2) : new BABYLON.Color3(0.2, 0.6, 1);
      flash.intensity = 2.5;
      flash.range = 2.5;
      setTimeout(() => { flash.dispose(); }, 200);

      // Reset ball to center and randomize color
      ball.position.x = 0;
      ball.position.z = 0;
      ballDirX = (Math.random() > 0.5 ? 1 : -1) * 0.09;
      ballDirZ = (Math.random() > 0.5 ? 1 : -1) * 0.07;
      ball.material.diffuseColor = randomColor3();
      return scene.render();
    }

    scene.render();
  });

  // Resize
  window.addEventListener('resize', () => {
    resizeCanvas();
  });
}
