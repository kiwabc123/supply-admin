import { useState } from 'react';

export default function UploadImages() {
  const [productId, setProductId] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [altTexts, setAltTexts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setAltTexts(new Array(selectedFiles.length).fill(''));
  };

  const handleAltTextChange = (index: number, value: string) => {
    const newAltTexts = [...altTexts];
    newAltTexts[index] = value;
    setAltTexts(newAltTexts);
  };

  const handleUpload = async () => {
    if (!productId) {
      setMessage('Please enter Product ID');
      setMessageType('error');
      return;
    }

    if (files.length === 0) {
      setMessage('Please select at least one image');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('Uploading...');
    setMessageType('success');

    try {
      const formData = new FormData();

      // Add all files
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Add alt texts as JSON array
      formData.append('altTexts', JSON.stringify(altTexts));

      // Add display orders
      const displayOrders = files.map((_, i) => i);
      formData.append('displayOrders', JSON.stringify(displayOrders));

      // All active by default
      const isActiveList = files.map(() => true);
      formData.append('isActiveList', JSON.stringify(isActiveList));

      const response = await fetch(`/api/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Successfully uploaded ${files.length} image(s)!`);
        setMessageType('success');
        setFiles([]);
        setAltTexts([]);
        document.getElementById('fileInput')?.removeEventListener('change', () => {});
      } else {
        setMessage(`❌ Error: ${data.error}`);
        setMessageType('error');
      }
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>🖼️ Bulk Image Upload</h1>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          <strong>Product ID:</strong>
        </label>
        <input
          type="text"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Enter product UUID"
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <strong>Select Multiple Images:</strong>
        </label>
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          style={{
            padding: '10px',
            border: '2px dashed #007bff',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'block',
            width: '100%',
          }}
        />
        <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
          Select 1 or more images. Supported: JPG, PNG, WebP, GIF
        </small>
      </div>

      {files.length > 0 && (
        <div style={{ marginBottom: '20px', backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
          <h3>Selected Files ({files.length}):</h3>
          {files.map((file, index) => (
            <div
              key={index}
              style={{
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <strong>{index + 1}. {file.name}</strong>
                <span style={{ color: '#666', marginLeft: '10px' }}>
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <input
                type="text"
                placeholder="Alt text (optional)"
                value={altTexts[index] || ''}
                onChange={(e) => handleAltTextChange(index, e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                }}
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || files.length === 0 || !productId}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '⏳ Uploading...' : `📤 Upload ${files.length} Image${files.length !== 1 ? 's' : ''}`}
      </button>

      {message && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
            color: messageType === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
