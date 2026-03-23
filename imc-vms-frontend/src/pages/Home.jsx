import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Home.css';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/home/HeroSection';
import TrustSection from '../components/home/TrustSection';
import Footer from '../components/layout/Footer';
import LoginModal from '../components/auth/LoginModal';

const Home = () => {
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const shouldOpenLogin = params.get('login') === '1';
        if (shouldOpenLogin) setLoginModalOpen(true);
    }, [location.search]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar onLoginClick={() => setLoginModalOpen(true)} />

            <main style={{ flex: 1 }}>
                <HeroSection />
                <TrustSection />
            </main>

            <Footer />

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setLoginModalOpen(false)}
            />
        </div>
    );
};

export default Home;
