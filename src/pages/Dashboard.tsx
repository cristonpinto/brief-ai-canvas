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
import { useBriefs } from "@/hooks/useBriefs";
import { useDocuments } from "@/hooks/useDocuments";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
  Plus,
  Sparkles,
  Timer,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { documents, isLoading } = useDocuments();
  const { briefs, isLoading: isLoadingBriefs } = useBriefs();

  const stats = [
    {
      title: "Total Documents",
      value: documents.length,
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Processed",
      value: documents.filter((doc) => doc.status === "completed").length,
      change: "+8%",
      trend: "up",
      icon: CheckCircle2,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Processing",
      value: documents.filter((doc) => doc.status === "processing").length,
      change: "0%",
      trend: "neutral",
      icon: Timer,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      title: "AI Queries",
      value: "47",
      change: "+23%",
      trend: "up",
      icon: Brain,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  const quickActions = [
    {
      title: "Upload Documents",
      description: "Drag & drop or browse files",
      icon: Upload,
      path: "/upload",
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      emoji: "📄",
    },
    {
      title: "Ask AI",
      description: "Query your documents instantly",
      icon: MessageSquare,
      path: "/ask-ai",
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      emoji: "🤖",
    },
    {
      title: "Generate Brief",
      description: "Create intelligent summaries",
      icon: Sparkles,
      path: "/brief-generator",
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      emoji: "✨",
    },
    {
      title: "Analytics",
      description: "View usage insights",
      icon: BarChart3,
      path: "/analytics",
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      emoji: "📊",
    },
  ];

  const getStatusBadge = (status: string) => {
    const badgeStyles = {
      completed: "bg-green-100 text-green-700 border-green-200",
      processing: "bg-yellow-100 text-yellow-700 border-yellow-200",
      failed: "bg-red-100 text-red-700 border-red-200",
    };

    return (
      <Badge
        className={`${
          badgeStyles[status as keyof typeof badgeStyles] ||
          badgeStyles.processing
        } border`}
      >
        {status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
        {status === "processing" && <Timer className="w-3 h-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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

  const completionRate =
    documents.length > 0
      ? (documents.filter((doc) => doc.status === "completed").length /
          documents.length) *
        100
      : 0;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="p-8">
          {/* Modern Header with Gradient */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-3">
                    Welcome back! 👋
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Transform your documents into actionable insights with AI
                  </p>
                  <div className="flex items-center mt-4 space-x-6">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">
                        All systems operational
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">AI ready</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center transform rotate-12 shadow-2xl">
                    <Zap className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-purple-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path} className="group">
                  <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                    ></div>
                    <CardContent className="relative p-6 text-center">
                      <div
                        className={`w-16 h-16 mx-auto mb-4 ${action.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <span className="text-2xl">{action.emoji}</span>
                      </div>
                      <h3
                        className={`font-bold text-lg mb-2 ${action.textColor} group-hover:text-gray-900 transition-colors`}
                      >
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {action.description}
                      </p>
                      <div className="flex items-center justify-center text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                        <span>Get started</span>
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Create New Brief Templates */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-500" />
              Create New Brief
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/brief-generator?type=q4-strategic" className="group">
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <CardContent className="relative p-6">
                    <div className="w-12 h-12 mb-4 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-blue-600 group-hover:text-blue-700 transition-colors">
                      Q4 Strategic Planning
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Quarterly planning session with strategic goals, budget
                      allocation, and team expansion plans.
                    </p>
                    <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Create Brief</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link
                to="/brief-generator?type=product-roadmap"
                className="group"
              >
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <CardContent className="relative p-6">
                    <div className="w-12 h-12 mb-4 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-purple-600 group-hover:text-purple-700 transition-colors">
                      Product Roadmap Review
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Feature prioritization, timeline adjustments, and product
                      development strategy review.
                    </p>
                    <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-purple-600 transition-colors">
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Create Brief</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/brief-generator?type=custom" className="group">
                <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <CardContent className="relative p-6">
                    <div className="w-12 h-12 mb-4 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-green-600 group-hover:text-green-700 transition-colors">
                      Custom Brief
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Start with a blank brief and customize it with your own
                      sections and content.
                    </p>
                    <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-green-600 transition-colors">
                      <Plus className="h-4 w-4 mr-1" />
                      <span>Create Brief</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Enhanced Recent Uploads */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="flex items-center text-xl">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Recent Uploads
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Your latest document uploads
                  </CardDescription>
                </div>
                <Link to="/upload">
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-10 w-10 text-blue-500" />
                    </div>
                    <p className="text-gray-500 mb-4 font-medium">
                      No documents uploaded yet
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                      Start by uploading your first document
                    </p>
                    <Link to="/upload">
                      <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload your first document
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.slice(0, 3).map((doc) => (
                      <div
                        key={doc.id}
                        className="group p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-blue-200 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {doc.filename}
                              </p>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(doc.created_at)}</span>
                                </div>
                                <span>•</span>
                                <span>{formatFileSize(doc.file_size)}</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(doc.status)}
                        </div>
                      </div>
                    ))}
                    {documents.length > 3 && (
                      <div className="text-center pt-4">
                        <Link to="/upload">
                          <Button
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            View all {documents.length} documents →
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Recent Briefs */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="flex items-center text-xl">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                    Saved Briefs
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Your AI-generated briefs
                  </CardDescription>
                </div>
                <Link to="/brief-generator">
                  <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    New Brief
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoadingBriefs ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : briefs.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No briefs yet. Create your first brief!
                    </p>
                    <Link to="/brief-generator">
                      <Button variant="outline" className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Brief
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {briefs.slice(0, 3).map((brief) => (
                      <div
                        key={brief.id}
                        className="group p-4 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-purple-200 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                              <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {brief.title}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Badge variant="secondary" className="text-xs">
                                  {brief.brief_type}
                                </Badge>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(brief.created_at)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 ml-13">
                          {brief.content[0]?.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                    {briefs.length > 3 && (
                      <div className="text-center pt-4">
                        <Button
                          variant="ghost"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          View all {briefs.length} briefs →
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
