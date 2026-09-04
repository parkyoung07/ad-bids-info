import { Metadata } from 'next';
import AdminVerifyClient from './AdminVerifyClient';

export const metadata: Metadata = {
  title: '비공개 관리자 7단계 원문 검수 스튜디오 | SignBid AI',
  description: '조달청 나라장터 공식 원문 1:1 대조 및 불변 감사로그 검수 시스템 (비공개)',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminVerifyPage() {
  return <AdminVerifyClient />;
}
