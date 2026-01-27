import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import ClubCard from '@/components/clubs/ClubCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, AlertCircle } from 'lucide-react';
import { ClubsService } from '@/services/clubs.service';
import { CategoriesService } from '@/services/categories.service';
import type { ClubWithCategory, Category } from '@/types/database.types';

const Clubs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = searchParams.get('category') || 'all';

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await CategoriesService.getAllCategories();
      if (result.error) throw result.error;
      return result.data;
    },
  });

  // Fetch clubs
  const { data: clubsData, isLoading: clubsLoading, error: clubsError } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const result = await ClubsService.getAllClubs();
      if (result.error) throw result.error;
      return result.data;
    },
  });

  // Client-side filtering
  const filteredClubs = useMemo(() => {
    if (!clubsData) return [];

    return clubsData.filter((club) => {
      const matchesCategory =
        activeCategory === 'all' || club.category_id === activeCategory;
      const matchesSearch =
        club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.short_description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [clubsData, activeCategory, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryId);
    }
    setSearchParams(searchParams);
  };

  const recruitingCount = filteredClubs.filter((c) => c.is_recruiting).length;
  const totalClubs = clubsData?.length || 0;

  // Prepare categories for display (add "all" option)
  const displayCategories = useMemo(() => {
    const allCategory = { id: 'all', name: '전체', icon: '🎯', display_order: 0, created_at: '' };
    return [allCategory, ...(categoriesData || [])];
  }, [categoriesData]);

  const isLoading = clubsLoading || categoriesLoading;

  return (
    <Layout>
      {/* Header */}
      <section className="hero-gradient py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
            동아리 목록
          </h1>
          <p className="text-primary-foreground/80">
            {isLoading ? (
              <Skeleton className="h-5 w-48" />
            ) : (
              `총 ${totalClubs}개의 연합동아리가 있습니다`
            )}
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
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-20" />
              ))
            ) : (
              displayCategories.map((category) => (
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
              ))
            )}
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
        {clubsError ? (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              동아리 목록을 불러오는 중 오류가 발생했습니다.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filteredClubs.length > 0 ? (
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
