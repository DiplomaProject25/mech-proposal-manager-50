
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Bell, Globe, Lock, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [autoSave, setAutoSave] = useState(true);
  
  const handleSaveSettings = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been successfully updated.',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Settings" />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">
                <span className="flex items-center">
                  <SettingsIcon className="mr-2 h-5 w-5" />
                  Application Settings
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList className="mb-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">General Settings</h3>
                      <p className="text-sm text-gray-500">
                        Manage your general application preferences.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="language">Language</Label>
                          <p className="text-sm text-gray-500">
                            Select your preferred language for the application interface.
                          </p>
                        </div>
                        <select
                          id="language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="rounded-md border border-gray-300 py-2 px-3"
                        >
                          <option value="en">English</option>
                          <option value="ru">Russian</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="autosave">Auto Save</Label>
                          <p className="text-sm text-gray-500">
                            Automatically save your work as you go.
                          </p>
                        </div>
                        <Switch
                          id="autosave"
                          checked={autoSave}
                          onCheckedChange={setAutoSave}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="appearance">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Appearance Settings</h3>
                      <p className="text-sm text-gray-500">
                        Customize how the application looks and feels.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="theme">Theme</Label>
                          <p className="text-sm text-gray-500">
                            Toggle between light and dark mode.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sun className="h-5 w-5 text-gray-500" />
                          <Switch
                            id="theme"
                            checked={darkMode}
                            onCheckedChange={setDarkMode}
                          />
                          <Moon className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Notification Settings</h3>
                      <p className="text-sm text-gray-500">
                        Control when and how you receive notifications.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifications">Notifications</Label>
                          <p className="text-sm text-gray-500">
                            Enable or disable application notifications.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Bell className="h-5 w-5 text-gray-500" />
                          <Switch
                            id="notifications"
                            checked={notifications}
                            onCheckedChange={setNotifications}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="security">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium">Security Settings</h3>
                      <p className="text-sm text-gray-500">
                        Manage your account security preferences.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex flex-col space-y-4">
                      <Button 
                        variant="outline" 
                        className="flex items-center w-full md:w-auto justify-start"
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center w-full md:w-auto justify-start"
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Manage Login Sessions
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 flex justify-end">
              <Button onClick={handleSaveSettings} className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
