import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Camera, 
  Settings, 
  Users, 
  BarChart3, 
  Sprout,
  CloudRain,
  TrendingUp,
  Bell,
  MapPin,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile } = useAuth();

  if (!profile) return null;

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'farmer': return 'bg-green-500';
      case 'expert': return 'bg-blue-500';
      case 'admin': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      english: hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening',
      hindi: hour < 12 ? 'सुप्रभात' : hour < 17 ? 'नमस्कार' : 'शुभ संध्या',
      tamil: hour < 12 ? 'காலை வணக்கம்' : hour < 17 ? 'நல்ல மதியம்' : 'மாலை வணக்கம்',
    };
    
    return greetings[profile.preferred_language as keyof typeof greetings] || greetings.english;
  };

  const getQuickActions = () => {
    const baseActions = [
      {
        title: 'Chat Assistant',
        description: 'Get instant farming advice',
        icon: MessageSquare,
        href: '/?tab=chat',
        color: 'bg-blue-500'
      },
      {
        title: 'Plant Identification',
        description: 'Identify and diagnose plants',
        icon: Camera,
        href: '/?tab=identify',
        color: 'bg-green-500'
      }
    ];

    if (profile.role === 'admin') {
      baseActions.push({
        title: 'User Management',
        description: 'Manage users and roles',
        icon: Users,
        href: '/admin/users',
        color: 'bg-purple-500'
      });
      baseActions.push({
        title: 'Analytics',
        description: 'View system analytics',
        icon: BarChart3,
        href: '/admin/analytics',
        color: 'bg-orange-500'
      });
    }

    if (profile.role === 'expert') {
      baseActions.push({
        title: 'Expert Console',
        description: 'Help farmers with queries',
        icon: Users,
        href: '/expert/console',
        color: 'bg-indigo-500'
      });
    }

    baseActions.push({
      title: 'Settings',
      description: 'Configure your preferences',
      icon: Settings,
      href: '/settings',
      color: 'bg-gray-500'
    });

    return baseActions;
  };

  const getPersonalizedContent = () => {
    if (profile.role === 'farmer') {
      return {
        title: 'Your Farm Dashboard',
        stats: [
          {
            title: 'Crop Types',
            value: profile.crop_types?.length || 0,
            icon: Sprout,
            description: 'types configured'
          },
          {
            title: 'Region',
            value: profile.region_type || 'Not set',
            icon: MapPin,
            description: profile.district || 'Location'
          },
          {
            title: 'Soil Type',
            value: profile.soil_type || 'Not set',
            icon: TrendingUp,
            description: 'soil condition'
          }
        ],
        recommendations: [
          'Check weather forecast for your region',
          'Review care tips for your crops',
          'Update your crop calendar',
          'Connect with local experts'
        ]
      };
    }

    if (profile.role === 'expert') {
      return {
        title: 'Expert Dashboard',
        stats: [
          {
            title: 'Farmers Helped',
            value: '24',
            icon: Users,
            description: 'this week'
          },
          {
            title: 'Response Rate',
            value: '98%',
            icon: TrendingUp,
            description: 'average'
          },
          {
            title: 'Active Queries',
            value: '12',
            icon: MessageSquare,
            description: 'pending'
          }
        ],
        recommendations: [
          'Review pending farmer queries',
          'Update your expertise areas',
          'Share farming best practices',
          'Connect with local farmers'
        ]
      };
    }

    return {
      title: 'Admin Dashboard',
      stats: [
        {
          title: 'Total Users',
          value: '1,234',
          icon: Users,
          description: 'registered'
        },
        {
          title: 'Daily Active',
          value: '456',
          icon: TrendingUp,
          description: 'users today'
        },
        {
          title: 'System Health',
          value: '99.9%',
          icon: BarChart3,
          description: 'uptime'
        }
      ],
      recommendations: [
        'Review system performance',
        'Check user feedback',
        'Update system configurations',
        'Monitor API usage'
      ]
    };
  };

  const quickActions = getQuickActions();
  const content = getPersonalizedContent();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={`text-white ${getRoleColor(profile.role)}`}>
                  {getUserInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  {getPersonalizedGreeting()}, {profile.full_name?.split(' ')[0] || 'User'}!
                </h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {profile.role}
                  </Badge>
                  {profile.district && profile.state && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.district}, {profile.state}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Link to="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{content.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.description}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations for You</CardTitle>
              <CardDescription>
                Personalized suggestions based on your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {content.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {profile.crop_types && profile.crop_types.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Crops</CardTitle>
                <CardDescription>
                  Crops you're currently growing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.crop_types.map((crop, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {crop}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}