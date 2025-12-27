import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X,  Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

export function UploadModal({ open, onClose }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [folder, setFolder] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get presigned URL
      const urlData: any = await apiClient.getUploadUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        folder: folder || undefined,
      });

      // Step 2: Upload to S3
      await apiClient.uploadToS3(urlData.data.uploadUrl, file);

      // Step 3: Create asset record
      return apiClient.createAsset({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        s3Key: urlData.data.s3Key,
        s3Bucket: urlData.data.s3Bucket,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadMutation.mutateAsync(files[i]);
        setProgress(((i + 1) / files.length) * 100);
      }

      toast.success('Upload successful', {
        description: `${files.length} file(s) uploaded successfully`,
      });

      setFiles([]);
      setFolder('');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload files';
      toast.error('Upload failed', {
        description: errorMessage,
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Assets</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Upload images to your media library
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Folder Input */}
          <div className="space-y-2">
            <Label htmlFor="folder" className="text-zinc-300">
              Folder (optional)
            </Label>
            <Input
              id="folder"
              placeholder="e.g., products, banners"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              disabled={uploading}
              className="bg-zinc-950 border-zinc-800 text-white"
            />
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer"
            onClick={() => !uploading && document.getElementById('file-input')?.click()}
          >
            <Upload className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-300 mb-2">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-zinc-500">Supports: JPG, PNG, GIF, WebP</p>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
              aria-label="Select files to upload"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded bg-zinc-800 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-zinc-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Uploading...</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {files.length > 0 && `(${files.length})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
