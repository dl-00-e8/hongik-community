import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ClubCard from '@/components/clubs/ClubCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { mockClubs, categories } from '@/data/mockData';

const Clubs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeCategory = searchParams.get('category') || 'all';

  const filteredClubs = useMemo(() => {
    return mockClubs.filter((club) => {
      const matchesCategory =
        activeCategory === 'all' || club.category === activeCategory;
      const matchesSearch =
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  const recruitingCount = filteredClubs.filter((c) => c.isRecruiting).length;

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            동아리 목록
          </h1>
          <p className="text-primary-foreground/80">
            총 {mockClubs.length}개의 연합동아리가 있습니다
          </p>
        </div>
      </section>

      <div className="container py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="동아리 이름 또는 소개로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category filter badges */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className="flex items-center gap-1"
              >
                <span>{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filteredClubs.length}개의 동아리
          </span>
          {recruitingCount > 0 && (
            <Badge variant="secondary" className="bg-[hsl(var(--badge-recruitment))]/10 text-[hsl(var(--badge-recruitment))]">
              {recruitingCount}개 모집중
            </Badge>
          )}
        </div>

        {/* Club grid */}
        {filteredClubs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredClubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              검색 결과가 없습니다.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                handleCategoryChange('all');
              }}
            >
              필터 초기화
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Clubs;
