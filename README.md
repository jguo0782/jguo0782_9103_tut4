# jguo0782_9103_tut4 Group_E Individual Work
## Broadway
- [Part 1: Imaging Technique Inspiration](#part1-imaging-technique-inspiration)
- [Part 2: Coding Technique Exploration](#part2-coding-technique-exploration)
---
## Interation Method
After opening the HTML file, click Play to experience an abstract 3D cityscape animated in sync with the CityPOP track "Plastic Love," using FFT analysis of the audio signal.  
You can adjust the volume with the slider to control sound levels, and the Play/Pause button controls both the music and the animation. The track is set to loop, so it will automatically restart upon completion.  
The camera angle can be adjusted by dragging with the mouse, allowing you to explore the cityscape from different perspectives.
### Design Inspiration and Concept
The inspiration is comes from modern city and nostalgic culture from recent year‘s internet.
The four main elements each respond to the track in unique ways, creating an abstract cityscape where particles represent moving crowds, vertical lines suggest building outlines, plates and spaces between plates form streets and districts, and boxes symbolize urban vibrancy. CityPOP, a genre popular in the 1980s, reflects urban life and emotions, aligning with Mondrian's Broadway-inspired depiction of city streets.
With a rich distribution of low, mid, and high frequencies, CityPOP music provides a layered animation through FFT analysis, generating diverse visual responses in each element. Initial attempts to map every element to FFT data proved overwhelming, so selective elements (vertical lines and random boxes) are tied to frequency, while others (plates and particles) are timed to the track.
### Change to the Group Code
* Audio Player and Analysis:
  Introduced audio and FFT variables in the preload function to load and analyze the audio file, enabling looped playback via p5.js.  

* Color Sequence and Change Interval:
  Added colorSequence and colorChangeInterval attributes in the Scene class, defining a set of colors and a 2000ms interval for dynamic color transitions.  

* Audio Control Parameters:
  Included an audioParams object, with parameters like minScale, maxScale, boxMinScale, and boxMaxScale, for fine-tuning visual responses to audio.  

* Particle Effect Configuration:
  Added a particles array and particleConfig object to the Scene class, setting base radius, offset position, dispersion speed, and variation for dynamic particle effects.  

* Dynamic Color and Size Change:
  Integrated color-changing logic into initializePlates where each plate has colorIndex, lastColorChange, colorSequence, and colorChangeInterval, enabling timed color shifts. Each randomly generated plate retains its original size for frequency-based resizing.
### Steps from Group Work to Individual Work
**Added audio functionality by loading an audio file and initializing FFT in preload, enabling scene-audio interactivity.**
Implemented a Particle class to introduce new visual elements.
* Designed FFT-based animations for selective elements like vertical lines and random boxes, while others respond to elapsed time to balance aesthetics.
* Camera Adjustment: Repositioned the camera for a vertical perspective, making the vertical lines resemble building contours, with FFT-affected elements more visible.
