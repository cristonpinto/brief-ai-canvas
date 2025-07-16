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
  FileText,
  Shield,
  Palette,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Settings as SettingsIcon,
  Crown
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
      title: "Settings updated ✨",
      description: "Your notification preferences have been saved.",
    });
  };

  const connectIntegration = (integration: string) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: { connected: true, status: 'connected' }
    }));
    toast({
      title: `${integration.charAt(0).toUpperCase() + integration.slice(1)} connected! 🎉`,
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
      title: "API Key generated! 🔑",
      description: "Your new API key has been generated and copied to clipboard.",
    });
  };

  const teamMembers = [
    { name: "John Doe", email: "john@company.com", role: "Admin", avatar: "JD", color: "bg-blue-600" },
    { name: "Sarah Miller", email: "sarah@company.com", role: "Member", avatar: "SM", color: "bg-green-600" },
    { name: "Mike Johnson", email: "mike@company.com", role: "Member", avatar: "MJ", color: "bg-purple-600" },
  ];

  const integrationsList = [
    {
      name: "Notion",
      icon: FileText,
      description: "Export briefs directly to Notion pages",
      color: "text-gray-700",
      bgColor: "bg-gray-50",
      connected: integrations.notion.connected
    },
    {
      name: "Slack",
      icon: Bell,
      description: "Share briefs with your team channels",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      connected: integrations.slack.connected
    },
    {
      name: "GitHub",
      icon: Github,
      description: "Import documentation and README files",
      color: "text-gray-800",
      bgColor: "bg-gray-50",
      connected: integrations.github.connected
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <div className="p-8">
          {/* Modern Header */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent mb-3">
                    Settings ⚙️
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Customize your workspace and manage your preferences
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl flex items-center justify-center transform rotate-12 shadow-2xl">
                    <SettingsIcon className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg border-0">
              <TabsTrigger value="account" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="workspace" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Building className="h-4 w-4 mr-2" />
                Workspace
              </TabsTrigger>
              <TabsTrigger value="integrations" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Link className="h-4 w-4 mr-2" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6 mt-8">
              {/* Profile Card */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1 rounded-t-lg">
                  <div className="bg-white rounded-t-lg p-6">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle className="flex items-center space-x-3 text-2xl">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <span>Profile Information</span>
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      </CardTitle>
                      <CardDescription>Update your personal account information</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="firstName" className="flex items-center space-x-2 font-medium">
                              <User className="h-4 w-4 text-blue-500" />
                              <span>First Name</span>
                            </Label>
                            <Input id="firstName" defaultValue="John" className="mt-2" />
                          </div>
                          <div>
                            <Label htmlFor="email" className="flex items-center space-x-2 font-medium">
                              <Mail className="h-4 w-4 text-green-500" />
                              <span>Email</span>
                            </Label>
                            <Input id="email" type="email" defaultValue="john@company.com" className="mt-2" />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="flex items-center space-x-2 font-medium">
                              <Phone className="h-4 w-4 text-purple-500" />
                              <span>Phone</span>
                            </Label>
                            <Input id="phone" defaultValue="+1 (555) 123-4567" className="mt-2" />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="lastName" className="flex items-center space-x-2 font-medium">
                              <User className="h-4 w-4 text-blue-500" />
                              <span>Last Name</span>
                            </Label>
                            <Input id="lastName" defaultValue="Doe" className="mt-2" />
                          </div>
                          <div>
                            <Label htmlFor="company" className="flex items-center space-x-2 font-medium">
                              <Building className="h-4 w-4 text-orange-500" />
                              <span>Company</span>
                            </Label>
                            <Input id="company" defaultValue="Acme Corporation" className="mt-2" />
                          </div>
                          <div>
                            <Label htmlFor="location" className="flex items-center space-x-2 font-medium">
                              <MapPin className="h-4 w-4 text-red-500" />
                              <span>Location</span>
                            </Label>
                            <Input id="location" defaultValue="San Francisco, CA" className="mt-2" />
                          </div>
                        </div>
                      </div>
                      <Button className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </CardContent>
                  </div>
                </div>
              </Card>

              {/* Security Card */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <span>Security & Privacy</span>
                  </CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" className="mt-2" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" className="mt-2" />
                  </div>
                  <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                    <Shield className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workspace" className="space-y-6 mt-8">
              {/* Workspace Settings */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-3 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl">
                      <Building className="h-6 w-6 text-green-600" />
                    </div>
                    <span>Workspace Configuration</span>
                  </CardTitle>
                  <CardDescription>Configure your team workspace settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workspaceName">Workspace Name</Label>
                      <Input id="workspaceName" defaultValue="Acme Team Workspace" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="workspaceUrl">Workspace URL</Label>
                      <Input id="workspaceUrl" defaultValue="acme-team" className="mt-2" />
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
                    <Building className="h-4 w-4 mr-2" />
                    Save Workspace Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Enhanced Team Members */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
                      <User className="h-6 w-6 text-purple-600" />
                    </div>
                    <span>Team Members</span>
                  </CardTitle>
                  <CardDescription>Manage your team members and their permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${member.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <span className="text-white font-bold">{member.avatar}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${
                          member.role === 'Admin' 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role === 'Admin' && <Crown className="h-3 w-3 mr-1" />}
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6 mt-8">
              {/* Enhanced Connected Services */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl">
                      <Link className="h-6 w-6 text-blue-600" />
                    </div>
                    <span>Connected Services</span>
                  </CardTitle>
                  <CardDescription>Connect AutoBrief with your favorite tools and services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {integrationsList.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-6 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all duration-300 bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50">
                      <div className="flex items-center space-x-4">
                        <div className={`p-4 ${integration.bgColor} rounded-2xl`}>
                          <integration.icon className={`h-8 w-8 ${integration.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">{integration.name}</h4>
                          <p className="text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {integration.connected ? (
                          <>
                            <Badge className="bg-green-100 text-green-800 border-green-200 border">
                              <Check className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => disconnectIntegration(integration.name.toLowerCase())}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => connectIntegration(integration.name.toLowerCase())}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:from-blue-600 hover:to-cyan-600"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Enhanced API Access */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl">
                      <Key className="h-6 w-6 text-yellow-600" />
                    </div>
                    <span>API Access</span>
                  </CardTitle>
                  <CardDescription>Generate API keys for custom integrations and automation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">Current API Key:</p>
                    <div className="flex items-center space-x-3">
                      <code className="flex-1 text-sm bg-white p-3 rounded-lg border font-mono">
                        ab_sk_••••••••••••••••••••••••••••••••
                      </code>
                      <Button variant="outline" size="sm">
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Button onClick={generateApiKey} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    <Key className="h-4 w-4 mr-2" />
                    Generate New Key
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 mt-8">
              {/* Enhanced Notification Preferences */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                      <Bell className="h-6 w-6 text-indigo-600" />
                    </div>
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription>Choose what notifications you want to receive and how</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {[
                    { key: 'uploadComplete', title: 'Upload Complete', desc: 'Get notified when document processing is complete', icon: FileText, color: 'text-blue-500' },
                    { key: 'briefGenerated', title: 'Brief Generated', desc: 'Get notified when AI generates a new brief', icon: Sparkles, color: 'text-purple-500' },
                    { key: 'weeklyDigest', title: 'Weekly Digest', desc: 'Receive a weekly summary of your activity', icon: Globe, color: 'text-green-500' },
                    { key: 'systemUpdates', title: 'System Updates', desc: 'Get notified about new features and updates', icon: Zap, color: 'text-orange-500' }
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                          <setting.icon className={`h-6 w-6 ${setting.color}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{setting.title}</h4>
                          <p className="text-gray-600">{setting.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                        onCheckedChange={() => toggleNotification(setting.key as keyof typeof notificationSettings)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;