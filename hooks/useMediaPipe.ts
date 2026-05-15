"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface HandData {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  z: number; // depth estimate -1 to 1
  pinchDistance: number; // 0-1
  isPinching: boolean;
  isOpenPalm: boolean;
  isTracking: boolean;
}

const DEFAULT_HAND: HandData = {
  x: 0.5,
  y: 0.5,
  z: 0,
  pinchDistance: 1,
  isPinching: false,
  isOpenPalm: false,
  isTracking: false,
};

export type MediaPipeStatus =
  | "idle"
  | "loading"
  | "requesting_permission"
  | "active"
  | "denied"
  | "error";

export function useMediaPipe() {
  const [status, setStatus] = useState<MediaPipeStatus>("idle");
  const [handData, setHandData] = useState<HandData>(DEFAULT_HAND);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<unknown>(null);
  const cameraRef = useRef<unknown>(null);
  const animFrameRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);

  const getDistance = (
    a: { x: number; y: number; z: number },
    b: { x: number; y: number; z: number }
  ) => {
    return Math.sqrt(
      Math.pow(a.x - b.x, 2) +
        Math.pow(a.y - b.y, 2) +
        Math.pow(a.z - b.z, 2)
    );
  };

  const parseHandResults = useCallback((results: unknown) => {
    const r = results as {
      multiHandLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
    };
    if (!r.multiHandLandmarks || r.multiHandLandmarks.length === 0) {
      setHandData((prev) => ({ ...prev, isTracking: false }));
      return;
    }

    const landmarks = r.multiHandLandmarks[0];
    if (!landmarks || landmarks.length < 21) return;

    const wrist = landmarks[0];
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const indexMcp = landmarks[5];

    // Palm center estimate
    const palmX = (wrist.x + indexMcp.x) / 2;
    const palmY = (wrist.y + indexMcp.y) / 2;
    const palmZ = (wrist.z + indexMcp.z) / 2;

    // Pinch = thumb tip close to index tip
    const pinchDist = getDistance(thumbTip, indexTip);
    const normalizedPinch = Math.min(1, Math.max(0, pinchDist * 5));
    const isPinching = pinchDist < 0.05;

    // Open palm = all fingertips extended (y < MCP y in normalized coords)
    const fingertipsClear = [
      indexTip.y < indexMcp.y - 0.05,
      middleTip.y < landmarks[9].y - 0.05,
      ringTip.y < landmarks[13].y - 0.05,
      pinkyTip.y < landmarks[17].y - 0.05,
    ].filter(Boolean).length;
    const isOpenPalm = fingertipsClear >= 3;

    // Depth: wrist.z is negative when hand is closer to camera
    const depth = Math.max(-1, Math.min(1, -wrist.z * 10));

    setHandData({
      x: 1 - palmX, // Mirror horizontally
      y: palmY,
      z: depth,
      pinchDistance: normalizedPinch,
      isPinching,
      isOpenPalm,
      isTracking: true,
    });
  }, []);

  const start = useCallback(async () => {
    if (status === "active" || status === "loading") return;

    setStatus("loading");

    try {
      // Dynamically import MediaPipe
      const { Hands } = await import("@mediapipe/hands");
      const { Camera } = await import("@mediapipe/camera_utils");

      setStatus("requesting_permission");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });

      // Create hidden video element
      if (!videoRef.current) {
        const video = document.createElement("video");
        video.style.cssText =
          "position:fixed;bottom:24px;right:24px;width:160px;height:120px;border-radius:12px;border:2px solid rgba(6,182,212,0.4);box-shadow:0 8px 32px rgba(6,182,212,0.2);z-index:100;transform:scaleX(-1);object-fit:cover;";
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        document.body.appendChild(video);
        videoRef.current = video;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // Fastest model
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults(parseHandResults);
      handsRef.current = hands;

      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (handsRef.current && videoRef.current && isActiveRef.current) {
            await (handsRef.current as { send: (opts: { image: HTMLVideoElement }) => Promise<void> }).send({
              image: videoRef.current,
            });
          }
        },
        width: 320, // Lower res for performance
        height: 240,
      });

      camera.start();
      cameraRef.current = camera;
      isActiveRef.current = true;
      setStatus("active");
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setStatus("denied");
      } else {
        console.warn("MediaPipe init failed:", err);
        setStatus("error");
      }
      setHandData(DEFAULT_HAND);
    }
  }, [status, parseHandResults]);

  const stop = useCallback(() => {
    isActiveRef.current = false;

    if (cameraRef.current) {
      (cameraRef.current as { stop: () => void }).stop();
      cameraRef.current = null;
    }

    if (handsRef.current) {
      (handsRef.current as { close: () => void }).close();
      handsRef.current = null;
    }

    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      videoRef.current.remove();
      videoRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    setStatus("idle");
    setHandData(DEFAULT_HAND);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { status, handData, start, stop };
}
