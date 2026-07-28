import "./globals.css";
import { config } from "@fortawesome/fontawesome-svg-core";

import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

export const metadata = {
  title: "Sammy.ai",
  description: "Patient & Document Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-300 w-full">
        <main className="min-h-screen bg-slate-50">{children}</main>
      </body>
    </html>
  );
}
