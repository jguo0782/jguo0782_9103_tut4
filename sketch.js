// This technique was not covered in class but does WEBGL mode to create 3D vision
/* This technique is from
https://p5js.org/zh-Hans/reference/p5/WEBGL/
https://p5js.org/zh-Hans/contribute/webgl_mode_architecture/
https://p5js.org/zh-Hans/tutorials/optimizing-webgl-sketches/
https://p5js.org/zh-Hans/examples/3d-geometries/
https://p5js.org/zh-Hans/reference/p5/box/
https://www.youtube.com/watch?v=nqiKWXUX-o8&list=PLRqwX-V7Uu6bPhi8sS1hHJ77n3zRO9FR_
*/

let song;
let fft;
let volume = 0.5; // Initial volume level
let isPlaying = false; // Boolean to track if the song is currently playing
let volumeSlider; // Volume control slider
let playButton; // Play button
let startTime = 0; // Tracks the start time of the audio playback

function preload() {
  song = loadSound('assets/CityPOP_PlasticLove.mp3');
  fft = new p5.FFT();  // Initialize Fast Fourier Transform for audio analysis
  song.setLoop(true);  // Set the audio to loop when it ends
}
class Scene {
  constructor() {
    // Define the colors used in the scene
    this.colors = {
      background: '#F1F2ED',
      red: '#A03225',
      blue: '#486FBE',
      grey: '#D8D6C7',
      yellow: '#EBD42B',
      line: '#606060'
    };
    // Sequence of colors for color changes in elements
    this.colorSequence = [
      this.colors.yellow,
      this.colors.grey,
      this.colors.blue,
      this.colors.red
    ];
    // Interval in milliseconds for color changes
    this.colorChangeInterval = 2000;
    // Plate configurations
    this.plateConfigs = [
      { x: -200, y: -130, z: -40, w: 200, h: 10, d: 80, color: this.colors.grey },
      { x: -50, y: 200, z: -20, w: 200, h: 10, d: 80, color: this.colors.grey },
      { x: 100, y: 0, z: -15, w: 120, h: 10, d: 100, color: this.colors.blue },
      { x: -150, y: 50, z: -30, w: 80, h: 10, d: 80, color: this.colors.red },
      { x: -10, y: -50, z: -25, w: 80, h: 10, d: 80, color: this.colors.red },
      { x: 200, y: 100, z: -10, w: 80, h: 10, d: 180, color: this.colors.yellow },
      { x: -250, y: 30, z: -20, w: 80, h: 10, d: 200, color: this.colors.yellow },
      { x: 130, y: -150, z: 0, w: 200, h: 10, d: 80, color: this.colors.yellow },
    ];
    // Initialize components
    this.verticalLines = [];
    this.initializeVerticalLines();

    this.plates = [];
    this.initializePlates();

    this.randomBoxes = [];
    this.initializeRandomBoxes();

    this.audioParams = {
      boxMinScale: 0.5,
      boxMaxScale: 2.0
    };
     // Array to store particles for animation effects
    this.particles = [];

    this.particleConfig = {
      baseRadius: 350, // Base radius for particle placement
      radiusVariation: 20, // Random offset for particle placement
      speed: 0.8, // Base speed for particle movement
      speedVariation: 3 // Range of speed variation for particles
    };
  }
  // Initialize vertical lines based on plate configurations
  initializeVerticalLines() {
    for (let i = 0; i < this.plateConfigs.length; i++) {
      let plate = this.plateConfigs[i];
      // Calculate the bottom-left and top-right corners for each plate
      let bottomLeftCorner = { x: plate.x - plate.w / 2, y: plate.y - plate.d / 2 };
      let topRightCorner = { x: plate.x + plate.w / 2, y: plate.y + plate.d / 2 };

      let corners = [bottomLeftCorner, topRightCorner];
      // Add a vertical line at each corner of the plate
      for (let j = 0; j < corners.length; j++) {
        let corner = corners[j];
        let line = new VerticalLine(corner.x, corner.y, plate.z, 300, 5, this.colors.line);
        this.verticalLines.push(line);
      }
    }
  }
  // Initialize plates based on predefined configurations
  initializePlates() {
    this.plates = this.plateConfigs.map(config => {
      let plate = new Plate(
        config.x, config.y, config.z,
        config.w, config.h, config.d,
        config.color
      );
      
      plate.colorIndex = this.colorSequence.indexOf(config.color);
      if (plate.colorIndex === -1) plate.colorIndex = 0;
      plate.lastColorChange = millis() - random(0, this.colorChangeInterval);
      plate.colorSequence = this.colorSequence;
      plate.colorChangeInterval = this.colorChangeInterval;
      
      return plate;
    });
  }
  // Initialize random boxes in the scene with random properties
  initializeRandomBoxes() {
    let boxCount = 20;
    for (let i = 0; i < boxCount; i++) {
      let boxColor = random([this.colors.red, this.colors.blue, this.colors.grey, this.colors.yellow]);
      let boxSize = random(10, 30);

      let baseLine = random(this.verticalLines);
      let boxX = baseLine.x + random(-10, 10);
      let boxY = baseLine.y + random(-10, 10);
      let boxZ = random(-40, -300);

      let box = new Plate(boxX, boxY, boxZ, boxSize, boxSize, boxSize, boxColor);
      box.originalSize = boxSize;
      box.freqIndex = floor(random(0, 1024));
      this.randomBoxes.push(box);
    }
  }
   // Draw the scene based on volume and audio spectrum data
  draw(volume, spectrum) {
    background(this.colors.background);
    // Draw vertical lines with scaling based on audio spectrum
    for (let i = 0; i < this.verticalLines.length; i++) {
      let line = this.verticalLines[i];
      let freqIndex = floor(map(line.x, -400, 400, 0, spectrum.length - 1));
      let freqValue = spectrum[freqIndex];
      let heightScale = map(freqValue, 0, 255, 0.5, 1.5);
      line.currentHeight = line.baseHeight * heightScale;
      line.draw();
    }
    // Draw plates with color updating if music is playing
    for (let i = 0; i < this.plates.length; i++) {
      let plate = this.plates[i];
      if (isPlaying) {
        plate.updateColor();
      }
      plate.draw();
    }
    // Draw random boxes with scale changes based on audio spectrum
    for (let i = 0; i < this.randomBoxes.length; i++) {
      let box = this.randomBoxes[i];
      let freqValue = spectrum[box.freqIndex];
      let boxScale = map(freqValue, 0, 255, this.audioParams.boxMinScale, this.audioParams.boxMaxScale);
      box.width = box.originalSize * boxScale;
      box.height = box.originalSize * boxScale;
      box.depth = box.originalSize * boxScale;
      box.draw();
    }
    // Generate and draw particles if the music is playing
    if (isPlaying) {
      for (let i = 0; i < 5; i++) {
        let angle = random(TWO_PI);
        let radius = this.particleConfig.baseRadius + random(-this.particleConfig.radiusVariation, this.particleConfig.radiusVariation);
        let speed = this.particleConfig.speed + random(-this.particleConfig.speedVariation, this.particleConfig.speedVariation);
        let particleColor = random([
          this.colors.red,
          this.colors.blue,
          this.colors.grey,
          this.colors.yellow
        ]);
        
        this.particles.push(new Particle(
          radius * cos(angle),
          radius * sin(angle),
          -40,
          speed,
          angle,
          particleColor
        ));
      }
    }
    // Update and remove finished particles from the scene
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      this.particles[i].draw();
      if (this.particles[i].isFinished()) {
        this.particles.splice(i, 1);
      }
    }
  }
  // Reset plate color change time to start time with random offset
  resetPlatesColorTime() {
    this.plates.forEach(plate => {
      plate.lastColorChange = startTime - random(0, this.colorChangeInterval);
    });
  }
}
// Plate class represents particles 
class Particle {
  constructor(x, y, z, speed, angle, color) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.speed = speed;
    this.angle = angle;
    this.color = color;
    this.alpha = 255;  // Initial opacity level
  }
  // Update position and fade out
  update() {
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
    this.alpha -= 5; // Decrease opacity over time
  }
  // Draw the particle as a small sphere
  draw() {
    push();
    translate(this.x, this.y, this.z);
    let c = color(this.color);
    c.setAlpha(this.alpha);
    fill(c);
    noStroke();
    sphere(2);
    pop();
  }
  // Check if the particle has faded out
  isFinished() {
    return this.alpha <= 0;
  }
}
// Plate class represents a rectangular plate in 3D space
class Plate {
  constructor(x, y, z, width, height, depth, color) {
    this.x = x;       // X position of the plate
    this.y = y;       // Y position of the plate
    this.z = z;       // Z position of the plate
    this.width = width;  // Width of the plate
    this.height = height; // Height of the plate
    this.depth = depth;   // Depth of the plate
    this.color = color;   // Color of the plate
    this.colorSequence = []; // Sequence for color transitions
    this.colorChangeInterval = 0; // Time interval for color changes
    this.colorIndex = 0; // Index in color sequence for the current color
    this.lastColorChange = 0; // Last time the color was changed
  }
  // Update plate color if enough time has passed
  updateColor() {
    let currentTime = millis();
    
    if (currentTime - this.lastColorChange >= this.colorChangeInterval) {
      this.colorIndex = (this.colorIndex + 1) % this.colorSequence.length;
      this.color = this.colorSequence[this.colorIndex];
      this.lastColorChange = currentTime;
    }
  }
  // Method to draw the plate in the scene
  draw() {
    push(); // Save current transformation state
    translate(this.x, this.y, this.z); // Move to the plate's position
    fill(this.color); // Set the fill color for the plate
    noStroke(); // Disable the outline stroke for the plate
    box(this.width, this.depth, this.height); // Draw the plate as a box
    pop(); // Restore the previous transformation state
  }
}
// VerticalLine class represents a vertical line in 3D space
class VerticalLine {
  constructor(x, y, z, height, width, color) {
    this.x = x;       // X position of the line
    this.y = y;       // Y position of the line
    this.z = z;       // Z position of the line
    this.height = height; // Height of the line
    this.width = width;   // Width of the line
    this.color = color;   // Color of the line
    this.baseHeight = height;
    this.currentHeight = height;
  }

