document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        const container = canvas.closest('.canvas-container');
        const containerWidth = container.clientWidth;
        canvas.width = containerWidth;
        canvas.height = containerWidth;
    }
    
    // Initial resize
    resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
        // Recalculate particle positions
        particles.forEach(particle => {
            if (particle.hasTarget) {
                const point = heartPoints[particle.targetIndex];
                particle.setTarget(point, particle.targetIndex);
            }
        });
    });
    
    let time = 0;
    let particles = [];
    let heartPoints = [];
    const numPoints = 200;
    
    // Generate heart points
    for(let i = 0; i <= numPoints; i++) {
        let angle = (i / numPoints) * Math.PI * 2;
        let r = Math.sin(angle) * Math.sqrt(Math.abs(Math.cos(angle))) / 
               (Math.sin(angle) + 1.4) * 40;
        let x = r * Math.cos(angle);
        let y = -r * Math.sin(angle);
        heartPoints.push({x, y});
    }
    
    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height;
            this.targetPoint = null;
            this.hasTarget = false;
            this.targetIndex = -1;
            this.value = Math.random() < 0.5 ? '0' : '1';
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -20;
            this.speed = 2 + Math.random() * 2;
            this.opacity = 0.1 + Math.random() * 0.5;
        }
        
        setTarget(point, index) {
            const scale = canvas.width / 800;
            this.targetIndex = index;
            this.targetPoint = {
                x: point.x * 8 * scale + canvas.width/2,
                y: point.y * 8 * scale + canvas.height/2
            };
            this.hasTarget = true;
        }
        
        update() {
            if (!this.hasTarget) {
                this.y += this.speed;
                if (this.y > canvas.height) {
                    this.reset();
                }
            } else {
                let dx = this.targetPoint.x - this.x;
                let dy = this.targetPoint.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 2) {
                    this.x = this.targetPoint.x;
                    this.y = this.targetPoint.y;
                    this.opacity = 1;
                } else {
                    this.x += dx * 0.05;
                    this.y += dy * 0.05;
                    this.opacity = Math.min(1, this.opacity + 0.01);
                }
            }
        }
        
        draw() {
            const scale = canvas.width / 800;
            const fontSize = Math.max(8, Math.min(12 * scale, 12));
            ctx.font = `${fontSize}px monospace`;
            ctx.fillStyle = `rgba(255, 75, 75, ${this.opacity})`;
            ctx.fillText(this.value, this.x, this.y);
        }
    }
    
    // Create initial particles - adjust based on screen size
    const particleCount = Math.min(300, Math.max(100, Math.floor(canvas.width / 3)));
    for(let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    let lastAssignmentTime = 0;
    let assignedPoints = 0;
    
    // Text animation
    const text = document.getElementById('codingText');
    const originalText = text.textContent;
    text.textContent = '';
    let currentChar = 0;
    let textVisible = false;
    
    function animateText() {
        if (assignedPoints > heartPoints.length * 0.9 && !textVisible) {
            textVisible = true;
            typeText();
        }
    }
    
    function typeText() {
        if (currentChar < originalText.length) {
            text.style.opacity = '1';
            let randomChars = '01';
            let iterations = 0;
            const maxIterations = 5;
            
            const intervalId = setInterval(() => {
                text.textContent = originalText.slice(0, currentChar) +
                    randomChars[Math.floor(Math.random() * 2)] +
                    originalText.slice(currentChar + 1);
                
                iterations++;
                if (iterations === maxIterations) {
                    clearInterval(intervalId);
                    text.textContent = originalText.slice(0, currentChar + 1) +
                        originalText.slice(currentChar + 1);
                    currentChar++;
                    setTimeout(typeText, 100);
                }
            }, 50);
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        time += 0.016;
        
        // Assign targets to particles gradually
        if (time - lastAssignmentTime > 0.1 && assignedPoints < heartPoints.length) {
            let particlesWithoutTarget = particles.filter(p => !p.hasTarget);
            if (particlesWithoutTarget.length > 0) {
                let particle = particlesWithoutTarget[Math.floor(Math.random() * particlesWithoutTarget.length)];
                particle.setTarget(heartPoints[assignedPoints], assignedPoints);
                assignedPoints++;
                lastAssignmentTime = time;
            }
        }
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Add new floating particles
        const maxParticles = Math.min(100, Math.floor(canvas.width / 8));
        if (particles.filter(p => !p.hasTarget).length < maxParticles) {
            particles.push(new Particle());
        }
        
        animateText();
        requestAnimationFrame(animate);
    }
    
    animate();
});
