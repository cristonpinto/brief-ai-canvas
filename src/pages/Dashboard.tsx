
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, MessageSquare, FileText, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  const recentUploads = [
    { name: "Q4 Planning.pdf", status: "processed", uploadDate: "2024-01-15", size: "2.1 MB" },
    { name: "Team Meeting Notes.docx", status: "processing", uploadDate: "2024-01-15", size: "1.3 MB" },
    { name: "Product Roadmap.pdf", status: "processed", uploadDate: "2024-01-14", size: "3.2 MB" },
  ];

  const recentBriefs = [
    { title: "Q4 Strategic Planning", tags: ["strategy", "planning"], date: "2024-01-15", preview: "Key decisions and action items from quarterly planning session..." },
    { title: "Product Roadmap Review", tags: ["product", "roadmap"], date: "2024-01-14", preview: "Summary of upcoming features and timeline adjustments..." },
    { title: "Team Retrospective", tags: ["team", "retro"], date: "2024-01-13", preview: "Action items and improvements identified during team retrospective..." },
  ];

  const getStatusBadge = (status: string) => {
    return status === "processed" ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Processed</Badge>
    ) : (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing</Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John! 👋</h1>
          <p className="text-gray-600">Here's what's happening with your documents and briefs today.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link to="/upload">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Documents</h3>
                  <p className="text-sm text-gray-600">Add new files to analyze</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/ask-ai">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ask AI</h3>
                  <p className="text-sm text-gray-600">Query your documents</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Uploads */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>Your latest document uploads</CardDescription>
              </div>
              <Link to="/upload">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUploads.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{doc.uploadDate}</span>
                          <span>•</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Briefs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Briefs</CardTitle>
                <CardDescription>Your generated summaries and briefs</CardDescription>
              </div>
              <Link to="/brief-generator">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBriefs.map((brief, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{brief.title}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {brief.date}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{brief.preview}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {brief.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
