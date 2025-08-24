import React from 'react'
import { Helmet } from 'react-helmet-async'
import { FaCode, FaMobile, FaRocket, FaArrowRight, FaUsers, FaCalendarAlt} from 'react-icons/fa'
import { MdDesignServices } from 'react-icons/md'
import { IoSparkles } from 'react-icons/io5'
import backgroundImage from '../assets/background.png'
import tech2getherLogo from '../assets/tech2gether_logo.png'
import eventThumbnail from '../assets/thumbnails/3_26_25_thumbnail.png'
import diegoPortrait from '../assets/portraits/diego_haro.png'
import lauraPortrait from '../assets/portraits/laura_kirkpatrick.png'
import paulPortrait from '../assets/portraits/paul_bute.png'
import willyPortrait from '../assets/portraits/willy_vanderpool.png'

function Home() {
  const teamMembers = [
    { 
      name: 'Willy Vanderpool', 
      image: willyPortrait, 
      role: 'President',
      pronouns: 'She/Her',
      bio: "Hello there! I'm Willy Vanderpool, an 18-year-old Computer Information Science student at Ozarks Tech. I'm currently working in Ozarks Tech's Web Services department, and I'm also the president of Tech2Gether. My passion for programming started long before college, sparked by curiosity and a love for creating things from scratch. Over the years, I've gained experience with HTML, CSS, JavaScript, C#, Java, and Lua, and recently I've been diving deeper into modern frameworks such as React, TailwindCSS, and .NET MAUI. Outside of programming, some of my hobbies include drawing pixel art, playing videogames, and collecting Pokémon cards. I've also been learning German since around mid January 2025."
    },
    { 
      name: 'Paul Bute', 
      image: paulPortrait, 
      role: 'Vice President',
      pronouns: 'He/They',
      bio: "My name is Paul Bute, and I'm a CIS student at Ozark's Tech. I'm the current Vice President of Tech2Gether. My goals for the club this year are to boost engagement and engage students in programming challenges and competitions. As of the beginning of the Fall semester, it will be my 2nd year at Ozarks Tech. I'm mainly a Web Developer, with experience in C# ASP.NET apps, as well as JS & Vue. I enjoy learning new skills and exploring how problems can be solved in more than one way. I enjoy reading, gaming & baking in my free time. Before Ozarks Tech I was part of the workforce for 7 years. I have experience in warehouse picking, shipping & handling, management and customer service. I also spent four years in the hospitality industry, and a year as a Tower Technician doing structural modifications on cell phone towers."
    },
    { 
      name: 'Diego Haro', 
      image: diegoPortrait, 
      role: 'Developer',
      pronouns: 'He/Him',
      bio: "Hi, I'm Diego. I've been a student at Ozarks Tech since fall 2024, and after attending a few Tech2Gether meetings, I knew I wanted to contribute my time and energy to this club. Since I've been at Ozarks Tech, I've been learning and honing my skills in C#, Python, and Web Development. I'm currently pursuing an Associate's degree in CIS, but I may switch to CSC and pursue a Bachelor's degree instead. My hobbies include weightlifting, cooking, and coding."
    },
    { 
      name: 'Laura Kirkpatrick', 
      image: lauraPortrait, 
      role: 'Secretary',
      pronouns: 'She/Her',
      bio: "Hiya! My name is Laura, and I'm the Tech2Gether secretary for the 2025-2026 school year. I'm currently working on my Associate's degree in Computer Science at Ozarks Tech. I have enjoyed all that I've learned in my time at Ozarks Tech: Python, C#, .NET MAUI, Java, and Web Development. In my free time, I love building Magic: The Gathering decks, writing/playing Dungeons and Dragons with friends, and playing/building videogames. I'll be graduating in the Spring 2026 Semester (hopefully) so look out for officer nominations in the spring to get my job! I'm so excited to help Tech2Gether continue its outreach to students by providing fun educational, networking, and programming events to members and all Ozarks Tech students alike! It's going to be a fun year."
    },


  ]

  return (
    <div className="min-h-screen bg-light-gray">
      <Helmet>
        <title>Tech2Gether - Connecting Tech Minds</title>
        <meta name="description" content="Join our vibrant tech community for networking, learning, and innovation at Ozarks Tech" />
        <meta name="keywords" content="Ozarks Tech, Club, Community, Meetup, Technology, Programming" />
        <meta property="og:title" content="Tech2Gether - Home" />
        <meta property="og:description" content="Connecting Tech Minds at Ozarks Tech" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Hero Section */}
      <div 
        className="hero-section-curved text-white py-32 bg-cover bg-center bg-no-repeat relative"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <img 
              src={tech2getherLogo} 
              alt="Tech2Gether Logo" 
              className="h-24 w-auto animate-pulse"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 tracking-tight">
            <span>Tech2Gether</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl opacity-95 italic mb-8 max-w-4xl mx-auto px-4">
            Where innovation meets collaboration at Ozarks Tech
          </p>
          <button className="btn-primary text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 inline-flex items-center gap-3">
            <FaUsers />
            Join Our Community
            <FaArrowRight />
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-binary-blue">
            What is Tech2Gether?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Tech2Gether is the tech club at Ozarks Technical Community College (Ozarks Tech). 
            We focus on bringing together students interested in technology, programming, and cybersecurity. 
            We organize workshops and tech talks to help students grow their skills and engage with industry professionals.
          </p>
        </div>

        {/* Upcoming Event Preview */}
        <div className="bg-gradient-event bg-white rounded-2xl shadow-xl p-8 mb-20">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <h3 className="text-3xl font-bold mb-4">
                <FaCalendarAlt className="inline mr-3 text-yaml-yellow" />
                Next Event: March 26, 2025
              </h3>
              <p className="text-xl mb-6 opacity-95">
                Join us for our upcoming workshop on modern web development. 
                Free pizza, great conversations, and hands-on learning!
              </p>
              <button className="btn-event px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
                Register Now
              </button>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={eventThumbnail} 
                alt="March 26 Event" 
                className="w-64 h-40 object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-10 mb-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-t-analog-aquamarine">
            <div className="flex justify-center mb-6">
              <FaCode className="text-5xl text-analog-aquamarine" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-binary-blue">
              Learn & Code
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Hands-on workshops and coding sessions to enhance your programming skills 
              across various technologies and frameworks.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-t-yaml-yellow">
            <div className="flex justify-center mb-6">
              <FaUsers className="text-5xl text-yaml-yellow" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-binary-blue">
              Network & Connect
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Build meaningful connections with fellow tech enthusiasts, 
              industry professionals, and potential collaborators.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-t-4 border-t-binary-blue">
            <div className="flex justify-center mb-6">
              <FaRocket className="text-5xl text-binary-blue" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-binary-blue">
              Innovate & Create
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Collaborate on exciting projects, participate in hackathons, 
              and bring your innovative ideas to life.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 py-20 px-4 rounded-3xl mb-20 shadow-inner">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-binary-blue">
              Meet Our Team
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border border-analog-aquamarine"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-2xl font-bold mb-2 text-binary-blue">
                      {member.name}
                    </h4>
                    <p>({member.pronouns})</p>
                    <p className="text-lg text-analog-aquamarine font-medium mb-4">
                      {member.role}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-cta text-center bg-white rounded-2xl shadow-xl p-12">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Join the Tech Revolution?
          </h2>
          <p className="text-xl text-white opacity-95 mb-8 max-w-2xl mx-auto">
            Be part of a community that's shaping the future of technology. 
            Connect, learn, and grow with us!
          </p>
          <button className="btn-secondary px-10 py-4 rounded-xl text-xl font-bold transition-all duration-300 hover:shadow-xl hover:scale-105 inline-flex items-center gap-3">
            <IoSparkles />
            Get Started Today
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
