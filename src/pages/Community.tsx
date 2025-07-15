import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Users, Calendar, Video, Star, ThumbsUp, HelpCircle, CheckCircle, Bookmark, Plus, Search, Filter, Clock, Globe, TrendingUp, Award, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[] | null;
  images: string[] | null;
  likes_count: number | null;
  comments_count: number | null;
  is_resolved: boolean | null;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string | null;
    role: string | null;
  };
  reactions?: PostReaction[];
}

interface Expert {
  id: string;
  user_id: string;
  specialization: string;
  experience_years: number | null;
  location: string | null;
  bio: string | null;
  rating: number | null;
  total_consultations: number | null;
  is_verified: boolean | null;
  profiles?: {
    full_name: string | null;
  };
}

interface PostReaction {
  id: string;
  reaction_type: string;
  user_id: string;
}

interface UserReputation {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  posts_count: number;
  helpful_answers: number;
  best_answers: number;
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string | null;
  crop_type: string | null;
  region: string | null;
  member_count: number;
  is_private: boolean;
  created_by: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string;
  location: string | null;
  is_online: boolean;
  max_participants: number | null;
  current_participants: number;
  created_by: string;
}

const Community = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [userReputation, setUserReputation] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'question', tags: '' });
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (user) {
      fetchCommunityData();
      initializeUserReputation();
      subscribeToRealtimeUpdates();
    }
  }, [user]);

  const subscribeToRealtimeUpdates = () => {
    const postsChannel = supabase
      .channel('community-posts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'community_posts' },
        () => fetchCommunityData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'post_reactions' },
        () => fetchCommunityData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  };

  const initializeUserReputation = async () => {
    if (!user) return;

    const { data: existingReputation } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!existingReputation) {
      await supabase
        .from('user_reputation')
        .insert({
          user_id: user.id,
          total_points: 0,
          level: 1,
          posts_count: 0,
          helpful_answers: 0,
          best_answers: 0
        });
    }
  };

  const fetchCommunityData = async () => {
    try {
      setLoading(true);

      // Fetch posts with reactions
      const { data: postsData } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!community_posts_user_id_fkey(full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch reactions for posts
      if (postsData) {
        const postIds = postsData.map(post => post.id);
        const { data: reactionsData } = await supabase
          .from('post_reactions')
          .select('*')
          .in('post_id', postIds);

        const postsWithReactions = postsData.map(post => ({
          ...post,
          profiles: post.profiles || { full_name: null, role: null },
          reactions: reactionsData?.filter(reaction => reaction.post_id === post.id) || []
        })) as CommunityPost[];

        setPosts(postsWithReactions);
      }

      // Fetch experts
      const { data: expertsData } = await supabase
        .from('expert_network')
        .select(`
          *,
          profiles!expert_network_user_id_fkey(full_name)
        `)
        .order('rating', { ascending: false })
        .limit(20);

      if (expertsData) {
        const expertsWithProfiles = expertsData.map(expert => ({
          ...expert,
          profiles: expert.profiles || { full_name: null }
        })) as Expert[];
        setExperts(expertsWithProfiles);
      }

      // Fetch groups
      const { data: groupsData } = await supabase
        .from('community_groups')
        .select('*')
        .eq('is_private', false)
        .order('member_count', { ascending: false })
        .limit(10);

      if (groupsData) setGroups(groupsData);

      // Fetch events
      const { data: eventsData } = await supabase
        .from('community_events')
        .select('*')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10);

      if (eventsData) setEvents(eventsData);

      // Fetch user reputation
      if (user) {
        const { data: reputationData } = await supabase
          .from('user_reputation')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (reputationData) setUserReputation(reputationData);
      }

    } catch (error) {
      console.error('Error fetching community data:', error);
      toast({
        title: "Error",
        description: "Failed to load community data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          category: newPost.category,
          tags: newPost.tags ? newPost.tags.split(',').map(tag => tag.trim()) : null,
        });

      if (error) throw error;

      setNewPost({ title: '', content: '', category: 'question', tags: '' });
      setShowNewPostDialog(false);
      
      toast({
        title: "Success",
        description: "Your post has been created successfully!",
      });

      fetchCommunityData();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post.",
        variant: "destructive",
      });
    }
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    if (!user) return;

    try {
      // Check if user already reacted with this type
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .single();

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Add reaction
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });
      }

      fetchCommunityData();
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const getReactionCount = (post: CommunityPost, reactionType: string) => {
    return post.reactions?.filter(r => r.reaction_type === reactionType).length || 0;
  };

  const hasUserReacted = (post: CommunityPost, reactionType: string) => {
    return post.reactions?.some(r => r.reaction_type === reactionType && r.user_id === user?.id) || false;
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse">Loading community...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with User Stats */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Community Dashboard
            </CardTitle>
            <CardDescription>
              Connect with farmers, ask questions, and share knowledge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{posts.length} Posts</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{experts.length} Experts</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{groups.length} Groups</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{events.length} Events</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {userReputation && (
          <Card className="lg:w-80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your Reputation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Level {userReputation.level}</span>
                <Badge variant="secondary">{userReputation.total_points} points</Badge>
              </div>
              <Progress value={(userReputation.total_points % 100)} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">{userReputation.posts_count}</div>
                  <div className="text-muted-foreground">Posts</div>
                </div>
                <div>
                  <div className="font-medium">{userReputation.helpful_answers}</div>
                  <div className="text-muted-foreground">Helpful</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="experts" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Experts
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
                <SelectItem value="discussion">Discussions</SelectItem>
                <SelectItem value="tip">Tips & Advice</SelectItem>
                <SelectItem value="problem">Problems</SelectItem>
                <SelectItem value="success">Success Stories</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ask Question
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Post</DialogTitle>
                  <DialogDescription>
                    Share your question or knowledge with the community
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                  <Select
                    value={newPost.category}
                    onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="tip">Tip & Advice</SelectItem>
                      <SelectItem value="problem">Problem</SelectItem>
                      <SelectItem value="success">Success Story</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Describe your question or share your knowledge..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                  />
                  <Input
                    placeholder="Tags (comma separated)..."
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreatePost} className="flex-1">
                      Create Post
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={post.is_resolved ? "default" : "secondary"}>
                          {post.category}
                        </Badge>
                        {post.is_resolved && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {post.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{post.profiles?.full_name || 'Anonymous'}</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.content}</p>
                  
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant={hasUserReacted(post, 'like') ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleReaction(post.id, 'like')}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {getReactionCount(post, 'like')}
                      </Button>
                      <Button
                        variant={hasUserReacted(post, 'helpful') ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleReaction(post.id, 'helpful')}
                        className="flex items-center gap-1"
                      >
                        <HelpCircle className="h-4 w-4" />
                        {getReactionCount(post, 'helpful')}
                      </Button>
                      <Button
                        variant={hasUserReacted(post, 'bookmark') ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleReaction(post.id, 'bookmark')}
                        className="flex items-center gap-1"
                      >
                        <Bookmark className="h-4 w-4" />
                        {getReactionCount(post, 'bookmark')}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments_count || 0} replies</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Experts Tab */}
        <TabsContent value="experts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((expert) => (
              <Card key={expert.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {expert.profiles?.full_name?.charAt(0) || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {expert.profiles?.full_name || 'Expert'}
                        {expert.is_verified && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{expert.specialization}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Experience:</span>
                    <span className="font-medium">{expert.experience_years || 0} years</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{expert.rating || 0}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Consultations:</span>
                    <span className="font-medium">{expert.total_consultations || 0}</span>
                  </div>
                  {expert.location && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Location:</span>
                      <span className="font-medium">{expert.location}</span>
                    </div>
                  )}
                  {expert.bio && (
                    <p className="text-sm text-muted-foreground">{expert.bio}</p>
                  )}
                  <Button className="w-full" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Book Consultation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {group.name}
                  </CardTitle>
                  {group.crop_type && (
                    <Badge variant="secondary">{group.crop_type}</Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.description && (
                    <p className="text-sm text-muted-foreground">{group.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span>Members:</span>
                    <span className="font-medium">{group.member_count}</span>
                  </div>
                  {group.region && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Region:</span>
                      <span className="font-medium">{group.region}</span>
                    </div>
                  )}
                  <Button className="w-full" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        {event.title}
                      </CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {event.event_type}
                      </Badge>
                    </div>
                    {event.is_online && (
                      <Badge variant="secondary">
                        <Globe className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-muted-foreground">{event.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start:</span>
                      <div className="font-medium">
                        {new Date(event.start_time).toLocaleDateString()} at{' '}
                        {new Date(event.start_time).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium">
                        {Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60 * 60))} hours
                      </div>
                    </div>
                  </div>
                  {event.location && !event.is_online && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-medium">{event.location}</div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Participants:</span>
                      <span className="font-medium ml-1">
                        {event.current_participants}
                        {event.max_participants && ` / ${event.max_participants}`}
                      </span>
                    </div>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Community Leaderboard
              </CardTitle>
              <CardDescription>
                Top contributors in our farming community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Leaderboard data will be available soon</p>
                <p className="text-sm mt-2">Start contributing to earn your spot!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Community;