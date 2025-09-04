import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { FaCode, FaRocket, FaUsers, FaCalendarAlt, FaGithub, FaLinkedin, FaExternalLinkAlt, FaGlobe, FaMapMarkerAlt, FaClock, FaFlag, FaSearch} from 'react-icons/fa'
import Hero from '../components/Hero'
import Card from '../components/Card'
import eventThumbnail from '../assets/thumbnails/3_26_25_thumbnail.png'
import placeholderThumbnail from '../assets/thumbnails/placeholder.png'
import diegoPortrait from '../assets/portraits/diego_haro.png'
import lauraPortrait from '../assets/portraits/laura_kirkpatrick.png'
import paulPortrait from '../assets/portraits/paul_bute.png'
import willyPortrait from '../assets/portraits/willy_vanderpool.png'

function Home() {
  const [meetings, setMeetings] = useState([]);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [ongoingMeeting, setOngoingMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch meeting data on component mount
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/meetings.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const meetingsData = data.meetings || [];
        
        // Sort meetings by date (upcoming first)
        const currentDate = new Date();
        const sortedMeetings = meetingsData
          .map(meeting => ({
            ...meeting,
            dateObj: new Date(meeting.date),
            endDateObj: meeting.endDate ? new Date(meeting.endDate) : null
          }))
          .sort((a, b) => a.dateObj - b.dateObj);

        // Find ongoing meeting (meeting that is currently happening)
        const ongoing = sortedMeetings.find(meeting => {
          if (meeting.endDateObj) {
            return meeting.dateObj <= currentDate && currentDate <= meeting.endDateObj;
          }
          // If no endDate, treat as single-day event, but only after start time
          return (
            meeting.dateObj.toDateString() === currentDate.toDateString() &&
            meeting.dateObj <= currentDate
          );
        });

        // Find the next upcoming meeting (not ongoing)
        const upcomingMeeting = sortedMeetings.find(meeting => {
          if (ongoing && meeting === ongoing) return false;
          return meeting.dateObj >= currentDate;
        });

        setMeetings(sortedMeetings);
        setOngoingMeeting(ongoing || null);
        setNextMeeting(upcomingMeeting || null);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  // Ensure title updates when component mounts
  useEffect(() => {
    document.title = 'Tech2Gether - Free Pizza and Networking';
  }, []);

  // Helper function to format date for display
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format time for display
  const formatEventTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to get the correct thumbnail image
  const getThumbnailImage = (thumbnailPath) => {
    if (!thumbnailPath || thumbnailPath.includes('placeholder.png')) {
      return placeholderThumbnail;
    }
    if (thumbnailPath.includes('3_26_25_thumbnail.png')) {
      return eventThumbnail;
    }
    // Default to placeholder if thumbnail not found
    return placeholderThumbnail;
  };

  const teamMembers = [
    { 
      name: 'Willy Vanderpool', 
      image: willyPortrait, 
      role: 'President',
      pronouns: 'She/Her',
      bio: "Hello there! I'm Willy Vanderpool, an 18-year-old Computer Information Science student at Ozarks Tech. I'm currently working in Ozarks Tech's Web Services department, and I'm also the president of Tech2Gether. My passion for programming started long before college, sparked by curiosity and a love for creating things from scratch. Over the years, I've gained experience with HTML, CSS, JavaScript, C#, Java, and Lua, and recently I've been diving deeper into modern frameworks such as React, TailwindCSS, and .NET MAUI. Outside of programming, some of my hobbies include drawing pixel art, playing videogames, and collecting Pokémon cards. I've also been learning German since around mid January 2025.",
      buttons: [
        { icon: FaGithub, label: 'GitHub', url: 'https://github.com/ItsMeWillyV' },
        { icon: FaLinkedin, label: 'LinkedIn', url: 'https://linkedin.com/in/willy-vanderpool' },
        { icon: FaGlobe, label: 'Website', url: 'https://willy-v.com/' }
      ]
    },
    { 
      name: 'Paul Bute', 
      image: paulPortrait, 
      role: 'Vice President',
      pronouns: 'He/They',
      bio: "My name is Paul Bute, and I'm a CIS student at Ozarks Tech. My goals for the club this year are to boost engagement and engage students in programming challenges and competitions. As of the beginning of the Fall semester, it will be my 2nd year at Ozarks Tech. I'm mainly a Web Developer, with experience in C# ASP.NET apps, as well as JS & Vue. I enjoy learning new skills and exploring how problems can be solved in more than one way. I enjoy reading, gaming & baking in my free time. Before Ozarks Tech I was part of the workforce for 7 years. I have experience in warehouse picking, shipping & handling, management and customer service. I also spent four years in the hospitality industry, and a year as a Tower Technician doing structural modifications on cell phone towers.",
      buttons: [
        { icon: FaGithub, label: 'GitHub', url: 'https://github.com/Smashslice'}
      ]
    },
    { 
      name: 'Diego Haro', 
      image: diegoPortrait, 
      role: 'Treasurer',
      pronouns: 'He/Him',
      bio: "Hi, I'm Diego. I've been a student at Ozarks Tech since fall 2024, and after attending a few Tech2Gether meetings, I knew I wanted to contribute my time and energy to this club. Since I've been at Ozarks Tech, I've been learning and honing my skills in C#, Python, and Web Development. I'm currently pursuing an Associate's degree in CIS, but I may switch to CSC and pursue a Bachelor's degree instead. My hobbies include weightlifting, cooking, and coding.",
      buttons: [
      ]
    },
    { 
      name: 'Laura Kirkpatrick', 
      image: lauraPortrait, 
      role: 'Secretary',
      pronouns: 'She/Her',
      bio: "Hiya! My name is Laura, and I'm the Tech2Gether secretary for the 2025-2026 school year. I'm currently working on my Associate's degree in Computer Science at Ozarks Tech. I have enjoyed all that I've learned in my time at Ozarks Tech: Python, C#, .NET MAUI, Java, and Web Development. In my free time, I love building Magic: The Gathering decks, writing/playing Dungeons and Dragons with friends, and playing/building videogames. I'll be graduating in the Spring 2026 Semester (hopefully) so look out for officer nominations in the spring to get my job! I'm so excited to help Tech2Gether continue its outreach to students by providing fun educational, networking, and programming events to members and all Ozarks Tech students alike! It's going to be a fun year.",
      buttons: [
        { icon: FaGithub, label: 'GitHub', url: 'https://github.com/Fruity-Patoootie' },
        { icon: FaLinkedin, label: 'LinkedIn', url: 'https://www.linkedin.com/in/laura-kirkpatrick-3a4895381/' }
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-light-gray">
      <Helmet key="home-helmet">
        <title>Tech2Gether - Free Pizza and Networking</title>
        <meta name="description" content="Join our vibrant tech community for networking, learning, and innovation at Ozarks Tech" />
        <meta name="keywords" content="Ozarks Tech, Club, Community, Meetup, Technology, Programming" />
        <meta property="og:title" content="Tech2Gether - Free Pizza and Networking" />
        <meta property="og:description" content="Join our vibrant tech community for networking, learning, and innovation at Ozarks Tech" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* Hero Section */}
      <Hero/>     

      {/* About Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-binary-blue">
            What is Tech&#8203;2&#8203;Gether?
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Tech2Gether is the tech club at Ozarks Technical Community College (Ozarks Tech). 
            We focus on bringing together students interested in technology, programming, and cybersecurity. 
            We organize workshops and tech talks to help students grow their skills and engage with industry professionals.
          </p>
        </div>

        {/* Upcoming Event Preview */}
        <div id="upcoming-event" className="bg-gradient-event bg-white rounded-2xl shadow-xl p-8 mb-20">
          {loading ? (
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-xl">Loading upcoming events...</p>
            </div>
          ) : error ? (
            <div className="text-center text-white">
              <p className="text-xl mb-4">Unable to load event data</p>
              <p className="text-sm opacity-75">Error: {error}</p>
            </div>
          ) : ongoingMeeting ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-white">
                <h3 className="text-3xl font-bold mb-4">
                  <FaCalendarAlt className="inline mr-3 text-yaml-yellow" />
                  Ongoing Event: {formatEventDate(ongoingMeeting.date)}
                </h3>
                <h4 className="text-2xl font-semibold mb-3">
                  {ongoingMeeting.title}
                </h4>
                {ongoingMeeting.speaker && (
                  <p className="text-lg mb-2 opacity-90">
                    <strong>Speaker:</strong> {ongoingMeeting.speaker}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {ongoingMeeting.location && (
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-yaml-yellow" />
                      {ongoingMeeting.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FaClock className="text-yaml-yellow" />
                    {formatEventTime(ongoingMeeting.date)}
                  </span>
                  {ongoingMeeting.endDate && (
                    <span className="flex items-center gap-1">
                      <FaClock className="text-yaml-yellow" />
                      Ends: {formatEventTime(ongoingMeeting.endDate)}
                    </span>
                  )}
                </div>
                <div 
                  className="text-base mb-6 opacity-95 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: ongoingMeeting.description 
                  }}
                />
                {ongoingMeeting.schedule && (
                  <div className="mb-6 p-3 bg-black bg-opacity-20 rounded-lg">
                    <h5 className="font-semibold mb-2">Schedule:</h5>
                    <div 
                      className="text-sm opacity-90"
                      dangerouslySetInnerHTML={{ __html: ongoingMeeting.schedule }}
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  {ongoingMeeting.buttons && ongoingMeeting.buttons.map((button, index) => (
                    <a
                      key={index}
                      href={button.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-event px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                    >
                      {button.text}
                      <FaExternalLinkAlt className="text-sm" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={getThumbnailImage(ongoingMeeting.thumbnail)} 
                  alt={ongoingMeeting.title} 
                  className="w-64 h-40 object-contain rounded-xl"
                />
              </div>
            </div>
          ) : nextMeeting ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-white">
                <h3 className="text-3xl font-bold mb-4">
                  <FaCalendarAlt className="inline mr-3 text-yaml-yellow" />
                  Next Event: {formatEventDate(nextMeeting.date)}
                </h3>
                <h4 className="text-2xl font-semibold mb-3">
                  {nextMeeting.title}
                </h4>
                {nextMeeting.speaker && (
                  <p className="text-lg mb-2 opacity-90">
                    <strong>Speaker:</strong> {nextMeeting.speaker}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {nextMeeting.location && (
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-yaml-yellow" />
                      {nextMeeting.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FaClock className="text-yaml-yellow" />
                    {formatEventTime(nextMeeting.date)}
                  </span>
                </div>
                <div 
                  className="text-base mb-6 opacity-95 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: nextMeeting.description 
                  }}
                />
                {nextMeeting.schedule && (
                  <div className="mb-6 p-3 bg-black bg-opacity-20 rounded-lg">
                    <h5 className="font-semibold mb-2">Schedule:</h5>
                    <div 
                      className="text-sm opacity-90"
                      dangerouslySetInnerHTML={{ __html: nextMeeting.schedule }}
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  {nextMeeting.buttons && nextMeeting.buttons.map((button, index) => (
                    <a
                      key={index}
                      href={button.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-event px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                    >
                      {button.text}
                      <FaExternalLinkAlt className="text-sm" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <img 
                  src={getThumbnailImage(nextMeeting.thumbnail)} 
                  alt={nextMeeting.title} 
                  className="w-64 h-40 object-contain rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-white">
              <h3 className="text-3xl font-bold mb-4">
                <FaCalendarAlt className="inline mr-3 text-yaml-yellow" />
                No Upcoming Events
              </h3>
              <p className="text-xl mb-6 opacity-95">
                Stay tuned for announcements about our next meeting!
              </p>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-10 mb-20">
          <Card
            icon={FaFlag}
            iconColor="text-yaml-yellow"
            title="Ozzy's Cyber Heist"
            description="Join us for our first annual Capture the Flag at Ozarks Tech! Sign-up opens September 10th and closes November 1st. Begins on Friday, November 14th; time & location TBD."
            borderColor="border-t-yaml-yellow"
            button={{
              text: "View Events",
              href: "/events",
              icon: FaSearch,
              className: "bg-yaml-yellow text-binary-blue hover:bg-analog-aquamarine hover:text-white"
            }}
          />
          <Card
            icon={FaCode}
            iconColor="text-analog-aquamarine"
            title="Hack2Gether"
            description="Coming in the Spring Semester—stay tuned for more info!"
            borderColor="border-t-analog-aquamarine"
            button={{
              text: "View Events",
              href: "/events",
              icon: FaSearch,
              className: "bg-analog-aquamarine text-white hover:bg-binary-blue"
            }}
          />
          
          <Card
            icon={FaGlobe}
            iconColor="text-binary-blue"
            title="Join the Website Team today!"
            description="Like what you see and want to contribute? Talk to Willy, Paul, and Laura on Teams to find out how to join the Website Team!"
            borderColor="border-t-binary-blue"
            button={{
              text: "Contact Us",
              href: "https://teams.microsoft.com/l/chat/0/0?users=butep@otc.edu,lk1012349@otc.edu",
              icon: FaUsers,
              external: true,
              className: "bg-binary-blue text-white hover:bg-analog-aquamarine"
            }}
          />
        </div>

        {/* Team Section */}
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 py-20 px-4 rounded-3xl mb-20 shadow-inner">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-binary-blue">
              Meet Our Team
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  <div className="flex-shrink-0">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-analog-aquamarine"
                    />
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <h4 className="text-2xl font-bold mb-2 text-binary-blue">
                      {member.name}
                    </h4>
                    <p>({member.pronouns})</p>
                    <p className="text-lg text-analog-aquamarine font-medium mb-4">
                      {member.role}
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {member.bio}
                    </p>
                    {member.buttons && (
                      <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                        {member.buttons.map((button, buttonIndex) => (
                          <a
                            key={buttonIndex}
                            href={button.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yaml-yellow text-binary-blue rounded-lg hover:bg-analog-aquamarine transition-all duration-300 hover:scale-105 text-sm font-medium"
                          >
                            <button.icon className="text-lg" />
                            {button.label}
                            <FaExternalLinkAlt className="text-xs" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Meetings Section */}
        {!loading && !error && meetings.length > 0 && (
          <div className="bg-gradient-event py-20 px-4 rounded-3xl mb-20 shadow-inner">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-white">
                All Meetings
              </h2>
              <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
                Check out our complete schedule of meetings and workshops
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...meetings].reverse().map((meeting, index) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0); 
                const meetingDate = new Date(meeting.dateObj);
                meetingDate.setHours(0, 0, 0, 0); 
                const isPast = meetingDate < today;
                const isUpcoming = meeting === nextMeeting;
                const isOngoing = ongoingMeeting && meeting === ongoingMeeting;
                return (
                  <div 
                    key={index} 
                    className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${
                      isUpcoming ? 'ring-2 ring-yaml-yellow' : ''
                    } ${isOngoing ? 'ring-2 ring-analog-aquamarine' : ''} ${isPast ? 'opacity-75' : ''}`}
                  >
                    {isOngoing && (
                      <div className="bg-analog-aquamarine text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                        Ongoing Event
                      </div>
                    )}
                    {isUpcoming && !isOngoing && (
                      <div className="bg-yaml-yellow text-binary-blue px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                        Next Event
                      </div>
                    )}
                    {isPast && !isOngoing && !isUpcoming && (
                      <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4 inline-block">
                        Previous Event
                      </div>
                    )}
                    <div className="mb-4">
                      <img 
                        src={getThumbnailImage(meeting.thumbnail)} 
                        alt={meeting.title} 
                        className="w-full h-32 object-contain rounded-lg shadow-inner"
                      />
                    </div>
                    <h4 className="text-xl font-bold mb-2 text-binary-blue">
                      {meeting.title}
                    </h4>
                    <div className="text-sm text-gray-600 mb-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-analog-aquamarine" />
                        {formatEventDate(meeting.date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock className="text-analog-aquamarine" />
                        {formatEventTime(meeting.date)}
                      </div>
                      {meeting.endDate && (
                        <div className="flex items-center gap-2">
                          <FaClock className="text-analog-aquamarine" />
                          Ends: {formatEventTime(meeting.endDate)}
                        </div>
                      )}
                      {meeting.location && (
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-analog-aquamarine" />
                          {meeting.location}
                        </div>
                      )}
                      {meeting.speaker && (
                        <div className="text-gray-700">
                          <strong>Speaker:</strong> {meeting.speaker}
                        </div>
                      )}
                    </div>
                    <div 
                      className="text-gray-700 text-sm mb-4 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: meeting.description 
                      }}
                    />
                    {meeting.buttons && meeting.buttons.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {meeting.buttons.map((button, buttonIndex) => (
                          <a
                            key={buttonIndex}
                            href={button.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-analog-aquamarine text-white rounded-lg hover:bg-binary-blue transition-all duration-300 hover:scale-105 text-xs font-medium"
                          >
                            {button.text}
                            <FaExternalLinkAlt className="text-xs" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
