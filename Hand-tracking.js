// Name: MediaPipe Hand Tracking (Optimized)
// Description: Advanced, high-performance hand detection using Google's MediaPipe.
// Author: Assistant

(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('MediaPipe Hand Tracking must be run unsandboxed.');
  }

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  class MediaPipeHandsExt {
    constructor() {
      this.hands = null;
      this.camera = null;
      this.results = null;
      
      this.videoElement = document.createElement('video');
      this.videoElement.style.display = 'none';
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      document.body.appendChild(this.videoElement);
      
      this.isRunning = false;
      this.ready = false;

      // Optimizations
      this.isDetecting = false;     // Lock to drop frames while processing
      this.intervalTime = 33;       // Default interval (30 FPS AI tracking)
      this.lastDetectTime = 0;      
      this.maxHands = 2;            // Processing fewer hands speeds up inference
      
      this.initModel();
    }

    async initModel() {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

        this.hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.hands.setOptions({
          maxNumHands: this.maxHands,
          modelComplexity: 0, // OPTIMIZATION: 0 = Lite Model (Much faster), 1 = Full
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        this.hands.onResults((results) => {
          this.results = results;
          this.isDetecting = false; // Release the lock
        });

        this.camera = new window.Camera(this.videoElement, {
          onFrame: async () => {
            if (!this.isRunning || this.videoElement.readyState < 2) return;
            
            // OPTIMIZATION: Frame Dropping & Throttling
            // Do not send a new frame if the model is still processing the old one, 
            // OR if the interval time hasn't passed.
            const now = performance.now();
            if (!this.isDetecting && (now - this.lastDetectTime >= this.intervalTime)) {
              this.isDetecting = true; // Lock
              this.lastDetectTime = now;
              
              // We don't await this directly to let the camera utility finish its loop instantly
              this.hands.send({ image: this.videoElement }).catch(e => {
                console.error('MediaPipe Error:', e);
                this.isDetecting = false; // Release lock on error
              });
            }
          },
          // OPTIMIZATION: Lower native video resolution. 
          // 320x240 is standard for ML vision, 480x360 is unnecessary overhead.
          width: 320, 
          height: 240
        });

        this.ready = true;
      } catch (e) {
        console.error("Failed to load MediaPipe:", e);
      }
    }

    getInfo() {
      return {
        id: 'mediapipehands',
        name: 'Hand Tracking',
        color1: '#0F9D58',
        color2: '#0B8043',
        blocks: [
          {
            opcode: 'isReady',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is model ready?'
          },
          '---',
          {
            opcode: 'startTracking',
            blockType: Scratch.BlockType.COMMAND,
            text: 'start hand tracking'
          },
          {
            opcode: 'stopTracking',
            blockType: Scratch.BlockType.COMMAND,
            text: 'stop hand tracking'
          },
          {
            opcode: 'isTracking',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'is tracking active?'
          },
          '---',
          {
            opcode: 'setInterval',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set detection interval to [MS] ms',
            arguments: {
              MS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 33
              }
            }
          },
          {
            opcode: 'setMaxHands',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set max tracked hands to [HANDS]',
            arguments: {
              HANDS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 2
              }
            }
          },
          '---',
          {
            opcode: 'handsDetected',
            blockType: Scratch.BlockType.REPORTER,
            text: 'number of hands detected'
          },
          {
            opcode: 'getHandedness',
            blockType: Scratch.BlockType.REPORTER,
            text: 'handedness of hand [HAND_INDEX]',
            arguments: {
              HAND_INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'getLandmark',
            blockType: Scratch.BlockType.REPORTER,
            text: '[AXIS] of landmark [LANDMARK] on hand [HAND_INDEX]',
            arguments: {
              AXIS: { type: Scratch.ArgumentType.STRING, menu: 'AXIS_MENU', defaultValue: 'x' },
              LANDMARK: { type: Scratch.ArgumentType.NUMBER, menu: 'LANDMARK_MENU', defaultValue: 8 },
              HAND_INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          }
        ],
        menus: {
          AXIS_MENU: { acceptReporters: true, items: ['x', 'y', 'z'] },
          LANDMARK_MENU: {
            acceptReporters: true,
            items: [
              {text: '0 (Wrist)', value: '0'},
              {text: '4 (Thumb Tip)', value: '4'},
              {text: '8 (Index Tip)', value: '8'},
              {text: '12 (Middle Tip)', value: '12'},
              {text: '16 (Ring Tip)', value: '16'},
              {text: '20 (Pinky Tip)', value: '20'}
            ]
          }
        }
      };
    }

    isReady() { return this.ready; }
    isTracking() { return this.isRunning; }

    startTracking() {
      if (!this.ready) return;
      this.isRunning = true;
      this.camera.start();
    }

    stopTracking() {
      if (!this.ready) return;
      this.isRunning = false;
      this.camera.stop();
      this.results = null;
      this.isDetecting = false;
    }
    
    setInterval(args) {
      this.intervalTime = Math.max(0, Scratch.Cast.toNumber(args.MS));
    }

    setMaxHands(args) {
      let hands = Math.max(1, Math.min(4, Scratch.Cast.toNumber(args.HANDS)));
      this.maxHands = hands;
      if (this.hands) {
        this.hands.setOptions({ maxNumHands: this.maxHands });
      }
    }

    handsDetected() {
      if (!this.results || !this.results.multiHandLandmarks) return 0;
      return this.results.multiHandLandmarks.length;
    }

    getHandedness(args) {
      if (!this.results || !this.results.multiHandedness) return '';
      const index = Math.max(1, Math.floor(args.HAND_INDEX)) - 1;
      if (index >= this.results.multiHandedness.length) return '';
      return this.results.multiHandedness[index].label;
    }

    getLandmark(args) {
      if (!this.results || !this.results.multiHandLandmarks) return 0;
      
      const index = Math.max(1, Math.floor(args.HAND_INDEX)) - 1;
      const landmark = Math.max(0, Math.min(20, Math.floor(args.LANDMARK)));
      const axis = String(args.AXIS).toLowerCase();
      
      if (index >= this.results.multiHandLandmarks.length) return 0;
      
      const lm = this.results.multiHandLandmarks[index][landmark];
      if (!lm) return 0;

      // Convert MediaPipe Coordinates to Scratch Stage Coordinates (-240 to 240, -180 to 180)
      if (axis === 'x') return (0.5 - lm.x) * 480; 
      if (axis === 'y') return (0.5 - lm.y) * 360;
      if (axis === 'z') return lm.z * 100; 
      
      return 0;
    }
  }

  Scratch.extensions.register(new MediaPipeHandsExt());
})(Scratch);