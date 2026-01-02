// Energy Grid Animation with integrated pylon
const canvas = document.getElementById("energyCanvas");
const ctx = canvas.getContext("2d");

let width, height;
let mouse = { x: 0, y: 0 };
let nodes = [];
let connections = [];
let animationTime = 0;
let globalOpacity = 0;
const fadeInDuration = 3000; // 3 seconds fade in
let pylonPulse = 0;
let pylonScale, pylonOffsetX, pylonOffsetY;

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initializeGrid();
}

// Power transmission tower SVG path (simplified from reference)
const pylonPath = new Path2D(
  "m 256,139.86328 -8.57227,2.5293 c -3.70193,13.68593 -4.20507,19.46875 -4.20507,19.46875 l -45.31055,18.23047 -0.0371,1.6582 42.70508,0.34961 c 0,0 -1.88959,15.46274 -3.12696,17.18164 -1.2373,1.7189 -18.11919,7.77336 -19.99218,7.72656 -1.87299,-0.0468 -14.23438,-6.24219 -14.23438,-6.24219 l -2.14062,1.53907 12.3203,5.94531 L 166,223.875 V 226 l 2.5,0.0234 4.46875,-1.61719 61.90625,-0.28125 -10.5332,38.25 c -0.20748,0.74099 -0.62839,1.89053 -1.38086,2.44922 -0.76349,0.56688 -2.00263,0.67592 -2.95703,0.36523 l -49.96485,-18.65234 0.0937,2.25781 52.20508,19.71875 c -13.74165,46.06936 -29.75278,67.42863 -37.09375,73.95313 l 6.37109,-0.15821 c 9.0487,-8.82443 22.62054,-38.55923 25.06836,-46.33984 l 5.48047,-1.85742 c -11.87111,36.60606 -14.44442,46.51016 -19.13672,46.71484 4.05309,1.80922 8.16699,1.09238 12.47852,0.88867 L 256,312.97656 l 40.49414,28.73828 c 4.31153,0.20371 8.42543,0.92055 12.47852,-0.88867 -4.6923,-0.20468 -7.26561,-10.10878 -19.13672,-46.71484 l 5.48047,1.85742 c 2.44782,7.78061 16.01966,37.51541 25.06836,46.33984 l 6.37109,0.15821 c -7.34097,-6.5245 -23.3521,-27.88377 -37.09375,-73.95313 l 52.20508,-19.71875 0.0937,-2.25781 -49.96485,18.65234 c -0.9544,0.31069 -2.19354,0.20165 -2.95703,-0.36523 -0.75247,-0.55869 -1.17338,-1.70823 -1.38086,-2.44922 l -10.5332,-38.25 61.90625,0.28125 4.4688,1.61719 L 346,226 v -2.125 l -47.40625,-15.625 12.32031,-5.94531 -2.14062,-1.53907 c 0,0 -12.36139,6.19539 -14.23438,6.24219 -1.87299,0.0468 -18.75488,-6.00766 -19.99218,-7.72656 -1.23738,-1.7189 -3.12696,-17.18164 -3.12696,-17.18164 L 314.125,181.75 l -0.0371,-1.6582 -45.31055,-18.23047 c 0,0 -0.50314,-5.78282 -4.20507,-19.46875 z m -6.08203,3.43555 1.24023,0.33398 -4.24609,14.71485 c -0.45235,-2.63066 2.08313,-10.86724 3.00586,-15.04883 z m 12.16406,0 c 0.92273,4.18159 3.45821,12.41817 3.00586,15.04883 l -4.24609,-14.71485 z m -6.97851,1.15625 L 256,144.5 l 0.89648,-0.0449 c 2.31526,6.29925 6.01708,12.94 6.94532,18.89844 L 256,170.0625 l -7.8418,-6.70898 c 0.92824,-5.95844 4.63006,-12.59919 6.94532,-18.89844 z M 246.3125,165 l 7.8125,6.875 -9.6875,6.625 z m 19.375,0 1.875,13.5 -9.6875,-6.625 z m -23.0625,0.3125 -1.125,11.3125 -10.6875,-6.75 z m 26.75,0 11.8125,4.5625 -10.6875,6.75 z m -41.3125,5.75 12.875,8.75 L 203,180.125 Z m 55.875,0 L 309,180.125 271.0625,179.8125 Z M 256,173.4375 264.6582,179.7207 256,179.75 247.3418,179.7207 Z M 243.69141,181.95508 256,182.0625 268.30859,181.95508 256,191.94141 Z m -0.20313,2.84375 9.92188,7.91015 -12.1543,10.18555 z m 25.02344,0 2.23242,18.0957 -12.1543,-10.18555 z M 256,194.375 269.125,204.6875 256,213.875 242.875,204.6875 Z m -18.375,8.5 -1.875,13.9375 -14.4375,-8.1875 z m 36.75,0 16.3125,5.75 -14.4375,8.1875 z m -33.80469,2.89258 12.90625,9.94336 -8.81836,5.63476 -4.15429,-0.0664 -2.07618,-1.41407 z m 30.85938,0 2.14258,14.09765 -2.07618,1.41407 -4.15429,0.0664 -8.81836,-5.63476 z m -54.17969,4.41992 18.4375,10.4375 -1.4375,1.4375 -14.875,-0.25 -14.9375,-7.6875 z m 77.5,0 12.8125,3.9375 -14.9375,7.6875 -14.875,0.25 -1.4375,-1.4375 z m -93.625,5 12.0625,6.6875 -32.9375,-0.0625 z m 109.75,0 20.875,6.625 -32.9375,0.0625 z M 256,217.75 l 6,3.5625 -6,0.1875 -6,-0.1875 z M 241.3125,224.5 256,224.6875 270.6875,224.5 256,236.5625 Z m -2.17773,1.81836 14.82617,12.1543 -18.71485,14.62695 z m 33.73046,0 3.88868,26.78125 -18.71485,-14.62695 z M 256,240.12109 275.75781,256.58008 256,269.89453 236.24219,256.58008 Z m -22.3125,0.81641 0.5,1.875 -4.80469,20.91406 -3.20898,1.97461 z m 44.625,0 7.51367,24.76367 -3.20898,-1.97461 -4.80469,-20.91406 z m -44.12695,17.11133 18.62695,13.34765 -26.07422,17.03711 z m 43.6289,0 7.44727,30.38476 -26.07422,-17.03711 z m -48.74609,7.04101 -5.88086,25.59766 -5.125,1.75 7.59375,-25.02734 z m 53.86328,0 3.41211,2.32032 7.59375,25.02734 -5.125,-1.75 z M 256,273.07617 283.45312,291.2168 256,310.43164 228.54688,291.2168 Z M 225.9375,292.875 252.375,311.25 212.1875,338 Z m 60.125,0 13.75,45.125 -40.1875,-26.75 z",
);

