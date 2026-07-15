import './globals.css'; // Assuming you have a globals.css file
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata = {
    title: 'NovaLearn Platform',
    description: 'AI Powered Learning Platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // suppressHydrationWarning is needed here because the theme class is set client-side
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}