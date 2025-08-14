import { Link, useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/about', label: 'About' },
    { path: '/sponsors', label: 'Sponsors' },
    { path: '/etc', label: 'etc.' },
  ]

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-blue-300 transition-colors">
          Tech2Gether
        </Link>
        <ul className="flex space-x-6">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`px-3 py-2 rounded transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Header
