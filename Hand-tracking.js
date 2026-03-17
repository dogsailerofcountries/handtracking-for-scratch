(function (Scratch) {
    'use strict';

    if (!Scratch.extensions.unsandboxed) {
        throw new Error('MediaPipe Hand Detection must be run unsandboxed.');
    }

    const EXTENSION_ID = 'xcxMPHand';

    class MPHandExtension {
        constructor() {
            this.handLandmarker = null;
            this.visionTasks = null;
            this.detecting = false;
            this.detectionInterval = null;
            this.intervalTime = 100;
            this.numHands = 4;
            this.modelPath = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
            
            this.hands = { landmarks: [], handednesses: [], worldLandmarks: [] };
            
            this.videoState = 'on';
            this.videoTransparency = 50;
            this.cameraDirection = 'mirrored';

            this._initPromise = this._initMediaPipe();
        }

        async _initMediaPipe() {
            try {
                const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest');
                this.FilesetResolver = vision.FilesetResolver;
                this.HandLandmarker = vision.HandLandmarker;

                this.visionTasks = await this.FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );

                await this._createLandmarker();
            } catch (error) {
                console.error('Failed to initialize MediaPipe:', error);
            }
        }

        async _createLandmarker() {
            if (!this.HandLandmarker || !this.visionTasks) return;
            
            if (this.handLandmarker) {
                this.handLandmarker.close();
            }

            this.handLandmarker = await this.HandLandmarker.createFromOptions(this.visionTasks, {
                baseOptions: {
                    modelAssetPath: this.modelPath,
                    delegate: 'GPU'
                },
                runningMode: 'VIDEO',
                numHands: this.numHands
            });
        }

        getInfo() {
            return {
                id: EXTENSION_ID,
                name: 'Hand Detection',
                color1: '#4a90e2',
                blocks: [
                    {
                        opcode: 'startHandDetection',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'start hand detection on camera'
                    },
                    {
                        opcode: 'stopHandDetection',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'stop hand detection'
                    },
                    {
                        opcode: 'isHandDetecting',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'is hand detecting'
                    },
                    {
                        opcode: 'getDetectionIntervalTime',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'hand detection interval time'
                    },
                    {
                        opcode: 'setDetectionIntervalTime',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set hand detection interval time to [TIME] ms',
                        arguments: {
                            TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 }
                        }
                    },
                    {
                        opcode: 'getNumHands',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'number of hands to detect'
                    },
                    {
                        opcode: 'setNumHands',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set number of hands to detect to [NUM]',
                        arguments: {
                            NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 4 }
                        }
                    },
                    {
                        opcode: 'setVideoTransparency',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set video transparency to [TRANSPARENCY]',
                        arguments: {
                            TRANSPARENCY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 }
                        }
                    },
                    {
                        opcode: 'setCameraDirection',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set camera [DIRECTION]',
                        arguments: {
                            DIRECTION: { type: Scratch.ArgumentType.STRING, menu: 'cameraDirectionMenu' }
                        }
                    },
                    "---",
                    {
                        opcode: 'detectHandOnStage',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'detect hand on stage'
                    },
                    {
                        opcode: 'detectHandInCostume',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'detect hand in costume [COSTUME]',
                        arguments: {
                            COSTUME: { type: Scratch.ArgumentType.STRING, defaultValue: 'costume1' }
                        }
                    },
                    "---",
                    {
                        opcode: 'numberOfHands',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'number of hands'
                    },
                    {
                        opcode: 'handedness',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'handedness of hand #[HAND_NUMBER]',
                        arguments: {
                            HAND_NUMBER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
                        }
                    },
                    {
                        opcode: 'handLandmarkX',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'x of [LANDMARK] of hand #[HAND_NUMBER]',
                        arguments: {
                            HAND_NUMBER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            LANDMARK: { type: Scratch.ArgumentType.STRING, menu: 'LANDMARK' }
                        }
                    },
                    {
                        opcode: 'handLandmarkY',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'y of [LANDMARK] of hand #[HAND_NUMBER]',
                        arguments: {
                            HAND_NUMBER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            LANDMARK: { type: Scratch.ArgumentType.STRING, menu: 'LANDMARK' }
                        }
                    },
                    {
                        opcode: 'handLandmarkZ',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'z of [LANDMARK] of hand #[HAND_NUMBER]',
                        arguments: {
                            HAND_NUMBER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            LANDMARK: { type: Scratch.ArgumentType.STRING, menu: 'LANDMARK' }
                        }
                    },
                    "---",
                    {
                        opcode: 'handLandmarkRelativeX',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'relative x of [LANDMARK] of hand #[HAND_NUMBER]',
                        arguments: {
                            HAND_NUMBER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            LANDMARK: { type: Scratch.ArgumentType.STRING, menu: 'LANDMARK' }
                        }
                    },
                    {
                        opcode: 'handLandmarkRelativeY',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'relative y of [LANDMARK] of hand #[HAND_NUMBER]',
                        arguments: {
                            HAND_NUMBER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            LANDMARK: { type: Scratch.ArgumentType.STRING, menu: 'LANDMARK' }
                        }
                    },
                    {
                        opcode: 'handLandmarkRelativeZ',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'relative z of [LANDMARK] of hand #[HAND_NUMBER]',
                        arguments: {
                            HAND_NUMBER: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            LANDMARK: { type: Scratch.ArgumentType.STRING, menu: 'LANDMARK' }
                        }
                    },
                    "---",
                    {
                        opcode: 'setModelPath',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set model path to [PATH]',
                        arguments: {
                            PATH: { type: Scratch.ArgumentType.STRING, defaultValue: this.modelPath }
                        }
                    },
                    {
                        opcode: 'getModelPath',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'get model path'
                    }
                ],
                menus: {
                    LANDMARK: {
                        acceptReporters: true,
                        items: [
                            { text: 'wrist(0)', value: '0' },
                            { text: 'thumb CMC(1)', value: '1' },
                            { text: 'thumb MCP(2)', value: '2' },
                            { text: 'thumb IP(3)', value: '3' },
                            { text: 'thumb tip(4)', value: '4' },
                            { text: 'index finger MCP(5)', value: '5' },
                            { text: 'index finger PIP(6)', value: '6' },
                            { text: 'index finger DIP(7)', value: '7' },
                            { text: 'index finger tip(8)', value: '8' },
                            { text: 'middle finger MCP(9)', value: '9' },
                            { text: 'middle finger PIP(10)', value: '10' },
                            { text: 'middle finger DIP(11)', value: '11' },
                            { text: 'middle finger tip(12)', value: '12' },
                            { text: 'ring finger MCP(13)', value: '13' },
                            { text: 'ring finger PIP(14)', value: '14' },
                            { text: 'ring finger DIP(15)', value: '15' },
                            { text: 'ring finger tip(16)', value: '16' },
                            { text: 'pinky finger MCP(17)', value: '17' },
                            { text: 'pinky finger PIP(18)', value: '18' },
                            { text: 'pinky finger DIP(19)', value: '19' },
                            { text: 'pinky finger tip(20)', value: '20' }
                        ]
                    },
                    cameraDirectionMenu: {
                        acceptReporters: false,
                        items: [
                            { text: 'mirrored', value: 'mirrored' },
                            { text: 'flipped', value: 'flipped' }
                        ]
                    }
                }
            };
        }

        async startHandDetection() {
            await this._initPromise;
            if (this.detecting) return;

            // Turn on video
            Scratch.vm.runtime.ioDevices.video.enableVideo();
            Scratch.vm.runtime.ioDevices.video.mirror = (this.cameraDirection === 'mirrored');
            
            this.detecting = true;
            this._runDetectionLoop();
        }

        stopHandDetection() {
            this.detecting = false;
            if (this.detectionInterval) {
                clearTimeout(this.detectionInterval);
                this.detectionInterval = null;
            }
        }

        isHandDetecting() {
            return this.detecting;
        }

        getDetectionIntervalTime() {
            return this.intervalTime;
        }

        setDetectionIntervalTime(args) {
            this.intervalTime = Math.max(0, Scratch.Cast.toNumber(args.TIME));
        }

        getNumHands() {
            return this.numHands;
        }

        async setNumHands(args) {
            const num = Math.max(1, Scratch.Cast.toNumber(args.NUM));
            this.numHands = num;
            await this._createLandmarker();
        }

        setVideoTransparency(args) {
            this.videoTransparency = Scratch.Cast.toNumber(args.TRANSPARENCY);
            Scratch.vm.runtime.ioDevices.video.setPreviewGhost(this.videoTransparency);
        }

        setCameraDirection(args) {
            this.cameraDirection = args.DIRECTION;
            Scratch.vm.runtime.ioDevices.video.mirror = (this.cameraDirection === 'mirrored');
        }

        async detectHandOnStage() {
            await this._initPromise;
            return new Promise((resolve) => {
                Scratch.vm.renderer.requestSnapshot(async (dataURI) => {
                    const img = new Image();
                    img.onload = () => {
                        this._detectFromImage(img);
                        resolve();
                    };
                    img.src = dataURI;
                });
            });
        }

        async detectHandInCostume(args, util) {
            await this._initPromise;
            const target = util.target;
            const costumeName = Scratch.Cast.toString(args.COSTUME);
            const costume = target.getCostumes().find(c => c.name === costumeName) || target.getCostumes()[0];
            
            if (!costume) return;
            
            const dataURI = costume.asset.encodeDataURI();
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this._detectFromImage(img);
                    resolve();
                };
                img.src = dataURI;
            });
        }

        _detectFromImage(imgElement) {
            if (!this.handLandmarker) return;
            
            // For static images, switch to IMAGE mode temporarily if needed, 
            // but MediaPipe recommends strictly setting mode beforehand.
            // Using VIDEO mode with timestamp usually works if we provide a synthetic timestamp.
            const result = this.handLandmarker.detectForVideo(imgElement, performance.now());
            if (result) {
                this.hands = result;
            }
        }

        async _runDetectionLoop() {
            if (!this.detecting || !this.handLandmarker) return;

            const videoProvider = Scratch.vm.runtime.ioDevices.video.provider;
            if (videoProvider && videoProvider.video && videoProvider.video.readyState >= 2) {
                const result = this.handLandmarker.detectForVideo(videoProvider.video, performance.now());
                if (result) {
                    this.hands = result;
                }
            }

            this.detectionInterval = setTimeout(() => {
                this._runDetectionLoop();
            }, this.intervalTime);
        }

        numberOfHands() {
            if (!this.hands || !this.hands.handednesses) return 0;
            return this.hands.handednesses.length;
        }

        handedness(args) {
            const index = Scratch.Cast.toNumber(args.HAND_NUMBER) - 1;
            if (!this.hands || !this.hands.handednesses || index < 0 || index >= this.hands.handednesses.length) {
                return '';
            }
            return this.hands.handednesses[index][0].categoryName;
        }

        _getLandmark(handIndex, landmarkIndex) {
            if (!this.hands || !this.hands.landmarks) return null;
            const hand = this.hands.landmarks[handIndex];
            if (!hand) return null;
            return hand[landmarkIndex] || null;
        }

        _getWorldLandmark(handIndex, landmarkIndex) {
            if (!this.hands || !this.hands.worldLandmarks) return null;
            const hand = this.hands.worldLandmarks[handIndex];
            if (!hand) return null;
            return hand[landmarkIndex] || null;
        }

        handLandmarkX(args) {
            const handIndex = Scratch.Cast.toNumber(args.HAND_NUMBER) - 1;
            const landmarkIndex = Scratch.Cast.toNumber(args.LANDMARK);
            const lm = this._getLandmark(handIndex, landmarkIndex);
            if (!lm) return 0;
            // Convert normalized [0, 1] to Scratch coordinates [-240, 240]
            let x = (lm.x - 0.5) * 480;
            if (this.cameraDirection === 'mirrored') {
                x = -x;
            }
            return x;
        }

        handLandmarkY(args) {
            const handIndex = Scratch.Cast.toNumber(args.HAND_NUMBER) - 1;
            const landmarkIndex = Scratch.Cast.toNumber(args.LANDMARK);
            const lm = this._getLandmark(handIndex, landmarkIndex);
            if (!lm) return 0;
            // Convert normalized [0, 1] to Scratch coordinates [-180, 180], inverted Y
            return -(lm.y - 0.5) * 360;
        }

        handLandmarkZ(args) {
            const handIndex = Scratch.Cast.toNumber(args.HAND_NUMBER) - 1;
            const landmarkIndex = Scratch.Cast.toNumber(args.LANDMARK);
            const lm = this._getLandmark(handIndex, landmarkIndex);
            if (!lm) return 0;
            return lm.z * 480; 
        }

        handLandmarkRelativeX(args) {
            const handIndex = Scratch.Cast.toNumber(args.HAND_NUMBER) - 1;
            const landmarkIndex = Scratch.Cast.toNumber(args.LANDMARK);
            const lm = this._getWorldLandmark(handIndex, landmarkIndex);
            if (!lm) return 0;
            return lm.x;
        }

        handLandmarkRelativeY(args) {
            const handIndex = Scratch.Cast.toNumber(args.HAND_NUMBER) - 1;
            const landmarkIndex = Scratch.Cast.toNumber(args.LANDMARK);
            const lm = this._getWorldLandmark(handIndex, landmarkIndex);
            if (!lm) return 0;
            // Invert Y for Scratch standard
            return -lm.y;
        }

        handLandmarkRelativeZ(args) {
            const handIndex = Scratch.Cast.toNumber(args.HAND_NUMBER) - 1;
            const landmarkIndex = Scratch.Cast.toNumber(args.LANDMARK);
            const lm = this._getWorldLandmark(handIndex, landmarkIndex);
            if (!lm) return 0;
            return lm.z;
        }

        async setModelPath(args) {
            const newPath = Scratch.Cast.toString(args.PATH).trim();
            if (newPath && newPath !== this.modelPath) {
                this.modelPath = newPath;
                await this._createLandmarker();
            }
        }

        getModelPath() {
            return this.modelPath;
        }
    }

    Scratch.extensions.register(new MPHandExtension());
})(Scratch);