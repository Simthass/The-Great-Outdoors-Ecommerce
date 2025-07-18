import React from 'react';
import Header from './components/header'; // Import the Header component
import { Bold } from 'lucide-react';

const App = () => {
  return (
    // This div will serve as the main container for your entire application.
    // The background image for the hero section should be applied here
    // so that the semi-transparent header can sit on top of it.
    <div
      className="min-h-screen bg-cover bg-center font-sans text-gray-800"
      style={{
        backgroundImage: "url('/hero-background.png')",
        backgroundAttachment: 'fixed', // Makes the background fixed while scrolling
      }}
    >
      {/* The Header component */}
      <Header />

      {/* Main content of your page will go here */}
      <main className="relative z-10 p-8 text-center text-white min-h-[calc(100vh-76px)] ">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 mt-[110px]" style={{fontSize:70, color:'white', fontWeight:Bold}}>Gear Up for Your <br></br>Next Adventures Trip</h1>
        <p style={{lineHeight:2, color:'white',fontSize:15}}>Discover premium outdoor equipment for camping, hiking, and adventure sports. From mountain peaks to <br></br>forest trails, we've got everything you need to explore the great outdoors.</p>
      </main>

      {/* You can add a Footer component here later */}
      {/* <Footer /> */}
    </div>
  );
};

export default App;