/**
 * Upload API service
 */

import { apiUpload } from "../client";

export const uploadService = {
  /** POST /upload — upload file via multipart form */
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUpload("/upload", formData);
  },
};
