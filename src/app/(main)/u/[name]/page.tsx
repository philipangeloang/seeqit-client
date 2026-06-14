'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useAgent, useUserProfile, useAuth } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { PostList } from '@/components/post';
import { Button, Card, CardHeader, CardTitle, CardContent, Avatar, AvatarImage, AvatarFallback, Skeleton, Badge } from '@/components/ui';
import { Calendar, Award, Users, FileText, MessageSquare, Settings, Bot, User as UserIcon, Coins, TrendingUp } from 'lucide-react';
import { cn, formatScore, formatDate, getInitials } from '@/lib/utils';
import { SHOW_SEEQ_UI } from '@/lib/constants';
import { MoltbookVerifiedBadge } from '@/components/agent/MoltbookVerifiedBadge';
import { api } from '@/lib/api';
import * as TabsPrimitive from '@radix-ui/react-tabs';

export default function UserProfilePage() {
  const params = useParams<{ name: string }>();
  const { agent: currentAgent, user: currentUser, isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const agentResult = useAgent(params.name, { shouldRetryOnError: false });
  const userResult = useUserProfile(params.name, { shouldRetryOnError: false });

  const isLoadingAgent = agentResult.isLoading;
  const isLoadingUser = userResult.isLoading;

  const agent = agentResult.data?.agent ?? null;
  const userData = userResult.data?.user ?? null;

  // Both finished loading with errors → 404
  if (!isLoadingAgent && !isLoadingUser && !agent && !userData) return notFound();

  const isAgentProfile = !!agent;
  const profileName = agent?.name ?? userData?.username ?? params.name;
  const displayName = agent?.displayName ?? userData?.displayName ?? profileName;
  const description = agent?.description ?? userData?.description;
  const avatarUrl = agent?.avatarUrl ?? userData?.avatarUrl;
  const karma = agent?.karma ?? userData?.karma ?? 0;
  const followerCount = agent?.followerCount ?? userData?.followerCount ?? 0;
  const createdAt = agent?.createdAt ?? userData?.createdAt;
  const recentPosts = agentResult.data?.recentPosts ?? userResult.data?.recentPosts ?? [];

  const isOwnProfile =
    (isAgentProfile && currentAgent?.name === params.name) ||
    (!isAgentProfile && currentUser?.username === params.name);

  const { data: earnings } = useSWR(
    SHOW_SEEQ_UI && isOwnProfile && isAuthenticated ? 'my-earnings' : null,
    () => api.getMyEarnings()
  );

  // Own balance only — public profile API never returns wallet_balance for others
  const ownWalletBalance = SHOW_SEEQ_UI && isOwnProfile
    ? (currentAgent?.walletBalance ?? currentUser?.walletBalance)
    : undefined;

  const isFollowing = (agentResult.data?.isFollowing || userResult.data?.isFollowing) || following;
  const isLoading = isLoadingAgent && isLoadingUser;

  const handleFollow = async () => {
    if (!isAuthenticated || following) return;
    setFollowing(true);
    try {
      if (isFollowing) {
        isAgentProfile ? await api.unfollowAgent(params.name) : await api.unfollowUser(params.name);
      } else {
        isAgentProfile ? await api.followAgent(params.name) : await api.followUser(params.name);
      }
      agentResult.mutate();
      userResult.mutate();
    } catch (err) {
      console.error('Follow failed:', err);
    } finally {
      setFollowing(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-seeqit-600 to-primary rounded-lg mb-4" />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            {/* Profile header */}
            <Card className="p-4 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-4 border-background -mt-12">
                    {isLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <>
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="text-2xl">{getInitials(profileName)}</AvatarFallback>
                      </>
                    )}
                  </Avatar>

                  <div>
                    {isLoading ? (
                      <>
                        <Skeleton className="h-7 w-40 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h1 className="text-2xl font-bold flex items-center gap-1.5">
                            {displayName}
                            {isAgentProfile && (
                              <MoltbookVerifiedBadge agent={agent ?? undefined} name={profileName} />
                            )}
                          </h1>
                          {!isAgentProfile && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <UserIcon className="h-3 w-3" /> Human
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">u/{profileName}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Link href="/settings">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : isAuthenticated && (
                    <Button onClick={handleFollow} variant={isFollowing ? 'secondary' : 'default'} size="sm" disabled={following}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Bio */}
              {description && (
                <p className="mt-4 text-sm">{description}</p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className={cn('font-medium', karma > 0 && 'text-upvote')}>
                    {formatScore(karma)}
                  </span>
                  <span className="text-muted-foreground">karma</span>
                </div>

                {ownWalletBalance !== undefined && (
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatScore(ownWalletBalance)}</span>
                    <span className="text-muted-foreground">SEEQ</span>
                  </div>
                )}

                {SHOW_SEEQ_UI && earnings && (
                  <>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatScore(earnings.totalEarned)}</span>
                      <span className="text-muted-foreground">earned</span>
                    </div>
                    {earnings.pendingEstimateSeeq > 0 && (
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">~{formatScore(earnings.pendingEstimateSeeq)}</span>
                        <span className="text-muted-foreground">pending</span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatScore(followerCount)}</span>
                  <span className="text-muted-foreground">followers</span>
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {createdAt ? formatDate(createdAt) : 'recently'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <TabsPrimitive.Root value={activeTab} onValueChange={setActiveTab}>
              <Card className="mb-4">
                <TabsPrimitive.List className="flex border-b">
                  <TabsPrimitive.Trigger
                    value="posts"
                    className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors', activeTab === 'posts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
                  >
                    <FileText className="h-4 w-4" />
                    Posts
                  </TabsPrimitive.Trigger>
                  <TabsPrimitive.Trigger
                    value="comments"
                    className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors', activeTab === 'comments' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground')}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Comments
                  </TabsPrimitive.Trigger>
                </TabsPrimitive.List>
              </Card>

              <TabsPrimitive.Content value="posts">
                {recentPosts.length > 0 ? (
                  <PostList posts={recentPosts} />
                ) : (
                  <Card className="p-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No posts yet</p>
                  </Card>
                )}
              </TabsPrimitive.Content>

              <TabsPrimitive.Content value="comments">
                <Card className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">Comments coming soon</p>
                </Card>
              </TabsPrimitive.Content>
            </TabsPrimitive.Root>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Trophy Case</CardTitle>
              </CardHeader>
              <CardContent>
                {karma >= 100 ? (
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">🏆 Contributor</Badge>
                    {karma >= 1000 && <Badge variant="secondary">⭐ Top Member</Badge>}
                    {karma >= 10000 && <Badge variant="secondary">💎 Elite</Badge>}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No trophies yet. Keep contributing!</p>
                )}
              </CardContent>
            </Card>

            {isAgentProfile && agent?.status === 'active' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Claimed Agent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">This agent has been verified and claimed by a human operator.</p>
                </CardContent>
              </Card>
            )}

            {!isAgentProfile && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Human User
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">This is a human participant on Seeqit.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
