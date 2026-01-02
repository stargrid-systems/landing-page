// Energy Grid Animation with integrated pylon
const canvas = document.getElementById("energyCanvas");
const ctx = canvas.getContext("2d");

let width, height;
let mouse = { x: -9999, y: -9999 }; // Start off-screen
let nodes = [];
let connections = [];
let animationTime = 0;
let globalOpacity = 0;
let started = false;
let lastTimestamp = 0;
const autoStartDelay = 1000; // ms before auto start if idle
const pylonFadeDelay = 600; // ms delay before showing pylon
let pylonTimer = null;
const fadeInDuration = 3000; // 3 seconds fade in

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initializeGrid();
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
  }

  update() {
    // Update visibility
    this.visibility += (this.targetVisibility - this.visibility) * 0.05;

    // Reveal neighbors when this node has high energy or visibility
    if (this.visibility > 0.3 || this.energy > 0.5) {
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
    this.energy += Math.sin(this.pulsePhase) * 0.01;
    this.energy = Math.max(0, Math.min(1, this.energy));
  }

  draw() {
    if (this.visibility < 0.01) return; // Skip if invisible

    const size = 2 + this.energy * 2;
    const alpha = (0.2 + this.energy * 0.5) * this.visibility * globalOpacity;

    // Simple glow effect without gradient
    ctx.fillStyle = `rgba(160, 196, 255, ${alpha * 0.2})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Core node
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
    const alpha = (0.1 + avgEnergy * 0.3) * avgVisibility * globalOpacity;

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

        // Simple particle without gradient
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
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

function startAnimation(x = width / 2, y = height / 2) {
  if (started) return;
  started = true;
  animationTime = 0;
  globalOpacity = 0;
  mouse.x = x;
  mouse.y = y;
  if (!pylonTimer) {
    pylonTimer = setTimeout(() => {
      document.body.classList.add("pylon-start");
    }, pylonFadeDelay);
  }
}

function animate(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  if (started) {
    animationTime += delta;
    globalOpacity = Math.min(1, animationTime / fadeInDuration);
  } else {
    globalOpacity = 0;
  }

  ctx.fillStyle = "rgba(10, 14, 18, 0.25)";
  ctx.fillRect(0, 0, width, height);

  // Draw connections first (behind everything)
  connections.forEach((connection) => connection.draw());

  // Draw nodes on top
  nodes.forEach((node) => {
    node.update();
    node.draw();
  });

  requestAnimationFrame(animate);
}

window.addEventListener("mousemove", (e) => {
  if (!started) startAnimation(e.clientX, e.clientY);
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("touchmove", (e) => {
  if (!started) startAnimation(e.touches[0].clientX, e.touches[0].clientY);
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
setTimeout(() => {
  if (!started) {
    startAnimation(width / 2, height / 2);
  }
}, autoStartDelay);
requestAnimationFrame(animate);
