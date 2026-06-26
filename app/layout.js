import './globals.css';

export const metadata = {
  title: '휴지 슛! 콧물 쏙!',
  description: '휴지 슛 게임과 어린이 AI 친구'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
