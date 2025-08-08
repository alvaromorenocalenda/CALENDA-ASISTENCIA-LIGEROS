import "./globals.css";

export const metadata = {
  title: "Calenda Asistencia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
