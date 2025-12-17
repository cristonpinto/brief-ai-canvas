
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  GripVertical, 
  Edit3, 
  Trash2, 
  Save, 
  Download, 
  Share2,
  FileText,
  CheckSquare,
  Lightbulb,
  Users,
  Loader2,
  Copy,
  ExternalLink,
  Sparkles,
  BookOpen,
  AlertCircle
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useDocuments } from "@/hooks/useDocuments";
import { useBriefs, type BriefCard } from "@/hooks/useBriefs";
import { useSearchParams } from "react-router-dom";

const BriefGenerator = () => {
  const [searchParams] = useSearchParams();
  const briefType = searchParams.get('type') || 'Custom Brief';
  
  const [briefTitle, setBriefTitle] = useState(
    briefType === 'Custom Brief' ? 'My Brief' : 
    briefType === 'q4-strategic' ? 'Q4 Strategic Planning' :
    briefType === 'product-roadmap' ? 'Product Roadmap Review' :
    briefType
  );
  
  const [briefCards, setBriefCards] = useState<BriefCard[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [currentBriefId, setCurrentBriefId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const { documents, isLoading: isLoadingDocuments } = useDocuments();
  const { 
    saveBrief, 
    updateBrief, 
    generateBrief, 
    isSaving, 
    isUpdating, 
    isGenerating 
  } = useBriefs();

  const cardTypeConfig = {
    summary: { icon: FileText, color: 'bg-blue-100 text-blue-800', bgColor: 'border-blue-200' },
    keypoints: { icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800', bgColor: 'border-yellow-200' },
    actions: { icon: CheckSquare, color: 'bg-green-100 text-green-800', bgColor: 'border-green-200' },
    decisions: { icon: Users, color: 'bg-purple-100 text-purple-800', bgColor: 'border-purple-200' }
  };

  // Show all documents, not just processed ones
  const processedDocuments = documents;

  const generateBriefFromAI = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No documents selected",
        description: "Please select at least one document to generate a brief.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await generateBrief({
        documentIds: selectedDocuments,
        briefTitle: briefTitle,
        briefType: briefType
      });

      setBriefCards(result.brief.map((card: BriefCard) => ({ ...card, isEditing: false })));
      setShowDocumentSelector(false);
      
      toast({
        title: "Brief generated successfully!",
        description: `Generated from ${result.sourceDocuments}`,
      });
    } catch (error) {
      // Error handling is done in the hook
      console.error('Brief generation error:', error);
    }
  };

  const toggleEdit = (cardId: string) => {
    setBriefCards(prev => 
      prev.map(card => 
        card.id === cardId 
          ? { ...card, isEditing: !card.isEditing }
          : card
      )
    );
  };

  const updateCardContent = (cardId: string, content: string) => {
    setBriefCards(prev => 
      prev.map(card => 
        card.id === cardId 
          ? { ...card, content }
          : card
      )
    );
  };

  const updateCardTitle = (cardId: string, title: string) => {
    setBriefCards(prev => 
      prev.map(card => 
        card.id === cardId 
          ? { ...card, title }
          : card
      )
    );
  };

  const deleteCard = (cardId: string) => {
    setBriefCards(prev => prev.filter(card => card.id !== cardId));
    toast({
      title: "Card deleted",
      description: "The brief card has been removed.",
    });
  };

  const addNewCard = (type: BriefCard['type']) => {
    const typeLabels = {
      summary: 'Executive Summary',
      keypoints: 'Key Points',
      actions: 'Action Items',
      decisions: 'Key Decisions'
    };

    const newCard: BriefCard = {
      id: Date.now().toString(),
      type,
      title: typeLabels[type],
      content: 'Click edit to add content...',
      isEditing: true
    };

    setBriefCards(prev => [...prev, newCard]);
  };

  const saveBriefToDB = async () => {
    try {
      if (currentBriefId) {
        // Update existing brief
        await updateBrief({
          id: currentBriefId,
          title: briefTitle,
          cards: briefCards
        });
      } else {
        // Save new brief
        const briefId = await saveBrief({
          title: briefTitle,
          briefType: briefType,
          cards: briefCards,
          sourceDocuments: selectedDocuments
        });
        setCurrentBriefId(briefId);
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error('Save error:', error);
    }
  };

  const copyToClipboard = async () => {
    const briefText = `# ${briefTitle}\n\n${briefCards.map(card => 
      `## ${card.title}\n${card.content}`
    ).join('\n\n')}`;
    
    try {
      await navigator.clipboard.writeText(briefText);
      toast({
        title: "Copied to clipboard",
        description: "Brief content has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Title
      pdf.setFontSize(20);
      pdf.text(briefTitle, 20, 30);
      
      // Add date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
      
      let yPosition = 60;
      
      // Add each card content
      briefCards.forEach((card) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        
        // Card title
        pdf.setFontSize(16);
        pdf.text(`${card.title}`, 20, yPosition);
        yPosition += 15;
        
        // Card content
        pdf.setFontSize(11);
        const lines = pdf.splitTextToSize(card.content, 170);
        pdf.text(lines, 20, yPosition);
        yPosition += lines.length * 6 + 15;
      });
      
      // Save the PDF
      pdf.save(`${briefTitle}.pdf`);
      
      toast({
        title: "PDF exported successfully",
        description: "Your brief has been downloaded as a PDF.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const [showNotionModal, setShowNotionModal] = useState(false);

  const shareToNotion = () => {
    setShowNotionModal(true);
  };

  const copyNotionFormat = async () => {
    const notionText = `# ${briefTitle}

