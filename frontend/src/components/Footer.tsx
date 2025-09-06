import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import valenorLogo from '../assets/valenorlogonontext.png'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src={valenorLogo} 
                alt="Valenor Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">Valenor</span>
            </Link>
            <p className="text-gray-600 max-w-md">
              A decentralized autonomous social fund that enables transparent, 
              community-driven funding for social impact projects through 
              blockchain technology and democratic governance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/governance" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Governance
                </Link>
              </li>
              <li>
                <Link to="/proposal" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Submit Proposal
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Connect
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/Zireaelst/Valenor"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 Valenor. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer