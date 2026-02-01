import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "Roo Code Commit Analysis",
	description: "Analyze commit history, risk scores, and regression patterns",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<div className="min-h-screen bg-background">
					<header className="border-b">
						<div className="container mx-auto px-4 py-4 flex items-center gap-8">
							<Link href="/" className="text-xl font-bold hover:text-primary">
								Roo Code Commit Analysis
							</Link>
							<nav className="flex gap-6 text-sm">
								<Link href="/" className="text-muted-foreground hover:text-foreground">
									Timeline
								</Link>
								<Link href="/patterns" className="text-muted-foreground hover:text-foreground">
									Patterns
								</Link>
								<Link href="/sync" className="text-muted-foreground hover:text-foreground">
									Sync Advisor
								</Link>
							</nav>
						</div>
					</header>
					<main className="container mx-auto px-4 py-6">{children}</main>
				</div>
			</body>
		</html>
	)
}
