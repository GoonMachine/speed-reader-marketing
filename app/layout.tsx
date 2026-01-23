export const metadata = {
  title: 'Speed Reader Video Generator',
  description: 'Generate speed reading videos from tweets and articles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
