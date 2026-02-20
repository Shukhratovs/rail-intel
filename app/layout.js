export const metadata = {
  title: 'Rail Intel — O\'zbekiston Temir Yo\'llari Monitoring',
  description: 'Haftalik poyezd reyslari monitoringi va tahlili',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body style={{ margin: 0, padding: 0, background: '#0a0c10' }}>
        {children}
      </body>
    </html>
  )
}
