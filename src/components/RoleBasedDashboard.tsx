import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sprout, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Camera, 
  Settings,
  TrendingUp,
  MapPin,
  Calendar,
  Leaf,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
}

interface DashboardStat {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  description: string;
}

interface DashboardContent {
  title: string;
  stats: DashboardStat[];
  recommendations: string[];
  quickActions: QuickAction[];
}

export const RoleBasedDashboard: React.FC = () => {
  const { profile } = useAuth();

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      english: hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening',
      hindi: hour < 12 ? 'सुप्रभात' : hour < 17 ? 'नमस्कार' : 'शुभ संध्या',
      tamil: hour < 12 ? 'காலை வணக்கம்' : hour < 17 ? 'நல்ல மதியம்' : 'மாலை வணக்கம்',
      telugu: hour < 12 ? 'శుభోదయం' : hour < 17 ? 'నమస्कार' : 'శుభ సాయంత్రం',
      kannada: hour < 12 ? 'ಶುಭೋದಯ' : hour < 17 ? 'ನಮಸ್ಕಾರ' : 'ಶುಭ ಸಾಯಂಕಾಲ',
      marathi: hour < 12 ? 'शुभ सकाळ' : hour < 17 ? 'नमस्कार' : 'शुभ संध्याकाळ',
      gujarati: hour < 12 ? 'સુપ્રભાત' : hour < 17 ? 'નમસ્તે' : 'શુભ સાંજ',
      bengali: hour < 12 ? 'সুপ্রভাত' : hour < 17 ? 'নমস্কার' : 'শুভ সন্ধ্যা'
    };
    
    return greetings[profile?.preferred_language as keyof typeof greetings] || greetings.english;
  };

  const getDashboardContent = (): DashboardContent => {
    const baseActions: QuickAction[] = [
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

    if (profile?.role === 'farmer') {
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
        ],
        quickActions: [
          ...baseActions,
          {
            title: 'Settings',
            description: 'Configure your preferences',
            icon: Settings,
            href: '/settings',
            color: 'bg-gray-500'
          }
        ]
      };
    }

    if (profile?.role === 'expert') {
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
        ],
        quickActions: [
          ...baseActions,
          {
            title: 'Expert Console',
            description: 'Help farmers with queries',
            icon: Users,
            href: '/expert/console',
            color: 'bg-indigo-500'
          },
          {
            title: 'Settings',
            description: 'Configure your preferences',
            icon: Settings,
            href: '/settings',
            color: 'bg-gray-500'
          }
        ]
      };
    }

    // Admin dashboard
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
      ],
      quickActions: [
        ...baseActions,
        {
          title: 'User Management',
          description: 'Manage users and roles',
          icon: Users,
          href: '/admin/users',
          color: 'bg-purple-500'
        },
        {
          title: 'Analytics',
          description: 'View system analytics',
          icon: BarChart3,
          href: '/admin/analytics',
          color: 'bg-orange-500'
        },
        {
          title: 'Settings',
          description: 'Configure your preferences',
          icon: Settings,
          href: '/settings',
          color: 'bg-gray-500'
        }
      ]
    };
  };

  const content = getDashboardContent();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getPersonalizedGreeting()}, {profile?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">Welcome back to your agricultural dashboard</p>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="secondary" className="capitalize">
                {profile?.role || 'farmer'}
              </Badge>
              {profile?.district && profile?.state && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.district}, {profile.state}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Profile Status</p>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✓ Complete
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {content.quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 shadow-md bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg`}>
                        <action.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
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

      {/* Recommendations and Crops */}
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

        {profile?.crop_types && profile.crop_types.length > 0 && (
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
  );
};