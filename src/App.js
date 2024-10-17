import React, { useCallback, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as facemesh from '@mediapipe/face_mesh';
// import * as tf from '@tensorflow/tfjs';

const EmotionDetection = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);

  const loadFaceMesh = useCallback(async () => {
    const drawLandmarks = (ctx, landmarks) => {
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;

      for (let i = 0; i < landmarks.length; i++) {
        const x = landmarks[i].x * canvasRef.current.width;
        const y = landmarks[i].y * canvasRef.current.height;

        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();
      }

      for (let i = 0; i < landmarks.length - 1; i++) {
        const x1 = landmarks[i].x * canvasRef.current.width;
        const y1 = landmarks[i].y * canvasRef.current.height;
        const x2 = landmarks[i + 1].x * canvasRef.current.width;
        const y2 = landmarks[i + 1].y * canvasRef.current.height;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };
    const faceMesh = new facemesh.FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    const onResults = (results) => {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        drawLandmarks(canvasCtx, landmarks);
      }
    };
    faceMesh.onResults(onResults);
    faceMeshRef.current = faceMesh;

    if (webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      setInterval(() => {
        faceMeshRef.current.send({ image: video });
      }, 100);
    }
  }, [])
  useEffect(() => {
    loadFaceMesh();
  }, [loadFaceMesh]);



  return (
    <div>
      <Webcam
        ref={webcamRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
};

export default EmotionDetection;