import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { FaTrophy, FaFlag, FaCode, FaRocket, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa'
import Hero from '../components/Hero'
import Card from '../components/Card'

function Events() {

  // Ensure title updates when component mounts
  useEffect(() => {
    document.title = 'Events - Tech2Gether';
  }, []);

  return (
    <div className="min-h-screen bg-light-gray">
      <Helmet key="events-helmet">
        <title>Events - Tech2Gether</title>
        <meta name="description" content="Join Tech2Gether for exciting events and networking opportunities" />
        <meta name="keywords" content="Tech2Gether, Events, Ozarks Tech, Technology, Programming, Networking" />
        <meta property="og:title" content="Events - Tech2Gether" />
        <meta property="og:description" content="Participate in Tech2Gether events to connect with fellow tech enthusiasts" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <Hero 
        title="Events"
        subtitle="Discover our upcoming events at Ozarks Tech"
      />

      <div className="container mx-auto px-4 py-20">

        {/* Events Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-binary-blue">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Join us for exciting events throughout the academic year! From hackathons to cybersecurity competitions, there's something for everyone.
            </p>
          </div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 max-w-6xl mx-auto">

            {/* Ozzy's Cyber Heist CTF Event */}
            <Card
              id="ctf"
              icon={FaFlag}
              iconColor="text-yaml-yellow"
              title="Ozzy's Cyber Heist"
              subtitle="Capture the Flag Competition"
              subtitleBg="bg-yaml-yellow"
              subtitleText="text-binary-blue"
              borderColor="border-t-yaml-yellow"
              details={[
                { icon: FaCalendarAlt, text: "April 2026", color: "text-yaml-yellow" },
                { icon: FaClock, text: "Time TBD", color: "text-yaml-yellow" },
                { icon: FaMapMarkerAlt, text: "Springfield Campus - Room TBD", color: "text-yaml-yellow" }
              ]}
              description="Join us for our first annual Capture the Flag at Ozarks Tech! Test your cybersecurity skills in this exciting competition. Registration is opening soon - join our mailing list to be notified when it opens."
              additionalInfo={<><strong>Registration:</strong> TBA, Join our mailing list to be notified. </>}
              button={{
                text: "Join Mailing List",
                icon: FaInfoCircle,
                className: "bg-yaml-yellow text-binary-blue hover:bg-analog-aquamarine hover:text-white",
                external: true,
                href: "https://forms.cloud.microsoft/r/JkXsy6fDrQ?origin=lprLink"
              }}
            />

            {/* Hack2Gether Hackathon */}
            <Card
              id="hackathon"
              icon={FaCode}
              iconColor="text-analog-aquamarine"
              title="Hack2Gether"
              subtitle="Hackathon Event"
              subtitleBg="bg-analog-aquamarine"
              subtitleText="text-white"
              borderColor="border-t-analog-aquamarine"
              details={[
                { icon: FaCalendarAlt, text: "Spring Semester 2025", color: "text-analog-aquamarine" },
                { icon: FaClock, text: "Time TBD", color: "text-analog-aquamarine" },
                { icon: FaMapMarkerAlt, text: "Springfield Campus - Room TBD", color: "text-analog-aquamarine" }
              ]}
              description="Our signature hackathon event is coming in the Spring Semester! Join teams, build innovative projects, and compete for prizes. Perfect for students of all skill levels."
              additionalInfo={<><strong>Status:</strong> Planning Phase - More details coming soon!</>}
              button={{
                text: "Stay Tuned for Updates",
                icon: FaRocket,
                className: "bg-analog-aquamarine text-white hover:bg-binary-blue"
              }}
            />
          </div>
        </div>

        {/* Sponsorship Section */}
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 py-16 px-8 rounded-3xl shadow-inner mb-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <FaTrophy className="text-6xl text-yaml-yellow" />
            </div>
            <h2 className="text-4xl font-bold mb-6 text-binary-blue">
              Event Sponsor&#8203;ship
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 hover:scale-105">
              <p className="text-xl text-gray-700 leading-relaxed mb-3 mt-3">
                We're looking for sponsors for our upcoming events! On November 14th we're hosting our first annual Capture the Flag at Ozarks Tech! All event sponsorships will contribute to running the event and prizes for winning competitors. To become an event sponsor, submit an inquiry below.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Events