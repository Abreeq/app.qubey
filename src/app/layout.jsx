import { Nata_Sans, Montserrat } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Providers } from "./provider";
import Navbar from "./components/Navbar";

const nataSans = Nata_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nata-sans",
  display: "swap",
  fallback: ["sans-serif"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata = {
  title: "Qubey App",
  description: "UAE’s First AI-Powered Cybersecurity & Compliance platform ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${nataSans.variable} ${montserrat.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </Providers>
      </body>
    </html>
  );
};