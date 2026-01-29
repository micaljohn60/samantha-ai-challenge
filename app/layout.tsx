import "./globals.css";
import Navbar from "@/components/Navbar/Navbar"; // your existing navbar

export const metadata = {
  title: "Samantha.ai",
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
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
