
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
  Github
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: "Meeting Notes.pdf", type: "pdf", size: "2.1 MB", status: "completed", progress: 100 },
    { id: 2, name: "Project Plan.docx", type: "docx", size: "1.8 MB", status: "processing", progress: 65 },
  ]);
  const { toast } = useToast();

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
      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.name.split('.').pop() || 'unknown',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        status: "uploading" as const,
        progress: 0
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { ...f, progress: Math.min(f.progress + 10, 100) }
              : f
          )
        );
      }, 200);

      // Complete upload after progress reaches 100%
      setTimeout(() => {
        clearInterval(interval);
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { ...f, status: "completed" as const, progress: 100 }
              : f
          )
        );
        toast({
          title: "Upload completed",
          description: `${file.name} has been successfully uploaded and processed.`,
        });
      }, 2000);
    });
  };

  const deleteFile = (id: number) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    toast({
      title: "File deleted",
      description: "The file has been removed from your uploads.",
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
              <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to upload
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
              />
              <label htmlFor="file-upload">
                <Button asChild>
                  <span className="cursor-pointer">Browse Files</span>
                </Button>
              </label>
            </div>

            {/* Integration Options */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Or import from:</p>
              <div className="flex space-x-4">
                <Button variant="outline" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Notion
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Image className="h-4 w-4 mr-2" />
                  Google Drive
                </Button>
                <Button variant="outline" className="flex items-center">
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
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">{file.size}</span>
                        {file.status === "uploading" && (
                          <div className="flex items-center space-x-2 flex-1">
                            <Progress value={file.progress} className="w-24" />
                            <span className="text-sm text-gray-500">{file.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(file.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile(file.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {uploadedFiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No files uploaded yet. Upload your first document to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
