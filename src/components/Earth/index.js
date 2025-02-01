import React, { useRef, useEffect, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from 'react-router-dom';
import { vertexShader, createFragmentShader } from './shaders/globeShader';
import { VideoCache } from './utils/videoCache';

// Constants
const INITIAL_CAMERA_POSITION = [0, 0, 8];
const EARTH_RADIUS = 4.1;
const SEGMENT_COUNT = 6;
const SUBSECTIONS_PER_SEGMENT = 5;
const MAX_CACHE_SIZE = 25;
const AUTO_ROTATION_DELAY = 10000; // 10 seconds
const TOTAL_POSITIONS = SEGMENT_COUNT * SUBSECTIONS_PER_SEGMENT;

export default function Earth() {
    // Hooks and State
    const { camera } = useThree();
    const navigate = useNavigate();

    const [videoTextures, setVideoTextures] = useState([]);
    const [quality, setQuality] = useState(1);
    const [isUserInteracting, setIsUserInteracting] = useState(false);

    // Refs
    const earthRef = useRef();
    const controlsRef = useRef();
    const videoElementCache = useRef(new Map());
    const randomizedSegmentsRef = useRef(null);
    const mouseDownSegmentRef = useRef(null);
    const rotationTimeoutRef = useRef(null);
    const isCameraPositionSet = useRef(false);

    // Geometry
    const sphereGeometry = useMemo(() => 
        new THREE.SphereGeometry(EARTH_RADIUS, 64 * quality, 64 * quality),
        [quality]
    );

    // Cache Management
    const manageCache = (newVideoId) => {
        const cache = videoElementCache.current;

        if (cache.has(newVideoId)) {
            cache.get(newVideoId).lastUsed = Date.now();
        }

        if (cache.size >= MAX_CACHE_SIZE) {
            const entries = Array.from(cache.entries());
            const lruEntry = entries.reduce((oldest, current) => 
                current[1].lastUsed < oldest[1].lastUsed ? current : oldest
            );

            const [lruKey, lruValue] = lruEntry;
            lruValue.videoElement.pause();
            lruValue.texture.dispose();
            cache.delete(lruKey);
            console.log(`Evicted video ${lruKey} from cache`);
        }
    };

    const createVideoTexture = (videoId) => {
        const cache = videoElementCache.current;

        if (cache.has(videoId)) {
            const entry = cache.get(videoId);
            entry.lastUsed = Date.now();
            return Promise.resolve(entry);
        }

        return new Promise((resolve, reject) => {
            const videoElement = document.createElement('video');
            videoElement.src = `http://localhost:5000/stream/${videoId}`;
            videoElement.crossOrigin = "anonymous";
            videoElement.playsInline = true;
            videoElement.muted = true;
            videoElement.loop = true;
            videoElement.autoplay = false;
            videoElement.pause();

            videoElement.oncanplay = () => {
                const texture = new THREE.VideoTexture(videoElement);
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.format = THREE.RGBAFormat;

                const videoData = { 
                    texture, 
                    videoElement,
                    lastUsed: Date.now() 
                };

                cache.set(videoId, videoData);
                manageCache(videoId);
                resolve(videoData);
            };

            videoElement.onerror = (e) => {
                console.error(`Error loading video: ${videoElement.src}`, e);
                reject(e);
            };
        });
    };

    // Interaction Handlers
    const handleInteraction = {
        start: () => {
            setIsUserInteracting(true);
            clearTimeout(rotationTimeoutRef.current);
        },

        end: () => {
            rotationTimeoutRef.current = setTimeout(() => {
                setIsUserInteracting(false);
            }, AUTO_ROTATION_DELAY);
        }
    };

    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const mouse = useMemo(() => new THREE.Vector2(), []);

    const handleMouseEvent = {
        down: (event) => {
            if (!earthRef.current) return;

            mouse.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(earthRef.current);
            const intersect = intersects[0];

            if (intersect?.uv) {
                const segment = randomizedSegmentsRef.current
                    .find(s => intersect.uv.y > s.minY && intersect.uv.y <= s.maxY);

                mouseDownSegmentRef.current = segment?.id || null;
            }
        },

        up: (event) => {
            if (!earthRef.current || !mouseDownSegmentRef.current) return;

            mouse.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(earthRef.current);
            const intersect = intersects[0];

            if (intersect?.uv) {
                const segment = randomizedSegmentsRef.current
                    .find(s => intersect.uv.y > s.minY && intersect.uv.y <= s.maxY);

                if (segment?.id === mouseDownSegmentRef.current) {
                    const subsectionIndex = Math.floor(intersect.uv.x * SUBSECTIONS_PER_SEGMENT);
                    const subsectionVideo = segment.videos[subsectionIndex];
                    subsectionVideo && navigate(`/video/${subsectionVideo.id}`);
                }
            }

            mouseDownSegmentRef.current = null;
        },

        move: (event) => {
            const tooltip = document.getElementById("tooltip");
            if (!tooltip || !earthRef.current) return;

            mouse.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(earthRef.current);
            const intersect = intersects[0];

            if (intersect?.uv && randomizedSegmentsRef.current) {
                const segment = randomizedSegmentsRef.current
                    .find(s => intersect.uv.y > s.minY && intersect.uv.y <= s.maxY);

                if (segment) {
                    const subsectionIndex = Math.floor(intersect.uv.x * SUBSECTIONS_PER_SEGMENT);
                    const subsectionVideo = segment.videos[subsectionIndex];
                    handleMouseEvent.handleVideoHover(subsectionVideo, tooltip, event);
                    return;
                }
            }

            handleMouseEvent.resetTooltip(tooltip);
        },

        handleVideoHover: (video, tooltip, event) => {
            if (!video) return;

            document.body.style.cursor = "pointer";
            const videoData = videoElementCache.current.get(video.id);

            if (videoData?.videoElement) {
                videoData.videoElement.play().catch(console.error);
                videoElementCache.current.forEach(({ videoElement }, id) => {
                    if (id !== video.id) videoElement.pause();
                });
            }

            tooltip.style.display = "block";
            tooltip.style.left = `${event.clientX}px`;
            tooltip.style.top = `${event.clientY}px`;
            tooltip.innerHTML = `Segment ${video.segmentId} - Part ${video.subsectionIndex + 1}`;
        },

        resetTooltip: (tooltip) => {
            document.body.style.cursor = 'default';
            tooltip.style.display = 'none';
            videoElementCache.current.forEach(({ videoElement }) => videoElement.pause());
        }
    };

    // Effects and Frame Loop
    useEffect(() => {
        let isMounted = true;

        const initializeEarth = async () => {
            try {
                const response = await fetch('http://localhost:5000/videos');
                const videos = await response.json();

                const allPositions = Array.from({ length: TOTAL_POSITIONS }, (_, i) => i);
                const shuffledPositions = shuffleArray(allPositions);

                const textures = await Promise.all(
                    videos.map(video => createVideoTexture(video.id))
                );

                if (!isMounted) return;

                const segments = Array.from({ length: SEGMENT_COUNT }, (_, segmentIdx) => ({
                    id: segmentIdx + 1,
                    minY: 0.1 + segmentIdx * 0.13,
                    maxY: 0.23 + segmentIdx * 0.13,
                    videos: Array.from({ length: SUBSECTIONS_PER_SEGMENT }, () => ({
                        textureIndex: -1 // -1 indicates empty slot
                    }))
                }));

                // Distribute videos randomly
                shuffledPositions.slice(0, videos.length).forEach((position, videoIndex) => {
                    const segmentIndex = Math.floor(position / SUBSECTIONS_PER_SEGMENT);
                    const subsectionIndex = position % SUBSECTIONS_PER_SEGMENT;

                    segments[segmentIndex].videos[subsectionIndex] = {
                        id: videos[videoIndex].id,
                        texture: textures[videoIndex],
                        textureIndex: videoIndex
                    };
                });



                randomizedSegmentsRef.current = segments;
                setVideoTextures(textures);
            } catch (error) {
                console.error("Failed to initialize Earth:", error);
            }
        };

        initializeEarth();
        camera.position.set(...INITIAL_CAMERA_POSITION);
        isCameraPositionSet.current = true;

        // Event Listeners
        const events = {
            mousemove: handleMouseEvent.move,
            mousedown: handleMouseEvent.down,
            mouseup: handleMouseEvent.up
        };

        Object.entries(events).forEach(([event, handler]) => {
            window.addEventListener(event, handler);
        });

        const controls = controlsRef.current;
        controls?.addEventListener('start', handleInteraction.start);
        controls?.addEventListener('end', handleInteraction.end);

        return () => {
            isMounted = false;
            Object.entries(events).forEach(([event, handler]) => {
                window.removeEventListener(event, handler);
            });
            controls?.removeEventListener('start', handleInteraction.start);
            controls?.removeEventListener('end', handleInteraction.end);
        };
    }, [camera]);

    const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useFrame((_, delta) => {
        if (!isUserInteracting && earthRef.current) {
            earthRef.current.rotation.y += 0.0005;
            setQuality(delta > 0.016 ? 0.5 : 1);
        }
    });

    // Shader Material
    const videoMaterial = useMemo(() => {
        if (!randomizedSegmentsRef.current?.length || !videoTextures.length) {
            return new THREE.MeshBasicMaterial({ color: "gray" });
        }

        const uniforms = videoTextures.reduce((acc, { texture }, idx) => ({
            ...acc,
            [`videoTexture${idx}`]: { value: texture }
        }), {});

        return new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader: createFragmentShader(videoTextures, randomizedSegmentsRef.current, SUBSECTIONS_PER_SEGMENT),
            side: THREE.DoubleSide
        });
    }, [videoTextures]);

    return (
        <>
            <ambientLight intensity={2} />
            <pointLight color="#f6f3ea" position={[2, 0, 5]} intensity={50} />
            <Stars radius={300} depth={60} count={10000} factor={7} saturation={0} fade />

            <mesh ref={earthRef}>
                <primitive attach="geometry" object={sphereGeometry} />
                <primitive attach="material" object={videoMaterial} />
                <OrbitControls 
                    ref={controlsRef}
                    enableZoom
                    enablePan
                    enableRotate
                    zoomSpeed={0.6}
                    rotateSpeed={0.4}
                    maxDistance={50}
                    minDistance={10}
                />
            </mesh>
        </>
    );
}