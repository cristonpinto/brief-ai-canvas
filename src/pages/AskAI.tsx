import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  FileText, 
  User, 
  Bot, 
  Lightbulb, 
  ListTodo, 
  FileOutput,
  HelpCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  Brain,
  Sparkles,
  MessageSquare,
  Zap,
  Activity,
  Calendar,
  HardDrive
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useDocuments } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  type: "user" | "assistant";
  message: string;
  timestamp: string;
  references?: string[];
  isTyping?: boolean;
}

const AskAI = () => {
  const { documents, isLoading: documentsLoading } = useDocuments();
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const quickPrompts = [
    { icon: FileOutput, text: "Summarize", prompt: "Summarize the key points from the selected documents", color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { icon: ListTodo, text: "Action Items", prompt: "Extract all action items and tasks from the selected documents", color: "from-green-500 to-green-600", bgColor: "bg-green-50", textColor: "text-green-600" },
    { icon: Lightbulb, text: "Key Insights", prompt: "What are the most important insights and recommendations?", color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50", textColor: "text-purple-600" },
    { icon: HelpCircle, text: "Main Topics", prompt: "What are the main topics covered in these documents?", color: "from-orange-500 to-orange-600", bgColor: "bg-orange-50", textColor: "text-orange-600" },
  ];

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  // Auto-select completed documents
  useEffect(() => {
    const completedDocs = documents
      .filter(doc => doc.status === 'completed')
      .map(doc => doc.id);
    setSelectedDocs(completedDocs);
  }, [documents]);

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
    const currentMessage = message.trim();
    setMessage("");

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('Sending AI chat request:', {
        question: currentMessage,
        documentIds: selectedDocs,
      });

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          question: currentMessage,
          documentIds: selectedDocs 
        }
      });

      console.log('AI chat response:', { data, error });

      if (error) {
        throw new Error(error.message || 'Function invocation failed');
      }

      if (!data) {
        throw new Error('No response data received');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const aiResponse: ChatMessage = {
        type: "assistant",
        message: data.answer || data.response || "I couldn't generate a response.",
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        references: data.sources || []
      };
      
      setConversations(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error('AI Chat error:', error);
      
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (error.message.includes('Authentication') || error.message.includes('401')) {
          errorMessage = "Authentication error. Please log in again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Chat Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      const errorResponse: ChatMessage = {
        type: "assistant",
        message: errorMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      setConversations(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'processing':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      default:
        return <AlertCircle className="h-3 w-3 text-gray-400" />;
    }
  };

  const completedDocuments = documents.filter(doc => doc.status === 'completed');
  const totalQueries = conversations.filter(msg => msg.type === 'user').length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        <div className="p-8">
          {/* Modern Header with Gradient */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-blue-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-blue-800 bg-clip-text text-transparent mb-3">
                    Ask AI Assistant 🤖
                  </h1>
                  <p className="text-lg text-gray-600 font-medium mb-4">
                    Chat with your documents using advanced AI technology
                  </p>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-emerald-500" />
                      <span className="text-sm text-gray-600">AI ready</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600">{completedDocuments.length} docs available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-purple-500" />
                      <span className="text-sm text-gray-600">{totalQueries} queries today</span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-3xl flex items-center justify-center transform -rotate-12 shadow-2xl">
                    <Brain className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced Document Selector Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm h-fit">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-1 rounded-t-lg">
                  <div className="bg-white rounded-t-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3 text-xl">
                        <div className="p-3 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl">
                          <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <span>Document Library</span>
                      </CardTitle>
                      <CardDescription>Select documents to query with AI</CardDescription>
                    </CardHeader>
                  </div>
                </div>
                
                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    <div className="p-4">
                      {documentsLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="p-4 border rounded-xl">
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
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 mb-2 font-medium">No documents uploaded</p>
                          <p className="text-sm text-gray-400 mb-4">Upload documents first to start asking questions</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {documents.map((doc) => (
                            <div
                              key={doc.id}
                              className={`group p-4 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                                selectedDocs.includes(doc.id) 
                                  ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-blue-50 shadow-md" 
                                  : "border-gray-200 hover:border-emerald-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-blue-50"
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
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                      <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <p className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                                      {doc.filename}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                                    <div className="flex items-center space-x-1">
                                      <HardDrive className="h-3 w-3" />
                                      <span>{formatFileSize(doc.file_size)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(doc.created_at)}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(doc.status)}
                                    <span className={`text-xs font-medium ${
                                      doc.status === 'completed' ? 'text-green-700' : 
                                      doc.status === 'processing' ? 'text-yellow-700' : 'text-gray-500'
                                    }`}>
                                      {doc.status === 'completed' ? 'Ready for AI' : doc.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="text-sm text-gray-700 font-medium text-center">
                      <strong className="text-emerald-600">{selectedDocs.length}</strong> of <strong className="text-blue-600">{completedDocuments.length}</strong> documents selected
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm h-full flex flex-col">
                {/* Enhanced Chat Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-1 rounded-t-lg">
                  <div className="bg-white rounded-t-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl">
                          <MessageSquare className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">AI Chat</h2>
                          <p className="text-gray-600">Intelligent document analysis</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600 font-medium">AI Online</span>
                      </div>
                    </div>

                    {/* Enhanced Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      {quickPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickPrompt(prompt.prompt)}
                          className={`group flex items-center justify-start p-4 h-auto border-2 hover:shadow-lg transition-all duration-300 ${prompt.bgColor} hover:border-emerald-300`}
                          disabled={selectedDocs.length === 0}
                        >
                          <div className={`p-2 ${prompt.bgColor} rounded-lg mr-3 group-hover:scale-110 transition-transform`}>
                            <prompt.icon className={`h-4 w-4 ${prompt.textColor}`} />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{prompt.text}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enhanced Chat Messages */}
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                      {conversations.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Bot className="h-12 w-12 text-emerald-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to assist! 🚀</h3>
                          <p className="text-gray-600 mb-6 text-lg">Select documents and ask questions to get intelligent insights</p>
                          {completedDocuments.length === 0 && (
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                              <p className="text-amber-700 font-medium flex items-center justify-center">
                                <Sparkles className="h-5 w-5 mr-2" />
                                Upload and process documents first to begin asking questions
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        conversations.map((msg, index) => (
                          <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex max-w-4xl ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className={`flex-shrink-0 ${msg.type === 'user' ? 'ml-4' : 'mr-4'}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                                  msg.type === 'user' 
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                    : 'bg-gradient-to-br from-emerald-400 to-emerald-500'
                                }`}>
                                  {msg.type === 'user' ? (
                                    <User className="h-5 w-5 text-white" />
                                  ) : (
                                    <Bot className="h-5 w-5 text-white" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <Card className={`shadow-lg border-0 ${
                                  msg.type === 'user' 
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                                    : 'bg-white border border-gray-100'
                                }`}>
                                  <CardContent className="p-6">
                                    <div className="prose prose-sm max-w-none">
                                      {msg.type === 'user' ? (
                                        <div className="text-white leading-relaxed whitespace-pre-line font-medium">
                                          {msg.message}
                                        </div>
                                      ) : (
                                        <div className="text-gray-900">
                                          <ReactMarkdown
                                            components={{
                                              p: ({children}) => <p className="mb-3 leading-relaxed text-gray-800">{children}</p>,
                                              strong: ({children}) => <strong className="font-bold text-gray-900 bg-yellow-100 px-1 rounded">{children}</strong>,
                                              ul: ({children}) => <ul className="mb-3 ml-6 space-y-1">{children}</ul>,
                                              ol: ({children}) => <ol className="mb-3 ml-6 space-y-1">{children}</ol>,
                                              li: ({children}) => <li className="leading-relaxed text-gray-800">{children}</li>,
                                              h1: ({children}) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
                                              h2: ({children}) => <h2 className="text-lg font-bold mb-2 text-gray-900">{children}</h2>,
                                              h3: ({children}) => <h3 className="text-base font-bold mb-2 text-gray-900">{children}</h3>,
                                            }}
                                          >
                                            {msg.message}
                                          </ReactMarkdown>
                                        </div>
                                      )}
                                    </div>
                                    <div className={`flex items-center justify-between mt-4 pt-3 border-t ${
                                      msg.type === 'user' ? 'border-blue-400' : 'border-gray-200'
                                    }`}>
                                      <span className={`text-xs font-medium ${
                                        msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                      }`}>
                                        {msg.timestamp}
                                      </span>
                                      {msg.references && msg.references.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                          {msg.references.map((ref, refIndex) => (
                                            <Badge key={refIndex} className="bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 border-emerald-200 border text-xs">
                                              📄 {ref}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="flex">
                            <div className="flex-shrink-0 mr-4">
                              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg">
                                <Bot className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <Card className="shadow-lg border-0 bg-white">
                                <CardContent className="p-6">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex space-x-1">
                                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
                                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                    <span className="text-sm text-gray-600 font-medium">AI is analyzing your documents...</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Enhanced Message Input */}
                  <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="flex space-x-4">
                      <div className="flex-1 relative">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={selectedDocs.length > 0 ? "Ask anything about your selected documents..." : "Please select documents first"}
                          className="pr-12 h-12 bg-white border-2 border-gray-200 focus:border-emerald-400 rounded-xl shadow-sm"
                          disabled={selectedDocs.length === 0 || isLoading}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Sparkles className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!message.trim() || selectedDocs.length === 0 || isLoading}
                        size="lg"
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 shadow-lg h-12 px-6 rounded-xl"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    {selectedDocs.length === 0 && completedDocuments.length > 0 && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-700 font-medium flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Please select at least one completed document to start asking questions
                        </p>
                      </div>
                    )}
                    {completedDocuments.length === 0 && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Upload and process documents first to enable AI chat
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AskAI;