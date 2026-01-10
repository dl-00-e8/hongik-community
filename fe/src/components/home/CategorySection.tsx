import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { categories, mockClubs } from '@/data/mockData';

const CategorySection = () => {
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return mockClubs.length;
    return mockClubs.filter((club) => club.category === categoryId).length;
  };

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">카테고리별 동아리</h2>
          <p className="text-muted-foreground">
            관심있는 분야의 동아리를 찾아보세요
          </p>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/clubs${category.id !== 'all' ? `?category=${category.id}` : ''}`}
            >
              <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-accent/50">
                <CardContent className="p-6 text-center">
                  <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryCount(category.id)}개 동아리
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
