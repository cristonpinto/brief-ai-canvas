
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Send, 
  FileText, 
  User, 
  Bot, 
  Lightbulb, 
  ListTodo, 
  FileOutput,
  HelpCircle
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDocuments } from "@/hooks/useDocuments";

interface ChatMessage {
  type: "user" | "assistant";
  message: string;
  timestamp: string;
  references?: string[];
}

const AskAI = () => {
  const { documents, isLoading: documentsLoading } = useDocuments();
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatMessage[]>([]);

  const quickPrompts = [
    { icon: FileOutput, text: "Summarize key points", prompt: "Summarize the key points from the selected documents" },
    { icon: ListTodo, text: "Extract action items", prompt: "Extract all action items and tasks from the selected documents" },
    { icon: Lightbulb, text: "Highlight insights", prompt: "Highlight the most important insights and recommendations" },
  ];

  const handleDocToggle = (docId: string) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim() || selectedDocs.length === 0) return;

    const userMessage: ChatMessage = {
      type: "user",
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setConversations(prev => [...prev, userMessage]);
    setIsLoading(true);
    setMessage("");

    // TODO: Replace with actual AI API call
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        type: "assistant",
        message: "I understand you're asking about the selected documents. This feature will be implemented with AI processing to analyze your documents and provide intelligent responses based on their content.",
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        references: selectedDocs.slice(0, 2).map(id => {
          const doc = documents.find(d => d.id === id);
          return doc ? `${doc.filename} - Page 1` : 'Document';
        })
      };
      setConversations(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="flex h-full">
        {/* Document Selector Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Documents</h2>
            <p className="text-sm text-gray-600">Choose which documents to query</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {documentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No documents uploaded</p>
                <p className="text-sm text-gray-400">Upload documents first to start asking questions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDocs.includes(doc.id) 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleDocToggle(doc.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        checked={selectedDocs.includes(doc.id)}
                        onChange={() => handleDocToggle(doc.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <p className="font-medium text-gray-900 truncate">{doc.filename}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{formatDate(doc.created_at)}</span>
                        </div>
                        <div className="mt-1">
                          <Badge 
                            variant={doc.status === 'processed' ? 'default' : 'secondary'}
                            className={`text-xs ${doc.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              <strong>{selectedDocs.length}</strong> of {documents.length} documents selected
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ask AI</h1>
                <p className="text-gray-600">Get insights from your documents using AI</p>
              </div>
              <Button variant="outline" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2 mt-4">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt(prompt.prompt)}
                  className="flex items-center"
                  disabled={selectedDocs.length === 0}
                >
                  <prompt.icon className="h-4 w-4 mr-2" />
                  {prompt.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to help with your documents</h3>
                <p className="text-gray-500 mb-4">Select documents and ask questions to get started</p>
                {documents.length === 0 && (
                  <p className="text-sm text-amber-600">
                    💡 Upload some documents first to begin asking questions
                  </p>
                )}
              </div>
            ) : (
              conversations.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-3xl ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 ${msg.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.type === 'user' ? 'bg-blue-600' : 'bg-gray-100'
                      }`}>
                        {msg.type === 'user' ? (
                          <User className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className={`p-4 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-line">{msg.message}</p>
                      </div>
                      <div className={`flex items-center space-x-2 mt-2 text-sm text-gray-500 ${
                        msg.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span>{msg.timestamp}</span>
                      </div>
                      {msg.references && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.references.map((ref, refIndex) => (
                            <Badge key={refIndex} variant="secondary" className="text-xs">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-3xl">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                      <Bot className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="p-4 rounded-lg bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex space-x-4">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={selectedDocs.length > 0 ? "Ask anything about your selected documents..." : "Please select documents first"}
                className="flex-1"
                disabled={selectedDocs.length === 0}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || selectedDocs.length === 0 || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {selectedDocs.length === 0 && documents.length > 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Please select at least one document to start asking questions
              </p>
            )}
            {documents.length === 0 && (
              <p className="text-sm text-blue-600 mt-2">
                📝 Upload documents first to enable AI chat functionality
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AskAI;