function drawPylon() {
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate scale - 3x bigger (was 0.6, now 1.8)
  const targetSize = Math.min(width, height) * 1.8;
  pylonScale = targetSize / 512;

  pylonOffsetX = centerX - 256 * pylonScale;
  pylonOffsetY = centerY - 256 * pylonScale;

  pylonPulse += 0.01;
  const pulse = Math.sin(pylonPulse) * 0.5 + 0.5;

  ctx.save();

  // Position and scale the pylon
  ctx.translate(pylonOffsetX, pylonOffsetY);
  ctx.scale(pylonScale, pylonScale);

  // Create gradient mask for bottom-to-top fade
  const gradient = ctx.createLinearGradient(256, 340, 256, 140);
  gradient.addColorStop(0, `rgba(160, 196, 255, 0)`); // Bottom - completely invisible
  gradient.addColorStop(0.4, `rgba(160, 196, 255, 0.005)`);
  gradient.addColorStop(0.7, `rgba(160, 196, 255, 0.01)`);
  gradient.addColorStop(1, `rgba(160, 196, 255, 0.02)`); // Top - barely visible

  // Draw subtle fill with gradient
  ctx.fillStyle = gradient;
  ctx.fill(pylonPath);

  // Very faint outline with gradient
  const outlineGradient = ctx.createLinearGradient(256, 340, 256, 140);
  outlineGradient.addColorStop(0, `rgba(160, 196, 255, 0)`);
  outlineGradient.addColorStop(
    0.5,
    `rgba(160, 196, 255, ${0.015 + pulse * 0.005})`,
  );
  outlineGradient.addColorStop(
    1,
    `rgba(160, 196, 255, ${0.025 + pulse * 0.01})`,
  );

  ctx.strokeStyle = outlineGradient;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 10;
  ctx.shadowColor = `rgba(160, 196, 255, ${0.02 + pulse * 0.015})`;
  ctx.stroke(pylonPath);

  ctx.restore();
}

