
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Users
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface BriefCard {
  id: string;
  type: 'summary' | 'keypoints' | 'actions' | 'decisions';
  title: string;
  content: string;
  isEditing: boolean;
}

const BriefGenerator = () => {
  const [briefTitle, setBriefTitle] = useState("Q4 Planning Brief");
  const [briefCards, setBriefCards] = useState<BriefCard[]>([
    {
      id: '1',
      type: 'summary',
      title: 'Executive Summary',
      content: 'Our Q4 planning session focused on strategic initiatives for the upcoming quarter, including product roadmap adjustments, budget allocation for new features, and team expansion plans. Key decisions were made regarding customer feedback implementation and timeline adjustments.',
      isEditing: false
    },
    {
      id: '2',
      type: 'keypoints',
      title: 'Key Points',
      content: '• Product roadmap review and prioritization\n• Budget approval for 3 new engineering hires\n• Customer feedback program launch timeline\n• Q1 marketing campaign strategy\n• Integration partnership discussions',
      isEditing: false
    },
    {
      id: '3',
      type: 'actions',
      title: 'Action Items',
      content: '• Complete hiring process for engineering roles by March 1st (Owner: HR)\n• Launch customer feedback beta by February 15th (Owner: Product)\n• Finalize marketing campaign budget by January 30th (Owner: Marketing)\n• Review integration partnerships by February 28th (Owner: Business Development)',
      isEditing: false
    },
    {
      id: '4',
      type: 'decisions',
      title: 'Key Decisions',
      content: '• Approved $150K budget for customer feedback platform\n• Decided to delay mobile app launch to Q2\n• Prioritized API improvements over new features\n• Agreed to expand team by 3 engineers\n• Selected customer feedback vendor after evaluation',
      isEditing: false
    }
  ]);

  const { toast } = useToast();

  const cardTypeConfig = {
    summary: { icon: FileText, color: 'bg-blue-100 text-blue-800', bgColor: 'border-blue-200' },
    keypoints: { icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800', bgColor: 'border-yellow-200' },
    actions: { icon: CheckSquare, color: 'bg-green-100 text-green-800', bgColor: 'border-green-200' },
    decisions: { icon: Users, color: 'bg-purple-100 text-purple-800', bgColor: 'border-purple-200' }
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
      summary: 'Summary',
      keypoints: 'Key Points',
      actions: 'Action Items',
      decisions: 'Decisions'
    };

    const newCard: BriefCard = {
      id: Date.now().toString(),
      type,
      title: `New ${typeLabels[type]}`,
      content: 'Click edit to add content...',
      isEditing: true
    };

    setBriefCards(prev => [...prev, newCard]);
  };

  const saveBrief = () => {
    toast({
      title: "Brief saved",
      description: "Your brief has been saved successfully.",
    });
  };

  const exportBrief = (format: string) => {
    toast({
      title: `Exporting to ${format}`,
      description: `Your brief is being exported to ${format} format.`,
    });
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
              className="text-3xl font-bold border-none p-0 bg-transparent"
              style={{ fontSize: '2rem' }}
            />
            <p className="text-gray-600 mt-2">AI-generated brief with editable sections</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={saveBrief}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" onClick={() => exportBrief('PDF')}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => exportBrief('Notion')}>
              <Share2 className="h-4 w-4 mr-2" />
              Share to Notion
            </Button>
          </div>
        </div>

        {/* Add Card Buttons */}
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
                          className="font-semibold bg-transparent border-none p-0"
                          onBlur={() => toggleEdit(card.id)}
                          autoFocus
                        />
                      ) : (
                        <CardTitle className="cursor-pointer" onClick={() => toggleEdit(card.id)}>
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
                      className="min-h-24 bg-white"
                      onBlur={() => toggleEdit(card.id)}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="whitespace-pre-line cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => toggleEdit(card.id)}
                    >
                      {card.content}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {briefCards.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brief cards yet</h3>
              <p className="text-gray-600 text-center mb-4">
                Start by adding summary, key points, action items, or decision cards to build your brief.
              </p>
              <Button onClick={() => addNewCard('summary')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Card
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BriefGenerator;
