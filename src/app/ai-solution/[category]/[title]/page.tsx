import AISolutionPage from '@/components/AISolutionPage';

export default function Page({ params }: { params: { category: string; title: string } }) {
  return <AISolutionPage params={params} />;
}
