import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ActivityFeed from '@/components/clubs/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  User,
  Clock,
  Instagram,
  Users,
} from 'lucide-react';
import { mockClubs, mockActivities } from '@/data/mockData';

const ClubDetail = () => {
  const { id } = useParams<{ id: string }>();
  const club = mockClubs.find((c) => c.id === id);
  const activities = mockActivities.filter((a) => a.clubId === id);

  if (!club) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">동아리를 찾을 수 없습니다</h1>
          <Button asChild>
            <Link to="/clubs">목록으로 돌아가기</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Simple markdown to HTML conversion
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-3xl font-bold mb-4 mt-6 first:mt-0">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-2xl font-semibold mb-3 mt-5">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-xl font-semibold mb-2 mt-4">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="ml-4 mb-1 list-disc">
            {line.slice(2)}
          </li>
        );
      } else if (line.match(/^\d+\. /)) {
        const content = line.replace(/^\d+\. /, '');
        elements.push(
          <li key={index} className="ml-4 mb-1 list-decimal">
            {content}
          </li>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={index}
            className="border-l-4 border-accent pl-4 italic my-4 text-muted-foreground"
          >
            {line.slice(2)}
          </blockquote>
        );
      } else if (line.trim() === '') {
        elements.push(<br key={index} />);
      } else {
        // Handle bold text
        const formattedLine = line.replace(
          /\*\*(.*?)\*\*/g,
          '<strong>$1</strong>'
        );
        elements.push(
          <p
            key={index}
            className="mb-2"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }
    });

    return elements;
  };

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="container">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 mb-4"
          >
            <Link to="/clubs" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              목록으로
            </Link>
          </Button>

          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0">
                  {club.category}
                </Badge>
                {club.isRecruiting && (
                  <Badge className="bg-[hsl(var(--badge-recruitment))] text-[hsl(var(--badge-recruitment-foreground))]">
                    모집중
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                {club.name}
              </h1>
              <p className="text-primary-foreground/80 text-lg">
                {club.shortDescription}
              </p>
            </div>

            {club.isRecruiting && (
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                지원하기
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="intro" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="intro">소개</TabsTrigger>
                <TabsTrigger value="activities">활동 피드</TabsTrigger>
              </TabsList>

              <TabsContent value="intro" className="mt-6">
                <Card>
                  <CardContent className="pt-6 prose prose-sm max-w-none">
                    {renderMarkdown(club.description)}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activities" className="mt-6">
                <ActivityFeed activities={activities} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Club Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">동아리 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">회장</p>
                    <p className="font-medium">{club.president}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">연락처</p>
                    <p className="font-medium">{club.contact}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">동아리방</p>
                    <p className="font-medium">{club.clubRoom}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">정규 모임</p>
                    <p className="font-medium">{club.regularSchedule}</p>
                  </div>
                </div>

                {club.memberCount && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">회원 수</p>
                      <p className="font-medium">{club.memberCount}명</p>
                    </div>
                  </div>
                )}

                {club.instagramHandle && (
                  <div className="flex items-start gap-3">
                    <Instagram className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Instagram</p>
                      <a
                        href={`https://instagram.com/${club.instagramHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-accent hover:underline"
                      >
                        @{club.instagramHandle}
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recruitment Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">모집 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">모집 기간</p>
                    <p className="font-medium">
                      {formatDate(club.recruitmentStart)} ~{' '}
                      {formatDate(club.recruitmentEnd)}
                    </p>
                  </div>
                </div>

                {club.isRecruiting ? (
                  <div className="p-3 rounded-lg bg-[hsl(var(--badge-recruitment))]/10 text-center">
                    <p className="text-sm font-medium text-[hsl(var(--badge-recruitment))]">
                      현재 모집 중입니다!
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-muted text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      모집이 종료되었습니다
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClubDetail;
