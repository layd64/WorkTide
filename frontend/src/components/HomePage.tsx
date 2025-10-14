import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, UserGroupIcon, BriefcaseIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Find the Perfect</span>
              <span className="block text-indigo-200">Freelance Opportunity</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-indigo-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect with top clients and freelancers. Build your career or find the perfect talent for your project.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/find-work"
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10"
              >
                Find Work
              </Link>
              <button className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-600 md:py-4 md:text-lg md:px-10">
                Hire Talent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose WorkTide?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The platform that connects talented professionals with amazing opportunities
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Global Talent Pool</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Access a diverse network of skilled professionals from around the world.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                    <BriefcaseIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Secure Projects</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Work with confidence using our secure payment and project management tools.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="flow-root bg-white rounded-lg px-6 pb-8">
                <div className="-mt-6">
                  <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Fair Pricing</h3>
                  <p className="mt-5 text-base text-gray-500">
                    Set your rates and find projects that match your expertise and expectations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                  1
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Create Your Profile</h3>
                <p className="mt-2 text-base text-gray-500">
                  Showcase your skills, experience, and portfolio to attract the right opportunities.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                  2
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Find Projects</h3>
                <p className="mt-2 text-base text-gray-500">
                  Browse through available projects or post your own to find the perfect match.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mx-auto">
                  3
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Start Working</h3>
                <p className="mt-2 text-base text-gray-500">
                  Collaborate, deliver, and get paid securely through our platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-200">Join WorkTide today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
                Get started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 