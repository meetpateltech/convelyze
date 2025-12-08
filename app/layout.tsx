import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Convelyze - ChatGPT usage, visualized",
  description: "Your ChatGPT conversations, visualized",
  keywords: [
    "ChatGPT",
    "ChatGPT Conversation analysis",
    "ChatGPT Data analysis",
    "conversations.json",
    "ChatGPT usage statistics",
    "ChatGPT exported data",
    "ChatGPT Wrapped"
  ],
  openGraph: {
    title: 'Convelyze - Your ChatGPT usage, visualized',
    description: 'See your ChatGPT conversations in a whole new way. Our simple and easy-to-use dashboard shows you how you are using ChatGPT',
    images: [
      {
        url: 'https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/open-graph.png',
        width: 1200,
        height: 630,
        alt: 'Convelyze Open Graph Image',
      },
    ],
    siteName: 'Convelyze',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convelyze - Your ChatGPT usage, visualized',
    description: 'See your ChatGPT conversations in a whole new way. Our simple and easy-to-use dashboard shows you how you are using ChatGPT',
    images: ['https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/open-graph.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" richColors />
          </ThemeProvider>
      </body>
    </html>
  );
}
