import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileCheck,
  FileText,
  Github,
  HardDrive,
  Image,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload as UploadIcon,
  Zap,
} from "lucide-react";
import { useState } from "react";

const Upload = () => {
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [processingDocs, setProcessingDocs] = useState<Set<string>>(new Set());

  const { documents, isLoading, uploadDocument, deleteDocument, isUploading } =
    useDocuments();

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

  const handleFiles = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const documentId = await uploadDocument(file);
      if (documentId) {
        processDocument(documentId);
      }
    }
  };

  const processDocument = async (documentId: string) => {
    setProcessingDocs((prev) => new Set(prev).add(documentId));

    try {
      console.log("Starting document processing for:", documentId);

      const { data, error } = await supabase.functions.invoke(
        "process-document",
        {
          body: { documentId },
        }
      );

      console.log("Processing response:", { data, error });

      if (error) {
        console.error("Processing error:", error);
        toast({
          title: "Processing Failed",
          description:
            error.message || "Failed to process document. Please try again.",
          variant: "destructive",
        });
      } else if (data) {
        console.log("Processing successful:", data);
        toast({
          title: "Document Processed! ✨",
          description: `Document has been processed successfully. Created ${
            data.chunks_created || 0
          } chunks.`,
        });

        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the document.",
        variant: "destructive",
      });
    } finally {
      setProcessingDocs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const processAllPending = async () => {
    const pendingDocs = documents.filter((doc) => doc.status === "pending");

    if (pendingDocs.length === 0) {
      toast({
        title: "No Pending Documents",
        description: "All documents are already processed.",
      });
      return;
    }

    toast({
      title: "Processing Started",
      description: `Processing ${pendingDocs.length} pending documents...`,
    });

    for (const doc of pendingDocs) {
      await processDocument(doc.id);
    }
  };

  const getStatusIcon = (status: string, documentId: string) => {
    if (processingDocs.has(documentId)) {
      return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
    }

    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, documentId: string) => {
    if (processingDocs.has(documentId)) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 border">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Processing...
        </Badge>
      );
    }

    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 border">
            <FileCheck className="w-3 h-3 mr-1" />
            Ready for AI
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 border">
            <AlertCircle className="w-3 h-3 mr-1" />
            Uploaded
          </Badge>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalSize = documents.reduce((acc, doc) => acc + doc.file_size, 0);
  const completedDocs = documents.filter(
    (doc) => doc.status === "completed"
  ).length;
  const processingCount =
    documents.filter((doc) => doc.status === "processing").length +
    processingDocs.size;

  const integrationOptions = [
    {
      name: "Notion",
      icon: FileText,
      color: "from-gray-600 to-gray-700",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
      description: "Import from Notion pages",
    },
    {
      name: "Google Drive",
      icon: Image,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      description: "Connect Google Drive",
    },
    {
      name: "GitHub",
      icon: Github,
      color: "from-gray-800 to-black",
      bgColor: "bg-gray-50",
      textColor: "text-gray-800",
      description: "Import repositories",
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <div className="p-8">
          {/* Modern Header */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent mb-3">
                    Upload Documents 📄
                  </h1>
                  <p className="text-lg text-gray-600 font-medium mb-4">
                    Transform your documents into AI-powered insights
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600">
                        {documents.length} documents
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">
                        {completedDocs} processed
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <span className="text-sm text-gray-600">
                        {formatFileSize(totalSize)} total
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-3xl flex items-center justify-center transform -rotate-12 shadow-2xl">
                    <UploadIcon className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
              {documents.filter((doc) => doc.status === "pending").length >
                0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={processAllPending}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Process All Pending Documents
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">
                      {documents.length}
                    </p>
                    <p className="text-sm text-blue-700 font-medium">
                      Total Documents
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {completedDocs}
                    </p>
                    <p className="text-sm text-green-700 font-medium">
                      Ready for AI
                    </p>
                  </div>
                  <Sparkles className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">
                      {processingCount}
                    </p>
                    <p className="text-sm text-yellow-700 font-medium">
                      Processing
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modern Upload Zone */}
          <Card className="mb-8 border-0 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1">
              <div className="bg-white rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <UploadIcon className="h-6 w-6 mr-3 text-purple-500" />
                    Upload New Documents
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Drag and drop files or click to browse. Supports PDF, DOCX,
                    TXT, and CSV files.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                      dragActive
                        ? "border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 scale-105"
                        : "border-gray-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {isUploading ? (
                      <div className="space-y-4">
                        <Loader2 className="h-16 w-16 text-purple-500 mx-auto animate-spin" />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Uploading your files...
                          </h3>
                          <p className="text-gray-600">
                            Please wait while we process your documents
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto">
                          <UploadIcon className="h-10 w-10 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                            Drop files here or click to upload
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Upload PDF, DOCX, TXT, or CSV files up to 10MB each
                          </p>
                        </div>
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
                          <Button
                            asChild
                            disabled={isUploading}
                            size="lg"
                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg"
                          >
                            <span className="cursor-pointer px-8 py-3">
                              <UploadIcon className="h-5 w-5 mr-2" />
                              Choose Files
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Integration Options */}
                  <div className="mt-8">
                    <div className="flex items-center space-x-2 mb-4">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      <p className="font-semibold text-gray-700">
                        Or import from:
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {integrationOptions.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="h-auto p-4 border-2 hover:shadow-lg transition-all duration-300 group"
                          disabled
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <div
                              className={`p-3 rounded-2xl ${option.bgColor} group-hover:scale-110 transition-transform`}
                            >
                              <option.icon
                                className={`h-6 w-6 ${option.textColor}`}
                              />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-gray-900">
                                {option.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {option.description}
                              </p>
                              <Badge
                                variant="secondary"
                                className="mt-2 text-xs"
                              >
                                Coming Soon
                              </Badge>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>

          {/* Enhanced Uploaded Files */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <FileText className="h-6 w-6 mr-3 text-blue-500" />
                Document Library
              </CardTitle>
              <CardDescription>
                Manage your uploaded documents and their processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">
                      Loading your documents...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents && documents.length > 0 ? (
                    documents.map((document) => (
                      <div
                        key={document.id}
                        className="group p-6 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-purple-200 transition-all duration-300 bg-gradient-to-r hover:from-purple-50 hover:to-blue-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="absolute -top-1 -right-1">
                                {getStatusIcon(document.status, document.id)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate text-lg group-hover:text-purple-700 transition-colors">
                                {document.filename}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <HardDrive className="h-4 w-4" />
                                  <span>
                                    {formatFileSize(document.file_size)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    Uploaded {formatDate(document.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(document.status, document.id)}
                            {document.status !== "completed" &&
                              !processingDocs.has(document.id) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => processDocument(document.id)}
                                  className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Process
                                </Button>
                              )}
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
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No documents yet
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Upload your first document to get started with
                        AI-powered insights!
                      </p>
                      <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg">
                        <UploadIcon className="h-4 w-4 mr-2" />
                        Upload your first document
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
