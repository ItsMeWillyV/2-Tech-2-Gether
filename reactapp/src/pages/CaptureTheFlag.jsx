import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { FaTrophy, FaMedal, FaAward, FaExternalLinkAlt, FaUsers, FaCode, FaRocket, FaSearch, FaGlobe, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle, FaPlus, FaTrash, FaPhone, FaGavel } from 'react-icons/fa'
import Hero from '../components/Hero'
import Card from '../components/Card'

function CaptureTheFlag() {
  const [teamInfo, setTeamInfo] = useState({
    teamName: '',
    division: ''
  });

  const [members, setMembers] = useState([
    {
      firstName: '',
      lastName: '',
      preferredFirstName: '',
      schoolName: '',
      schoolEmail: '',
      phoneNumber: '',
      emergencyContact: {
        firstName: '',
        lastName: '',
        phoneNumber: ''
      }
    },
    {
      firstName: '',
      lastName: '',
      preferredFirstName: '',
      schoolName: '',
      schoolEmail: '',
      phoneNumber: '',
      emergencyContact: {
        firstName: '',
        lastName: '',
        phoneNumber: ''
      }
    }
  ]);

  const [agreeToRules, setAgreeToRules] = useState(false);

  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, {
        firstName: '',
        lastName: '',
        preferredFirstName: '',
        schoolName: '',
        schoolEmail: '',
        phoneNumber: '',
        emergencyContact: {
          firstName: '',
          lastName: '',
          phoneNumber: ''
        }
      }]);
    }
  };

  const removeMember = (index) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateTeamInfo = (field, value) => {
    setTeamInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateMember = (index, field, value) => {
    setMembers(prev => prev.map((member, i) => {
      if (i === index) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return {
            ...member,
            [parent]: {
              ...member[parent],
              [child]: value
            }
          };
        }
        return {
          ...member,
          [field]: value
        };
      }
      return member;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form validation and submission logic here
    console.log('Team Info:', teamInfo);
    console.log('Members:', members);
    console.log('Agreed to rules:', agreeToRules);
  };
    
  // Ensure title updates when component mounts
  useEffect(() => {
    document.title = 'Cyber Heist - Tech2Gether';
  }, []);

  return (
    <div className="min-h-screen bg-light-gray">
      <Helmet key="events-helmet">
        <title>Cyber Heist - Tech2Gether</title>
        <meta name="description" content="Join Tech2Gether for exciting events and networking opportunities" />
        <meta name="keywords" content="Tech2Gether, Events, Ozarks Tech, Technology, Programming, Networking" />
        <meta property="og:title" content="Events - Tech2Gether" />
        <meta property="og:description" content="Participate in Tech2Gether events to connect with fellow tech enthusiasts" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <Hero 
        title="Cyber Heist"
        subtitle="Sign up for Ozzy's Cyber Heist today"
      />

      <form onSubmit={handleSubmit} className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent">
            Register for Cyber Heist
          </h2>
          <p className="text-gray-600 text-lg">Join the ultimate cybersecurity competition and test your skills!</p>
        </div>
        
        {/* Team Information Section */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-blue-600 rounded-lg p-3 mr-4">
              <FaUsers className="text-white text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 font-arial-nova">Team Information</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label htmlFor="teamName" className="block text-sm font-semibold text-gray-700 mb-2">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="teamName"
                value={teamInfo.teamName}
                onChange={(e) => updateTeamInfo('teamName', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                placeholder="Enter your team name"
                minLength="3"
                maxLength="50"
                pattern="[a-zA-Z0-9\s\-_]+"
                title="Team name should be 3-50 characters and contain only letters, numbers, spaces, hyphens, and underscores"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="division" className="block text-sm font-semibold text-gray-700 mb-2">
                Division <span className="text-red-500">*</span>
              </label>
              <select
                id="division"
                value={teamInfo.division}
                onChange={(e) => updateTeamInfo('division', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-4 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 bg-white"
                required
              >
                <option value="">Select Division</option>
                <option value="highschool">Highschool</option>
                <option value="college">College</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-purple-100 p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
            <div className="flex items-center">
              <div className="bg-purple-600 rounded-lg p-3 mr-4">
                <FaCode className="text-white text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 font-arial-nova">Team Members</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-gray-700">
                  {members.length} of 5 members
                </span>
              </div>
              {members.length < 5 && (
                <button
                  type="button"
                  onClick={addMember}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <FaPlus size={14} /> Add Member
                </button>
              )}
            </div>
          </div>

          {members.map((member, index) => (
            <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-8 mb-8 shadow-md hover:shadow-lg transition-all duration-300 hover:border-purple-300">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-lg mr-4">
                    {index + 1}
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 font-arial-nova">Member {index + 1}</h4>
                </div>
                {members.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <FaTrash size={12} /> Remove
                  </button>
                )}
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center font-arial-nova">
                  Personal Information
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.firstName}
                      onChange={(e) => updateMember(index, 'firstName', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                      placeholder="First name"
                      pattern="[A-Za-z\s\-'.]+"
                      minLength="2"
                      maxLength="30"
                      title="First name should contain only letters, spaces, hyphens, apostrophes, and periods"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.lastName}
                      onChange={(e) => updateMember(index, 'lastName', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                      placeholder="Last name"
                      pattern="[A-Za-z\s\-'.]+"
                      minLength="2"
                      maxLength="30"
                      title="Last name should contain only letters, spaces, hyphens, apostrophes, and periods"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Preferred First Name
                    </label>
                    <input
                      type="text"
                      value={member.preferredFirstName}
                      onChange={(e) => updateMember(index, 'preferredFirstName', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                      placeholder="If different from first name"
                      pattern="[A-Za-z\s\-'.]+"
                      maxLength="30"
                      title="Preferred name should contain only letters, spaces, hyphens, apostrophes, and periods"
                    />
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="rounded-lg p-6 mb-6">
                <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center font-arial-nova">
                  School Information
                </h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      School Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.schoolName}
                      onChange={(e) => updateMember(index, 'schoolName', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                      placeholder="Your school name"
                      minLength="2"
                      maxLength="100"
                      title="School name should be 2-100 characters"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      School Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={member.schoolEmail}
                      onChange={(e) => updateMember(index, 'schoolEmail', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                      placeholder="student@school.edu"
                      pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                      title="Please enter a valid email address"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="rounded-lg p-6 mb-6">
                <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center font-arial-nova">
                  Contact Information
                </h5>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={member.phoneNumber}
                    onChange={(e) => updateMember(index, 'phoneNumber', e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                    placeholder="(555) 123-4567"
                    pattern="(\([0-9]{3}\)\s?|[0-9]{3}[\s\-]?)[0-9]{3}[\s\-]?[0-9]{4}"
                    title="Please enter a valid phone number (e.g., (555) 123-4567 or 555-123-4567)"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="rounded-lg p-6">
                <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center font-arial-nova">
                  Emergency Contact
                </h5>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.emergencyContact.firstName}
                      onChange={(e) => updateMember(index, 'emergencyContact.firstName', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                      placeholder="Emergency contact first name"
                      pattern="[A-Za-z\s\-'.]+"
                      minLength="2"
                      maxLength="30"
                      title="First name should contain only letters, spaces, hyphens, apostrophes, and periods"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.emergencyContact.lastName}
                      onChange={(e) => updateMember(index, 'emergencyContact.lastName', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                      placeholder="Emergency contact last name"
                      pattern="[A-Za-z\s\-'.]+"
                      minLength="2"
                      maxLength="30"
                      title="Last name should contain only letters, spaces, hyphens, apostrophes, and periods"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={member.emergencyContact.phoneNumber}
                      onChange={(e) => updateMember(index, 'emergencyContact.phoneNumber', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
                      placeholder="(555) 123-4567"
                      pattern="(\([0-9]{3}\)\s?|[0-9]{3}[\s\-]?)[0-9]{3}[\s\-]?[0-9]{4}"
                      title="Please enter a valid phone number (e.g., (555) 123-4567 or 555-123-4567)"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rules Agreement */}
        <div className="rounded-xl shadow-lg p-8 mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-amber-600 rounded-lg p-3 mr-4">
                <FaGavel className="text-white text-xl" />
              </div>
            <h3 className="text-2xl font-bold text-gray-800 font-arial-nova">Competition Agreement</h3>
          </div>
          
          <div className="bg-white rounded-lg p-6 border-2 border-yellow-200">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                id="agreeToRules"
                checked={agreeToRules}
                onChange={(e) => setAgreeToRules(e.target.checked)}
                className="mt-2 h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                required
              />
              <label htmlFor="agreeToRules" className="text-gray-700 leading-relaxed">
                <span className="text-red-500 font-bold">*</span> I agree to the{' '}
                <a href="#rules" className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors duration-200">
                  Cyber Heist competition rules and code of conduct
                </a>
                . I understand that all team members must follow these guidelines during the event and that violations may result in disqualification.
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center space-y-4">
          <button
            type="submit"
            className={`
              ${members.length >= 2 && agreeToRules 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105' 
                : 'bg-gray-400 cursor-not-allowed'
              }
              text-white font-bold px-12 py-4 rounded-xl text-xl transition-all duration-300 shadow-md
            `}
            disabled={members.length < 2 || !agreeToRules}
          >
            <FaRocket className='inline-block' /> Register Team for Cyber Heist
          </button>
          
          {members.length < 2 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
              <p className="text-red-600 font-semibold flex items-center">
                <FaInfoCircle className="mr-2" />
                Please add at least 2 team members to register
              </p>
            </div>
          )}
          
          {!agreeToRules && members.length >= 2 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 inline-block">
              <p className="text-yellow-700 font-semibold flex items-center">
                <FaInfoCircle className="mr-2" />
                Please agree to the competition rules to continue
              </p>
            </div>
          )}
        </div>
      </form>

    </div>
  )
}

export default CaptureTheFlag;