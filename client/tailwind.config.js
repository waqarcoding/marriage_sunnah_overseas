/** @type {import('tailwindcss').Config} */
export default {
    // Add .ts and .tsx if you use TypeScript/React files
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Standard brand colors
                brand: {
                    DEFAULT: "#7C3AED",
                    light: "#A78BFA",
                    dark: "#5B21B6",
                },
                // CSS variable tokens (ensure your CSS defines these variables)
                primary: "var(--primary)",
                secondary: "var(--muted)",
                "muted-foreground": "var(--muted-foreground)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                card: "var(--card)",
                "card-foreground": "var(--card-foreground)",
                muted: "var(--muted)",
                "muted-foreground": "var(--muted-foreground)",
                border: "var(--border)",
                ring: "var(--ring)",
                destructive: "var(--destructive)",
                "destructive-foreground": "var(--destructive-foreground)",
                accent: "var(--accent)",
                "accent-foreground": "var(--accent-foreground)",
                popover: "var(--popover)",
                "popover-foreground": "var(--popover-foreground)",
                // Default text color using foreground variable
                text: "var(--foreground)",
                "text-heading": "#1a2e27",
                "text-title": "#f5f0e8",
                "text-subtitle": "#5a7a70",
                // Remove unused/unsupplied utility aliases if necessary for debugging
            },
            fontFamily: {
                display: ['Syne', 'sans-serif'],
                body: ['DM Sans', 'sans-serif'],
                // Only reference CSS variables if they are defined in :root
                sans: ['var(--font-sans)', 'sans-serif'],
                serif: ['var(--font-serif)', 'serif'],
                mono: ['var(--font-mono)', 'monospace'],
                rounded: ['var(--font-rounded)', 'sans-serif'],
            },
            borderRadius: {
                sm: "var(--radius-sm)",
                md: "var(--radius-md)",
                lg: "var(--radius-lg)",
                xl: "var(--radius-xl)",
            },
        },
    },
    plugins: [],
};