// Helper function to check if point is near pylon structure
function isNearPylonStructure(x, y) {
  if (!pylonScale) return false;

  // Transform point to pylon local space
  const localX = (x - pylonOffsetX) / pylonScale;
  const localY = (y - pylonOffsetY) / pylonScale;

  // Check if within pylon bounds
  if (localX < 150 || localX > 362 || localY < 130 || localY > 350) {
    return false;
  }

  // Approximate distance check to main structure areas
  const centerDist = Math.abs(localX - 256);
  const verticalPos = localY;

  // Define structure zones (simplified)
  if (verticalPos < 170 && centerDist < 15) return true; // Top spike
  if (verticalPos >= 170 && verticalPos < 230 && centerDist < 50) return true; // Upper crossbars
  if (verticalPos >= 230 && verticalPos < 290 && centerDist < 80) return true; // Middle section
  if (verticalPos >= 290 && centerDist < 100) return true; // Lower legs

  return false;
}

class Node {
  constructor(x, y) {
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    this.energy = 0; // Start with no energy
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.maxDistance = 150;
    this.visibility = 0; // Start invisible
    this.targetVisibility = 0;
    this.neighbors = [];

    const centerX = width / 2;
    const centerY = height / 2;
    const distToCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    this.nearPylon = distToCenter < Math.min(width, height) * 0.3;
    this.onPylonStructure = false; // Will be checked during update

    // Nodes near pylon start revealing
    if (this.nearPylon) {
      this.targetVisibility = 1;
    }
  }

  update() {
    // Check if node is on pylon structure (recalculate each frame)
    this.onPylonStructure = isNearPylonStructure(this.baseX, this.baseY);

    // Update visibility
    this.visibility += (this.targetVisibility - this.visibility) * 0.05;

    // Nodes on pylon structure are immediately revealed and activate neighbors
    if (this.onPylonStructure && this.targetVisibility < 1) {
      this.targetVisibility = 1;
      this.visibility = Math.max(this.visibility, 0.5); // Quick reveal
    }

    // Reveal neighbors when this node has high energy or visibility
    if (this.visibility > 0.3 || this.energy > 0.5 || this.onPylonStructure) {
      this.neighbors.forEach((neighbor) => {
        if (neighbor.targetVisibility < 1) {
          neighbor.targetVisibility = 1;
        }
      });
    }

    const dx = mouse.x - this.baseX;
    const dy = mouse.y - this.baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0 && distance < this.maxDistance) {
      const force = (1 - distance / this.maxDistance) * 30;
      const offsetX = (dx / distance) * force;
      const offsetY = (dy / distance) * force;
      this.x = this.baseX + offsetX;
      this.y = this.baseY + offsetY;
      this.energy = Math.min(1, this.energy + 0.02);
      // Activate node on mouse interaction
      if (this.targetVisibility < 1) {
        this.targetVisibility = 1;
      }
    } else {
      this.x += (this.baseX - this.x) * 0.1;
      this.y += (this.baseY - this.y) * 0.1;
      this.energy *= 0.98;
    }

