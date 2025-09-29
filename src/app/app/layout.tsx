import { AppLayout } from '@/components/layout/AppLayout';

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}