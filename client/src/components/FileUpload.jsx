import { useState } from 'react';
import Button from './Button';

export default function FileUpload({
  label = 'Upload File',
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 5,
  onUploaded,
}) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setError('');
    setSuccess('');
    const f = e.target.files[0];
    if (!f) return;

    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be smaller than ${maxSizeMB} MB`);
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return setError('Please choose a file first');

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { uploadService } = await import('../services/uploadService');
      const data = await uploadService.uploadResume(file);
      setSuccess('Uploaded successfully');
      onUploaded?.(data.file);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium hover:file:bg-blue-100"
        />
        <Button onClick={handleUpload} loading={loading} disabled={!file}>
          Upload
        </Button>
      </div>

      <p className="text-xs text-slate-400 mt-1">
        Allowed: PDF, DOC, DOCX · Max {maxSizeMB} MB
      </p>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {success && <p className="text-xs text-green-600 mt-1">{success}</p>}
    </div>
  );
}