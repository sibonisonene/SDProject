import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import * as faceapi from '../face-api.min.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7bqbBYF6vswJWTLG9TZP4du5fWwknP5g",
  authDomain: "auth-development-e8593.firebaseapp.com",
  projectId: "auth-development-e8593",
  storageBucket: "auth-development-e8593.appspot.com",
  messagingSenderId: "609545899114",
  appId: "1:609545899114:web:b69ddea4f37095ddc88e13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const FaceRecognition = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState([]);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    };

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
          videoRef.current.srcObject = stream;
        })
        .catch(err => console.error(err));
    };

    const loadImages = async () => {
      const imageListRef = ref(storage, 'images/');
      const imageList = await listAll(imageListRef);
      const labeledFaceDescriptorsPromises = imageList.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);
        const img = await faceapi.fetchImage(url);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        return new faceapi.LabeledFaceDescriptors(metadata.name, [detections.descriptor]);
      });
      return Promise.all(labeledFaceDescriptorsPromises);
    };

    const init = async () => {
      await loadModels();
      startVideo();
      const labeledDescriptors = await loadImages();
      setLabeledFaceDescriptors(labeledDescriptors);
    };

    init();
  }, []);

  useEffect(() => {
    const handlePlay = async () => {
      if (videoRef.current && labeledFaceDescriptors.length > 0) {
        const canvas = faceapi.createCanvasFromMedia(videoRef.current);
        canvasRef.current.append(canvas);
        const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
        faceapi.matchDimensions(canvas, displaySize);

        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

        setInterval(async () => {
          const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

          const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
          results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
            drawBox.draw(canvas);
          });
        }, 100);
      }
    };

    videoRef.current.addEventListener('play', handlePlay);
    return () => {
      videoRef.current && videoRef.current.removeEventListener('play', handlePlay);
    };
  }, [labeledFaceDescriptors]);

  return (
    <div>
      <video ref={videoRef} width="720" height="560" autoPlay muted />
      <div ref={canvasRef}></div>
    </div>
  );
};

export default FaceRecognition;