// VideoUpload.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './VideoUpload.css';

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Create preview URL
    if (selectedFile) {
      const videoPreview = URL.createObjectURL(selectedFile);
      setPreview(videoPreview);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData);
      setMessage({ type: 'success', text: `Upload successful! Video ID: ${response.data.videoId}` });
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setTags('');
      setPreview(null);
    } catch (error) {
      setMessage({ type: 'error', text: `Upload failed: ${error.response?.data?.error || error.message}` });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload New Video to the Collective</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label className="file-input-label">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required
              className="file-input"
            />
            <div className="file-selector">
              {file ? file.name : 'Choose Video File'}
              <span className="browse-button">Browse</span>
            </div>
            {file && (
              <div className="file-info">
                <span>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}
          </label>
        </div>

        {preview && (
          <div className="video-preview">
            <video controls className="preview-player">
              <source src={preview} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <div className="form-group">
          <label>
            Video Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-input"
              placeholder="Enter video title"
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-input"
              placeholder="Describe your video"
              rows="4"
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Tags
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="text-input"
              placeholder="Comma-separated tags (e.g., nature, technology)"
            />
          </label>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Uploading...
            </>
          ) : (
            'Publish to Collective'
          )}
        </button>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
};

export default VideoUpload;