  draw() {
    push();// Save current transformation state
    translate(this.x, this.y, this.z - this.currentHeight / 2);
    fill(this.color);// Set the fill color for the line
    noStroke(); // Disable the outline stroke for the line
    box(this.width, this.width, this.currentHeight);// Draw the line as a box
    pop(); // Restore the previous transformation state
  }
}
// Global variable to hold the scene instance
let scene;
// Setup function runs once when the program starts
function setup() {
  // This technique was not covered in class , using WEBGL 
  createCanvas(windowWidth, windowHeight, WEBGL); // Create a canvas in WEBGL mode
  camera(800, 600, -600, 0, 0, 0, 0, 0, 1);  // Set the camera position and orientation
  scene = new Scene(); // Create a new Scene instance

  // Create a volume slider to control the audio volume, ranging from 0 to 1
  volumeSlider = createSlider(0, 1, 0.5, 0.01);
  volumeSlider.position(20, 20);
  volumeSlider.input(volumeChanged);
  // Prevent slider events from interfering with canvas interactions
  volumeSlider.elt.addEventListener('mousedown', function(e) {
    e.stopPropagation();
  });
  volumeSlider.elt.addEventListener('mousemove', function(e) {
    e.stopPropagation();
  });
  volumeSlider.elt.addEventListener('mouseup', function(e) {
    e.stopPropagation();
  });
  // Create a play button to control audio playback, with an initial label of 'Play'
  playButton = createButton('Play');
  playButton.position(20, 50);
  playButton.mousePressed(togglePlay); // Attach play/pause toggle function
  
  playButton.elt.addEventListener('mousedown', function(e) {
    e.stopPropagation();
  });
  // Set the initial audio volume based on the slider's default value
  song.setVolume(volume);
}
function draw() {
  // Analyze the audio spectrum data for visualizing sound frequencies
  let spectrum = fft.analyze();
  // Map the slider's volume value to a range of 0 to 1 for the audio
  volume = map(volumeSlider.value(), 0, 1, 0, 1);
  // Draw the scene based on the current volume and spectrum data
  scene.draw(volume, spectrum);

  orbitControl(); // Allow user to control the camera orbit
}
// Function to toggle audio playback when the play button is pressed
function togglePlay() {
  if (isPlaying) {
    song.pause();
    playButton.html('Play');
  } else {
    song.play();
    playButton.html('Pause');
    startTime = millis(); // Set start time to current time
    scene.resetPlatesColorTime(); // Reset plate colors in the scene
  }
  isPlaying = !isPlaying; // Toggle play state
}
// Function to handle volume changes from the slider
function volumeChanged() {
  volume = volumeSlider.value();  // Update volume value from slider
  song.setVolume(volume); // Set song volume to match slider
}// Window resize event handler
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);// Adjust canvas size when the window is resized
}

