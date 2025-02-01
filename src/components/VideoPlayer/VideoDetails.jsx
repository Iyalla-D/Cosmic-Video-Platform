
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VideoDetails.css';

const VideoDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [videoDetails, setVideoDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [relatedVideos, setRelatedVideos] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detailsResponse, videosResponse] = await Promise.all([
                    axios.get(`http://0.0.0.0:5000/videos/${id}`),
                    axios.get('http://0.0.0.0:5000/videos')
                ]);
                
                setVideoDetails(detailsResponse.data);
                setRelatedVideos(videosResponse.data.filter(v => v.id !== id));
                setLoading(false);
            } catch (err) {
                setError('Failed to load video');
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleVideoError = () => {
        setError('Failed to load video stream');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading video...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>{error}</h2>
                <button onClick={() => navigate('/')} className="back-button">
                    Return to Main Page
                </button>
            </div>
        );
    }

    return (
        <div className="video-page">
            <div className="video-container">
                <video 
                    controls 
                    className="video-player"
                    onError={handleVideoError}
                >
                    <source 
                        src={`http://0.0.0.0:5000/stream/${id}`} 
                        type="video/mp4" 
                    />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="video-info">
                <h1 className="video-title">{videoDetails.title}</h1>
                
                {videoDetails.uploadDate && (
                    <p className="upload-date">
                        Uploaded on: {new Date(videoDetails.uploadDate).toLocaleDateString()}
                    </p>
                )}

                {videoDetails.description && (
                    <p className="video-description">{videoDetails.description}</p>
                )}

                {videoDetails.tags?.length > 0 && (
                    <div className="tags-container">
                        {videoDetails.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                        ))}
                    </div>
                )}
            </div>

            {relatedVideos.length > 0 && (
                <div className="related-videos">
                    <h2>Related Content</h2>
                    <div className="related-grid">
                        {relatedVideos.map(video => (
                            <div 
                                key={video.id} 
                                className="related-video-card"
                                onClick={() => navigate(`/video/${video.id}`)}
                            >
                                <video muted className="thumbnail">
                                    <source 
                                        src={`http://0.0.0.0:5000/stream/${video.id}`} 
                                        type="video/mp4" 
                                    />
                                </video>
                                <h3>{video.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoDetails;
