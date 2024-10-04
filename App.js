import React, { useState } from 'react';
import Webcam from 'react-webcam';
import './App.css';

const App = () => {
    const [mode, setMode] = useState('testing');
    const [testingImages, setTestingImages] = useState([]);  // Array of images for Testing mode
    const [comparisonImages, setComparisonImages] = useState([]); // Array to store images in Comparison mode
    const [modelFile, setModelFile] = useState(null); // YOLOv8 model file
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const [comparedImage, setComparedImage] = useState(null); // Store the processed image
    const webcamRef = React.useRef(null);

    // Handle taking a picture from the camera
    const handleTakePicture = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (mode === 'testing') {
                setTestingImages((prevImages) => [...prevImages, imageSrc]);
            } else if (mode === 'comparison') {
                setComparisonImages((prevImages) => [...prevImages, imageSrc]);
            }
            setIsWebcamActive(false); // Deactivate webcam after taking a picture
        } else {
            console.error("Webcam not ready");
        }
    };

    // Handle uploading the YOLOv8 model
    const handleUploadModel = (event) => {
        const file = event.target.files[0];
        if (file) {
            setModelFile(file);
        }
    };

    // Clear cache and memory of the images in Testing Mode
    const clearTestingImages = () => {
        setTestingImages([]);  // Clear all testing images
    };

    // Clear all comparison images
    const clearComparisonImages = () => {
        setComparisonImages([]); // Clear all images from the comparison mode
    };

    // Placeholder comparison logic using YOLOv8 model
    const handleCompareImages = async () => {
        if (comparisonImages.length > 0 && modelFile) {
            const formData = new FormData();
            formData.append('model', modelFile);  // Upload YOLOv8 model
            comparisonImages.forEach((image, index) => {
                formData.append(`image_${index}`, image);
            });

            try {
                const response = await fetch('http://localhost:5000/compare', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                setComparedImage(data.processed_image); // Set the processed image with differences highlighted
            } catch (error) {
                console.error('Error in comparison:', error);
            }
        } else {
            alert('Please capture images and upload a model for comparison.');
        }
    };

    // Toggle between Testing and Comparison modes
    const toggleMode = () => {
        if (mode === 'testing') {
            // Clear the images from testing when switching to comparison mode
            clearTestingImages();
        }
        setMode((prevMode) => (prevMode === 'testing' ? 'comparison' : 'testing'));
        setIsWebcamActive(false); // Deactivate webcam when switching modes
    };

    // Toggle the webcam on/off
    const toggleWebcam = () => {
        setIsWebcamActive((prev) => !prev);
    };

    return (
        <div className="App">
            <h1>{mode === 'testing' ? 'Testing Mode' : 'Comparison Mode'}</h1>
            <div className="webcam-container">
                {isWebcamActive && (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{
                            facingMode: 'environment', // Use 'user' for front camera
                        }}
                    />
                )}
                <button onClick={toggleWebcam}>
                    {isWebcamActive ? 'Stop Webcam' : 'Open Webcam'}
                </button>
                {isWebcamActive && (
                    <button onClick={handleTakePicture}>
                        Capture Photo
                    </button>
                )}
            </div>

            {mode === 'testing' && (
                <div className="testing-options">
                    <h2>Options:</h2>
                    <button onClick={handleTakePicture} disabled={!isWebcamActive}>
                        Take Picture
                    </button>
                    <input type="file" onChange={handleUploadModel} accept=".pt" />
                    <button onClick={clearTestingImages}>Clear Testing Images</button>
                </div>
            )}

            {mode === 'comparison' && (
                <div className="comparison-options">
                    <h2>Comparison Options:</h2>
                    <p>Upload a YOLOv8 model and use the webcam to capture images for comparison.</p>
                    <input type="file" onChange={handleUploadModel} accept=".pt" />
                    <button onClick={clearComparisonImages}>Clear Images</button>
                    <button onClick={handleCompareImages}>Compare</button>
                </div>
            )}

            {/* Displaying Images in Testing Mode */}
            {mode === 'testing' && testingImages.length > 0 && (
                <div className="captured-image-container">
                    <h2>Captured Images (Testing Mode):</h2>
                    {testingImages.map((imgSrc, index) => (
                        <img key={index} src={imgSrc} alt={`Captured ${index}`} />
                    ))}
                </div>
            )}

            {/* Displaying Images in Comparison Mode */}
            {mode === 'comparison' && comparisonImages.length > 0 && (
                <div className="captured-image-container">
                    <h2>Captured Images (Comparison Mode):</h2>
                    {comparisonImages.map((imgSrc, index) => (
                        <img key={index} src={imgSrc} alt={`Captured ${index}`} />
                    ))}
                </div>
            )}

            {/* Display the compared image with differences highlighted */}
            {comparedImage && (
                <div className="compared-image-container">
                    <h2>Compared Image:</h2>
                    <img src={comparedImage} alt="Compared" />
                </div>
            )}

            <button className="toggle-mode-button" onClick={toggleMode}>
                Switch to {mode === 'testing' ? 'Comparison' : 'Testing'} Mode
            </button>
        </div>
    );
};

export default App;
