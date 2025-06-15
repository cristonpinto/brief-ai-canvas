
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload as UploadIcon, 
  FileText, 
  Trash2, 
  CheckCircle, 
  Clock,
  Image,
  Github,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDocuments } from "@/hooks/useDocuments";

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const { 
    documents, 
    isLoading, 
    uploadDocument, 
    deleteDocument, 
    isUploading 
  } = useDocuments();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      uploadDocument(file);
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Uploading</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Documents</h1>
          <p className="text-gray-600">Upload your documents to start generating AI-powered briefs and insights.</p>
        </div>

        {/* Upload Zone */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add New Documents</CardTitle>
            <CardDescription>
              Drag and drop files or click to browse. Supports PDF, DOCX, TXT, and CSV files.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              ) : (
                <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isUploading ? "Uploading..." : "Drop files here or click to upload"}
              </h3>
              <p className="text-gray-600 mb-4">
                Upload PDF, DOCX, TXT, or CSV files up to 10MB each
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.csv"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label htmlFor="file-upload">
                <Button asChild disabled={isUploading}>
                  <span className="cursor-pointer">Browse Files</span>
                </Button>
              </label>
            </div>

            {/* Integration Options */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Or import from:</p>
              <div className="flex space-x-4">
                <Button variant="outline" className="flex items-center" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Notion
                </Button>
                <Button variant="outline" className="flex items-center" disabled>
                  <Image className="h-4 w-4 mr-2" />
                  Google Drive
                </Button>
                <Button variant="outline" className="flex items-center" disabled>
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>Manage your uploaded documents and their processing status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">Loading documents...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(document.status)}
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{document.filename}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">{formatFileSize(document.file_size)}</span>
                          <span className="text-sm text-gray-500">Uploaded {formatDate(document.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(document.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(document.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {documents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No files uploaded yet. Upload your first document to get started!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
