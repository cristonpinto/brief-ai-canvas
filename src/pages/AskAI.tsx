
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

const AskAI = () => {
  const [selectedDocs, setSelectedDocs] = useState<number[]>([1, 2]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const documents = [
    { id: 1, name: "Q4 Planning.pdf", pages: 12, lastModified: "2024-01-15" },
    { id: 2, name: "Team Meeting Notes.docx", pages: 5, lastModified: "2024-01-15" },
    { id: 3, name: "Product Roadmap.pdf", pages: 8, lastModified: "2024-01-14" },
    { id: 4, name: "Budget Review.xlsx", pages: 3, lastModified: "2024-01-13" },
  ];

  const conversations = [
    {
      type: "user",
      message: "What are the key action items from the Q4 planning meeting?",
      timestamp: "2:34 PM"
    },
    {
      type: "assistant",
      message: "Based on the Q4 Planning document, here are the key action items:\n\n1. **Complete product roadmap review** by January 30th (Owner: Product Team)\n2. **Finalize budget allocation** for new initiatives (Owner: Finance)\n3. **Launch customer feedback program** in Q1 (Owner: Customer Success)\n4. **Hire 3 additional engineers** by March (Owner: HR/Engineering)\n\nThese action items were highlighted on pages 7-9 of the document.",
      timestamp: "2:34 PM",
      references: ["Q4 Planning.pdf - Page 7", "Q4 Planning.pdf - Page 9"]
    },
    {
      type: "user",
      message: "What's the timeline for the customer feedback program?",
      timestamp: "2:36 PM"
    },
    {
      type: "assistant",
      message: "According to the Q4 Planning document, the customer feedback program has the following timeline:\n\n**Phase 1 (February):** Design survey and feedback collection mechanisms\n**Phase 2 (March):** Beta test with 50 existing customers\n**Phase 3 (April):** Full launch to entire customer base\n\nThe program aims to collect feedback on product features, pricing, and overall satisfaction. Success metrics include achieving a 40% response rate and implementing at least 3 customer-requested features by Q2.",
      timestamp: "2:37 PM",
      references: ["Q4 Planning.pdf - Page 11"]
    }
  ];

  const quickPrompts = [
    { icon: FileOutput, text: "Summarize key points", prompt: "Summarize the key points from the selected documents" },
    { icon: ListTodo, text: "Extract action items", prompt: "Extract all action items and tasks from the selected documents" },
    { icon: Lightbulb, text: "Highlight insights", prompt: "Highlight the most important insights and recommendations" },
  ];

  const handleDocToggle = (docId: number) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim() || selectedDocs.length === 0) return;

    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      setIsLoading(false);
      setMessage("");
    }, 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
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
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{doc.pages} pages</span>
                        <span>{doc.lastModified}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                >
                  <prompt.icon className="h-4 w-4 mr-2" />
                  {prompt.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {conversations.map((msg, index) => (
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
            ))}

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
            {selectedDocs.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Please select at least one document to start asking questions
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AskAI;
