import React from 'react'
import { Helmet } from 'react-helmet-async'
import { FaCode, FaMobile, FaRocket, FaArrowRight} from 'react-icons/fa'
import { MdDesignServices } from 'react-icons/md'
import { IoSparkles } from 'react-icons/io5'

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Free Pizza & Networking - Tech2Gether</title>
        <meta name="description" content="Something sometheing" />
        <meta name="keywords" content="Ozarks Tech, Club, Community, Meetup" />
        <meta property="og:title" content="Tech2Gether - Home" />
        <meta property="og:description" content="Something sometheing" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <IoSparkles className="text-6xl animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">2 Tech 2 Gether</h1>
          <p className="text-xl md:text-2xl opacity-90 italic">Something smart and funny here</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">About This Page</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This is a simple home page created with React and styled with Tailwind CSS. 
            It demonstrates clean, modern design with minimal code.
          </p>
        </div>

        {/* Simple Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <FaCode className="text-4xl text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Simple</h3>
            <p className="text-gray-600">Clean and minimal design approach.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <MdDesignServices className="text-4xl text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Modern</h3>
            <p className="text-gray-600">Built with the latest web technologies.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <FaMobile className="text-4xl text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Responsive</h3>
            <p className="text-gray-600">Works perfectly on all devices.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-flex items-center gap-2">
            <FaRocket />
            Get Started
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