Generated on: ${new Date().toLocaleDateString()}

${briefCards.map(card => `## ${card.title}

${card.content}

`).join('')}

---
*Generated by Brief AI Canvas*`;
    
    try {
      await navigator.clipboard.writeText(notionText);
      toast({
        title: "Copied for Notion",
        description: "Brief content formatted for Notion has been copied to your clipboard.",
      });
      setShowNotionModal(false);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Input
              value={briefTitle}
              onChange={(e) => setBriefTitle(e.target.value)}
              className="text-3xl font-bold border-none p-0 bg-transparent focus:ring-0"
              style={{ fontSize: '2rem', boxShadow: 'none' }}
            />
            <p className="text-gray-600 mt-2">AI-powered brief generator with editable sections</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={saveBriefToDB} disabled={isSaving || isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving || isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={shareToNotion}>
              <Share2 className="h-4 w-4 mr-2" />
              Share to Notion
            </Button>
          </div>
        </div>

        {/* AI Generate Section */}
        {briefCards.length === 0 && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                Generate Brief with AI
              </CardTitle>
              <CardDescription>
                Select your documents and let AI create a structured brief for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Dialog open={showDocumentSelector} onOpenChange={setShowDocumentSelector}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Select Documents ({selectedDocuments.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Select Documents for Brief Generation</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                      {isLoadingDocuments ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          Loading documents...
                        </div>
                      ) : processedDocuments.length === 0 ? (
                        <div className="text-center py-8">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No processed documents found.</p>
                          <p className="text-sm text-gray-500 mt-2">Upload and process documents first.</p>
                          <p className="text-xs text-gray-400 mt-4">
                            Total documents: {documents.length} | 
                            Completed: {documents.filter(d => d.status === 'completed').length} | 
                            Processed: {documents.filter(d => d.status === 'processed').length} |
                            Pending: {documents.filter(d => d.status === 'pending').length}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {processedDocuments.map((doc) => (
                            <div key={doc.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                              <Checkbox
                                checked={selectedDocuments.includes(doc.id)}
                                onCheckedChange={() => toggleDocumentSelection(doc.id)}
                              />
                              <FileText className="h-4 w-4 text-blue-600" />
                              <div className="flex-1">
                                <p className="font-medium">{doc.filename}</p>
                                <p className="text-sm text-gray-500">
                                  {(doc.file_size / 1024).toFixed(1)} KB • {doc.file_type}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  onClick={generateBriefFromAI}
                  disabled={isGenerating || selectedDocuments.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Brief
                    </>
                  )}
                </Button>
              </div>
              
              {selectedDocuments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Selected documents:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocuments.map(docId => {
                      const doc = documents.find(d => d.id === docId);
                      return doc ? (
                        <Badge key={docId} variant="secondary">
                          {doc.filename}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual Add Card Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNewCard('summary')}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Summary
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNewCard('keypoints')}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Key Points
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNewCard('actions')}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Actions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNewCard('decisions')}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Decisions
          </Button>
        </div>

        {/* Brief Cards */}
        <div className="space-y-6">
          {briefCards.map((card) => {
            const config = cardTypeConfig[card.type];
            const IconComponent = config.icon;

            return (
              <Card key={card.id} className={`${config.bgColor} transition-all duration-200 hover:shadow-md`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      {card.isEditing ? (
                        <Input
                          value={card.title}
                          onChange={(e) => updateCardTitle(card.id, e.target.value)}
                          className="font-semibold bg-transparent border-none p-0 focus:ring-0"
                          onBlur={() => toggleEdit(card.id)}
                          onKeyDown={(e) => e.key === 'Enter' && toggleEdit(card.id)}
                          autoFocus
                        />
                      ) : (
                        <CardTitle className="cursor-pointer hover:text-blue-600" onClick={() => toggleEdit(card.id)}>
                          {card.title}
                        </CardTitle>
                      )}
                      <Badge className={config.color}>
                        {card.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEdit(card.id)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCard(card.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {card.isEditing ? (
                    <Textarea
                      value={card.content}
                      onChange={(e) => updateCardContent(card.id, e.target.value)}
                      className="min-h-32 bg-white resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          toggleEdit(card.id);
                        }
                      }}
                      placeholder="Enter your content here..."
                      autoFocus
                    />
                  ) : (
                    <div
                      className="whitespace-pre-line cursor-pointer hover:bg-white/50 p-3 rounded transition-colors min-h-16"
                      onClick={() => toggleEdit(card.id)}
                    >
                      {card.content || 'Click to add content...'}
                    </div>
                  )}
                  {card.isEditing && (
                    <div className="flex justify-end space-x-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleEdit(card.id)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => toggleEdit(card.id)}
                      >
                        Save
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {briefCards.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Start Building Your Brief</h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                {processedDocuments.length > 0 
                  ? "Generate a brief from your documents using AI, or manually add sections below."
                  : "Add sections manually to build your brief, or upload documents to use AI generation."
                }
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {processedDocuments.length > 0 && (
                  <Button onClick={() => setShowDocumentSelector(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate with AI
                  </Button>
                )}
                <Button variant="outline" onClick={() => addNewCard('summary')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Summary
                </Button>
                <Button variant="outline" onClick={() => addNewCard('keypoints')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Key Points
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notion Integration Modal */}
      <Dialog open={showNotionModal} onOpenChange={setShowNotionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ExternalLink className="h-5 w-5 mr-2 text-blue-600" />
              Share to Notion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Copy your brief content in Notion-compatible format and paste it into your Notion workspace.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">How to add to Notion:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Click "Copy for Notion" below</li>
                <li>Open your Notion workspace</li>
                <li>Create a new page or open an existing one</li>
                <li>Paste the content (Ctrl+V / Cmd+V)</li>
                <li>Notion will automatically format the headers and content</li>
              </ol>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setShowNotionModal(false)}>
                Cancel
              </Button>
              <Button onClick={copyNotionFormat} className="bg-blue-600 hover:bg-blue-700">
                <Copy className="h-4 w-4 mr-2" />
                Copy for Notion
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default BriefGenerator;
