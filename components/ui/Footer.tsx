"use client"

import { useEffect, useState } from "react"

export default function Footer() {
  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="w-full bg-gray-50 border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Nabha Learning</h3>
          <p className="text-gray-600 mt-2 text-sm">
            Empowering rural education with digital learning tools for students and teachers.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800">Quick Links</h3>
          <ul className="mt-2 space-y-1 text-sm">
            <li><a href="#" className="hover:text-blue-600">Home</a></li>
            <li><a href="#courses" className="hover:text-blue-600">Courses</a></li>
            <li><a href="#about" className="hover:text-blue-600">About</a></li>
            <li><a href="#contact" className="hover:text-blue-600">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800">Contact</h3>
          <p className="text-sm text-gray-600 mt-2">
            📍 Nabha, Punjab, India <br />
            📧 support@nabha-learning.org <br />
            📞 +91 98765 43210
          </p>
        </div>
      </div>

      <div className="border-t py-4 text-center text-sm text-gray-500">
        © {year ?? ""} Nabha Learning. All rights reserved.
      </div>
    </footer>
  )
}