    this.pulsePhase += 0.02;
    // Nodes on pylon structure get strong energy boost
    const pulseBoost = this.onPylonStructure ? 0.6 : this.nearPylon ? 0.3 : 0;
    this.energy += Math.sin(this.pulsePhase) * 0.01;
    this.energy += Math.sin(pylonPulse) * 0.02 * pulseBoost;
    this.energy = Math.max(0, Math.min(1, this.energy));
  }

  draw() {
    if (this.visibility < 0.01) return; // Skip if invisible

    const size = 2 + this.energy * 2;
    const alpha = (0.2 + this.energy * 0.5) * this.visibility;

    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      size * 3,
    );
    gradient.addColorStop(0, `rgba(160, 196, 255, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(160, 196, 255, ${alpha * 0.3})`);
    gradient.addColorStop(1, "rgba(160, 196, 255, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Connection {
  constructor(nodeA, nodeB) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.flowOffset = Math.random() * 100;
  }

  draw() {
    const avgVisibility = (this.nodeA.visibility + this.nodeB.visibility) / 2;
    if (avgVisibility < 0.01) return; // Skip if both nodes invisible

    const dx = this.nodeB.x - this.nodeA.x;
    const dy = this.nodeB.y - this.nodeA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const avgEnergy = (this.nodeA.energy + this.nodeB.energy) / 2;
    const alpha = (0.1 + avgEnergy * 0.3) * avgVisibility;

    ctx.strokeStyle = `rgba(160, 196, 255, ${alpha * 0.6})`;
    ctx.lineWidth = 0.8 + avgEnergy * 1;
    ctx.beginPath();
    ctx.moveTo(this.nodeA.x, this.nodeA.y);
    ctx.lineTo(this.nodeB.x, this.nodeB.y);
    ctx.stroke();

    if (avgEnergy > 0.3) {
      this.flowOffset += avgEnergy * 2;
      const numParticles = Math.floor(avgEnergy * 3);

      for (let i = 0; i < numParticles; i++) {
        const t = ((this.flowOffset + i * 30) % distance) / distance;
        const x = this.nodeA.x + dx * t;
        const y = this.nodeA.y + dy * t;

        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, 3);
        particleGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 2})`);
        particleGradient.addColorStop(1, `rgba(160, 196, 255, 0)`);

        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function initializeGrid() {
  nodes = [];
  connections = [];

  const gridSpacing = 80;
  const cols = Math.ceil(width / gridSpacing) + 1;
  const rows = Math.ceil(height / gridSpacing) + 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * gridSpacing + (Math.random() - 0.5) * 20;
      const y = row * gridSpacing + (Math.random() - 0.5) * 20;
      nodes.push(new Node(x, y));
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].baseX - nodes[i].baseX;
      const dy = nodes[j].baseY - nodes[i].baseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < gridSpacing * 1.5) {
        connections.push(new Connection(nodes[i], nodes[j]));
        // Build neighbor relationships
        nodes[i].neighbors.push(nodes[j]);
        nodes[j].neighbors.push(nodes[i]);
      }
    }
  }
}

function animate() {
  // Update animation time
  animationTime += 16; // Approximate frame time
  globalOpacity = Math.min(1, animationTime / fadeInDuration);

  ctx.fillStyle = "rgba(10, 14, 18, 0.25)";
  ctx.fillRect(0, 0, width, height);

  // Draw connections first (behind everything)
  connections.forEach((connection) => connection.draw());

  // Draw pylon integrated with the grid (not separate layer)
  ctx.globalAlpha = globalOpacity;
  drawPylon();
  ctx.globalAlpha = 1;

  // Draw nodes on top
  nodes.forEach((node) => {
    node.update();
    node.draw();
  });

  requestAnimationFrame(animate);
}

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("touchmove", (e) => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
animate();
