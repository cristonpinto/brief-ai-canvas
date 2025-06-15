
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Building, 
  Link, 
  Bell, 
  Key, 
  Check, 
  ExternalLink,
  Github,
  FileText 
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    uploadComplete: true,
    briefGenerated: true,
    weeklyDigest: false,
    systemUpdates: true
  });

  const [integrations, setIntegrations] = useState({
    notion: { connected: false, status: 'disconnected' },
    slack: { connected: true, status: 'connected' },
    github: { connected: false, status: 'disconnected' }
  });

  const { toast } = useToast();

  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const connectIntegration = (integration: string) => {
    // Simulate OAuth flow
    setIntegrations(prev => ({
      ...prev,
      [integration]: { connected: true, status: 'connected' }
    }));
    toast({
      title: `${integration.charAt(0).toUpperCase() + integration.slice(1)} connected`,
      description: `Successfully connected to ${integration}.`,
    });
  };

  const disconnectIntegration = (integration: string) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: { connected: false, status: 'disconnected' }
    }));
    toast({
      title: `${integration.charAt(0).toUpperCase() + integration.slice(1)} disconnected`,
      description: `Successfully disconnected from ${integration}.`,
    });
  };

  const generateApiKey = () => {
    toast({
      title: "API Key generated",
      description: "Your new API key has been generated and copied to clipboard.",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and integrations</p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="workspace">Workspace</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>Update your personal account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john@company.com" />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue="Acme Corporation" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workspace" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Workspace Settings</span>
                </CardTitle>
                <CardDescription>Configure your team workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="workspaceName">Workspace Name</Label>
                  <Input id="workspaceName" defaultValue="Acme Team Workspace" />
                </div>
                <div>
                  <Label htmlFor="workspaceUrl">Workspace URL</Label>
                  <Input id="workspaceUrl" defaultValue="acme-team" />
                </div>
                <Button>Save Workspace Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your team members and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">JD</span>
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-gray-500">john@company.com</p>
                      </div>
                    </div>
                    <Badge>Admin</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">SM</span>
                      </div>
                      <div>
                        <p className="font-medium">Sarah Miller</p>
                        <p className="text-sm text-gray-500">sarah@company.com</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                </div>
                <Button className="mt-4" variant="outline">
                  Invite Team Member
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Link className="h-5 w-5" />
                  <span>Connected Services</span>
                </CardTitle>
                <CardDescription>Connect AutoBrief with your favorite tools</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notion Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-gray-700" />
                    <div>
                      <h4 className="font-medium">Notion</h4>
                      <p className="text-sm text-gray-600">Export briefs directly to Notion pages</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {integrations.notion.connected ? (
                      <>
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectIntegration('notion')}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => connectIntegration('notion')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Slack Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-bold">S</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Slack</h4>
                      <p className="text-sm text-gray-600">Share briefs with your team channels</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {integrations.slack.connected ? (
                      <>
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectIntegration('slack')}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => connectIntegration('slack')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>

                {/* GitHub Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Github className="h-8 w-8 text-gray-700" />
                    <div>
                      <h4 className="font-medium">GitHub</h4>
                      <p className="text-sm text-gray-600">Import documentation and README files</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {integrations.github.connected ? (
                      <>
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectIntegration('github')}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => connectIntegration('github')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>API Access</span>
                </CardTitle>
                <CardDescription>Generate API keys for custom integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Current API Key:</p>
                  <code className="text-sm bg-white p-2 rounded border block">
                    ab_sk_••••••••••••••••••••••••••••••••
                  </code>
                </div>
                <Button onClick={generateApiKey} variant="outline">
                  Generate New Key
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Upload Complete</h4>
                    <p className="text-sm text-gray-600">Get notified when document processing is complete</p>
                  </div>
                  <Switch
                    checked={notificationSettings.uploadComplete}
                    onCheckedChange={() => toggleNotification('uploadComplete')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Brief Generated</h4>
                    <p className="text-sm text-gray-600">Get notified when AI generates a new brief</p>
                  </div>
                  <Switch
                    checked={notificationSettings.briefGenerated}
                    onCheckedChange={() => toggleNotification('briefGenerated')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Digest</h4>
                    <p className="text-sm text-gray-600">Receive a weekly summary of your activity</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyDigest}
                    onCheckedChange={() => toggleNotification('weeklyDigest')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Updates</h4>
                    <p className="text-sm text-gray-600">Get notified about new features and updates</p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={() => toggleNotification('systemUpdates')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
