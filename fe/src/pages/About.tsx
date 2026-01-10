import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Heart, Award } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Users,
      title: '함께하는 성장',
      description: '동아리 활동을 통해 함께 배우고 성장하는 문화를 만듭니다.',
    },
    {
      icon: Target,
      title: '목표 달성',
      description: '각 동아리의 목표 달성을 위해 적극적으로 지원합니다.',
    },
    {
      icon: Heart,
      title: '열정과 도전',
      description: '새로운 도전을 두려워하지 않는 열정적인 문화를 추구합니다.',
    },
    {
      icon: Award,
      title: '우수성 추구',
      description: '대내외 활동에서 우수한 성과를 달성하도록 장려합니다.',
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="hero-gradient py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              총동아리연합회 소개
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80">
              대학교 연합동아리들의 건강한 발전과 학생들의 다양한 활동을
              지원하기 위해 노력하고 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">우리의 미션</h2>
            <p className="text-lg text-muted-foreground">
              총동아리연합회는 모든 연합동아리가 자유롭게 활동하고 성장할 수
              있는 환경을 만들어 갑니다. 학생들이 다양한 경험을 통해 성장하고,
              뜻 맞는 친구들을 만나 함께할 수 있도록 지원합니다.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Organization */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">조직 구성</h2>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">회장단</h3>
                  <p className="text-muted-foreground">
                    총동아리연합회를 대표하고, 전체 운영을 총괄합니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">기획부</h3>
                  <p className="text-muted-foreground">
                    동아리 박람회, 연합 행사 등 주요 행사를 기획하고 운영합니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">홍보부</h3>
                  <p className="text-muted-foreground">
                    총동연 및 소속 동아리들의 홍보 활동을 담당합니다.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">재정부</h3>
                  <p className="text-muted-foreground">
                    예산 관리 및 동아리 지원금 배분을 담당합니다.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">문의하기</h2>
            <p className="text-muted-foreground mb-8">
              총동아리연합회에 대해 궁금한 점이 있으시면 언제든지 연락주세요.
            </p>
            <Card>
              <CardContent className="p-6 space-y-3">
                <p>
                  <span className="font-medium">위치:</span> 학생회관 201호
                </p>
                <p>
                  <span className="font-medium">전화:</span> 02-1234-5678
                </p>
                <p>
                  <span className="font-medium">이메일:</span>{' '}
                  club@university.ac.kr
                </p>
                <p>
                  <span className="font-medium">운영시간:</span> 평일 10:00 -
                  18:00
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
