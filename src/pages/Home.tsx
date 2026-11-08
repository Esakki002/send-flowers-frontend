import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Reviews from '../components/Reviews';
import Pricing from '../components/Pricing';
import Compose from '../components/Compose';
import OrderHistory from '../components/OrderHistory';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="font-sans">
      <Navbar />
      <main className="mt-16">
        <Hero />
        <HowItWorks />
        <Features />
        <Reviews />
        <Pricing />
        <Compose />
        <OrderHistory />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Home;

