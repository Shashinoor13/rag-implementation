import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  Database
} from 'lucide-react';
import { documentActions } from '../../actions';
import type { DocumentStatus } from '../../actions';

export function DocumentManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDocumentStatus();
  }, []);

  const fetchDocumentStatus = async () => {
    try {
      const response = await documentActions.getDocumentStatus();
      setDocuments(response.data.documents);
    } catch (err) {
      console.error('Failed to fetch document status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    setSuccess('');

    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.txt')) {
        setError('Only .txt files are supported.');
        continue;
      }

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        await documentActions.uploadDocument(file, (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        });

        setSuccess(`Successfully uploaded ${file.name}`);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        setTimeout(() => {
          fetchDocumentStatus();
        }, 1000);
      } catch (err: any) {
        setError(`Failed to upload ${file.name}: ${err.response?.data?.msg || 'Upload failed'}`);
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileName = (doc: DocumentStatus) => {
    return doc.filename || doc.file_path?.split('/').pop() || 'Unknown file';
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <div className="  space-y-8">
        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Documents</h3>
          </div>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">Drop your .txt files here or click to browse</p>
            <p className="text-sm text-gray-500 mb-4 dark:text-gray-500">Only .txt files are supported. Max size: 10MB</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Choose Files'}
            </button>
          </div>

          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([filename, progress]) => (
                <div key={filename} className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 truncate">{filename}</span>
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{progress}%</span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
            </div>
          )}
        </div>

        {/* Document Status */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Status</h3>
            </div>
            <button
              onClick={fetchDocumentStatus}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{getFileName(doc)}</h4>
                      <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(doc.created_at)}</span>
                        {doc.file_size && <span>{formatFileSize(doc.file_size)}</span>}
                        {doc.status === 'processing' && doc.processed_chunks && doc.total_chunks && (
                          <span>{doc.processed_chunks}/{doc.total_chunks} chunks</span>
                        )}
                      </div>
                      {doc.error_message && (
                        <p className="text-xs text-red-500 mt-1">{doc.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.status === 'completed' && (
                      <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
