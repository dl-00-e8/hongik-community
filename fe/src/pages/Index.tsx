import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedClubs from '@/components/home/FeaturedClubs';
import CategorySection from '@/components/home/CategorySection';
import RecentActivities from '@/components/home/RecentActivities';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedClubs />
      <CategorySection />
      <RecentActivities />
    </Layout>
  );
};

export default Index;
