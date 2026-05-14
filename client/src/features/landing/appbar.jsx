import { useState } from 'react';
import settings from '../../context/settings';


// Button component
const Button = ({ children, variant = 'default', size = 'lg', className = '', onClick, ...props }) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
        default: 'bg-emerald-600 text-white hover:bg-emerald-700',
        outline: 'border-2 border-current bg-transparent hover:bg-white/10'
    };

    const sizes = {
        lg: 'h-12 px-8 text-base'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

// NEW APPBAR - Mobile Responsive with Fixed Height
export const AppBar = ({ onLogout, onSidebarLogout, isScrolled, isopacityon }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? isopacityon
                    ? 'bg-emerald-900/80 backdrop-blur-md shadow-lg'
                    : 'bg-emerald-900/95 backdrop-blur-md shadow-lg'
                : 'bg-transparent'
                }`}

        >
            <div className="container mx-auto px-4 flex items-center justify-between" style={{ height: '60px' }}>
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                        window.history.pushState({}, '', '/');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                >
                    <img src="/logo.png" alt="Logo" className="h-12 w-12 md:h-16 md:w-16 rounded-full" />

                    <span className="text-white font-bold text-base md:text-xl hidden sm:inline">
                        {settings.siteName}
                    </span>
                    <span className="text-white font-bold text-base md:text-sm sm:hidden">
                        {settings.siteName}
                    </span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">

                    <Button
                        variant="outline"
                        size="lg"
                        className="border-white/30 text-white hover:bg-white/10 h-10 px-6"
                        onClick={() => {
                            window.history.pushState({}, '', '/login');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                    >
                        Login
                    </Button>


                    <Button
                        variant="default"
                        size="lg"
                        className="bg-white text-emerald-900 h-10 px-6 hover:bg-white active:bg-white focus:bg-white shadow-2xl transition-all transform hover:scale-105 active:scale-95 focus:scale-105"

                        onClick={() => {
                            window.history.pushState({}, '', '/register');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        style={{ backgroundColor: 'white' }}
                        tabIndex={0}
                    >
                        <span className="text-emerald-900 font-semibold">Register</span>
                    </Button>






                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-emerald-900/98 backdrop-blur-md border-t border-white/10">
                    <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">

                        <div className="flex flex-col gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white/30 text-white hover:bg-white/10 w-full"
                                onClick={() => {
                                    window.history.pushState({}, '', '/login');
                                    window.dispatchEvent(new PopStateEvent('popstate'));
                                    setMobileMenuOpen(false);
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                variant="default"
                                size="lg"
                                className="bg-white text-emerald-900 h-10 px-6 hover:bg-white active:bg-white focus:bg-white shadow-2xl transition-all transform hover:scale-105 active:scale-95 focus:scale-105"

                                onClick={() => {
                                    window.history.pushState({}, '', '/register');
                                    window.dispatchEvent(new PopStateEvent('popstate'));
                                }}
                                style={{ backgroundColor: 'white' }}
                                tabIndex={0}
                            >
                                <span className="text-emerald-900 font-semibold">Register</span>
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default AppBar;