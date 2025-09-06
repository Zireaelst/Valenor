import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Proposals', href: '/proposals' },
  { name: 'Create Proposal', href: '/create-proposal' },
  { name: 'Profile', href: '/profile' },
]

export function Navigation() {
  const location = useLocation()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                location.pathname === item.href
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
