
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, MapPin, Edit2, Save, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from '@/components/ui/use-toast';
import { useAuth, UserRole } from '@/context/AuthContext';
import Header from '@/components/layout/Header';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // User profile data (in a real app, this would come from the API)
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    department: user?.role === UserRole.DIRECTOR ? 'Management' : 'Engineering',
    position: user?.role === UserRole.DIRECTOR ? 'Director' : 'Constructor',
    location: 'Main Office, Building 3',
    bio: 'Experienced professional with over 5 years in the manufacturing industry. Specialized in mechanical engineering and production optimization.',
  });
  
  // Sample activity history
  const activityHistory = [
    { date: '2023-11-15', action: 'Completed order #o3', time: '14:32' },
    { date: '2023-11-10', action: 'Started assembly on order #o2', time: '09:45' },
    { date: '2023-11-05', action: 'Created commercial proposal for Tech Solutions', time: '16:20' },
    { date: '2023-10-25', action: 'Assigned to order #o3', time: '11:15' },
    { date: '2023-10-20', action: 'Account created', time: '09:00' },
  ];
  
  const handleEdit = () => {
    setEditing(true);
  };
  
  const handleSave = () => {
    setEditing(false);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved successfully.',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Profile" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-0 text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{profile.position}</p>
              </CardHeader>
              <CardContent className="text-center pt-4">
                <div className="flex items-center justify-center mb-3">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                
                <div className="flex items-center justify-center mb-3">
                  <Phone className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
                
                <div className="flex items-center justify-center mb-3">
                  <Building className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{profile.department}</span>
                </div>
                
                <div className="flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm">{profile.location}</span>
                </div>
                
                <Separator className="my-4" />
                
                <Collapsible
                  open={isHistoryOpen}
                  onOpenChange={setIsHistoryOpen}
                  className="text-left"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex justify-between items-center">
                      <span>Activity History</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                        isHistoryOpen ? 'rotate-180' : ''
                      }`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-3 pt-2">
                      {activityHistory.map((activity, index) => (
                        <div key={index} className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500">
                            {activity.date} at {activity.time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold">
                    <span className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Profile Information
                    </span>
                  </CardTitle>
                  
                  {!editing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEdit}
                      className="flex items-center"
                    >
                      <Edit2 className="mr-1 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      className="flex items-center"
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save Changes
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {editing ? (
                        <Input 
                          id="name" 
                          value={profile.name} 
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm py-2">{profile.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      {editing ? (
                        <Input 
                          id="email" 
                          type="email" 
                          value={profile.email} 
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm py-2">{profile.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      {editing ? (
                        <Input 
                          id="phone" 
                          value={profile.phone} 
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm py-2">{profile.phone}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      {editing ? (
                        <Input 
                          id="department" 
                          value={profile.department} 
                          onChange={(e) => setProfile({...profile, department: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm py-2">{profile.department}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      {editing ? (
                        <Input 
                          id="position" 
                          value={profile.position} 
                          onChange={(e) => setProfile({...profile, position: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm py-2">{profile.position}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      {editing ? (
                        <Input 
                          id="location" 
                          value={profile.location} 
                          onChange={(e) => setProfile({...profile, location: e.target.value})}
                        />
                      ) : (
                        <p className="text-sm py-2">{profile.location}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biography</Label>
                    {editing ? (
                      <textarea 
                        id="bio" 
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={profile.bio} 
                        onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
