import { apiCall } from '../api';
import type { AxiosProgressEvent } from 'axios';

export interface DocumentStatus {
  id: string;
  filename?: string;
  file_path?: string;
  status: 'processing' | 'completed' | 'failed';
  uploaded_at?: string;
  created_at?: string;
  file_size?: number;
  processed_chunks?: number;
  total_chunks?: number;
  error_message?: string;
}

export interface DocumentStatusResponse {
  documents: DocumentStatus[];
}

export interface UploadProgressCallback {
  (progressEvent: AxiosProgressEvent): void;
}

export const documentActions = {
  uploadDocument: async (file: File, onProgress?: UploadProgressCallback) => {
    const formData = new FormData();
    formData.append('file', file);

    return apiCall({
      url: '/upload/document',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    });
  },

  getDocumentStatus: async () => {
    return apiCall<DocumentStatusResponse>({
      url: '/upload/documents/status',
      method: 'GET',
    });
  },
}; 