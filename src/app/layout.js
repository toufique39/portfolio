import './globals.css';

export const metadata = {
  metadataBase: new URL(
    process.env._PUBLIC_APP_URL || "http://localhost:10000"
  ),

  title: {
    default: "Toufique Ahmed | Full-Stack Developer Portfolio",
    template: "%s | Toufique Ahmed",
  },

  description:
    "Toufique Ahmed is an IoT and Robotics Engineering student exploring Full-Stack Development, modern web technologies, and scalable software solutions.",

  applicationName: "Toufique Ahmed Portfolio",

  keywords: [
    "Toufique Ahmed",
    "Full-Stack Developer",
    "Next.js Developer",
    "React.js Developer",
    "JavaScript Developer",
    "TypeScript",
    "MongoDB",
    "IoT and Robotics Engineering",
    "Software Developer Portfolio",
  ],

  authors: [
    {
      name: "Toufique Ahmed",
    },
  ],

  creator: "Toufique Ahmed",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Toufique Ahmed Portfolio",
    title: "Toufique Ahmed | Full-Stack Developer Portfolio",
    description:
      "Explore my portfolio, technical skills, projects, education, and software development journey.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Toufique Ahmed Portfolio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Toufique Ahmed | Full-Stack Developer Portfolio",
    description:
      "Explore my software development projects, technical skills, and professional journey.",
    images: ["/opengraph-image"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
