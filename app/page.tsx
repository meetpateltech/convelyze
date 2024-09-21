import React from 'react'
import { ArrowRight, Shield, Sun, BarChart2, Github, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ModeToggle'
import Background from '@/components/ui/background'
import Link from 'next/link'

export default function CoolLandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-100 to-sky-200 dark:from-teal-900 dark:to-sky-900">
      <Background />
      <div className="relative z-20 flex flex-col justify-between p-4 sm:p-6 md:p-8">
        <nav className="flex flex-col sm:flex-row justify-between items-center mb-8 sticky top-0 bg-white/10 dark:bg-black/10 backdrop-filter backdrop-blur-lg z-50 py-4 px-6 rounded-full">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          <Link href="/">Convelyze</Link>
          </h1>
          <div className="flex flex-wrap justify-center sm:justify-end items-center space-x-2 sm:space-x-4">
            <Link href="/demo" className="mb-2 sm:mb-0">
              <Button variant="outline" className="rounded-full">View Demo</Button>
            </Link>
            <Link href="/dashboard" className="mb-2 sm:mb-0">
              <Button className="rounded-full">Dashboard</Button>
            </Link>
            <ModeToggle />
          </div>
        </nav>
        
        <main className="max-w-6xl mx-auto">
          <HeroSection />
          <FeaturesSection />
          <HowToUseSection />
        </main>
        
        <footer className="mt-16 p-6 text-center">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">
        Built with
      </h2>
      <div className="flex justify-center items-center space-x-8 mb-8">
        <a
          href="https://v0.dev"
          target="_blank"
          className="flex items-center text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-black transition-colors"
        >
          <svg height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="20" className="mr-2">
            <path d="M9.50321 5.5H13.2532C13.3123 5.5 13.3704 5.5041 13.4273 5.51203L9.51242 9.42692C9.50424 9.36912 9.5 9.31006 9.5 9.25L9.5 5.5L8 5.5L8 9.25C8 10.7688 9.23122 12 10.75 12H14.5V10.5L10.75 10.5C10.6899 10.5 10.6309 10.4958 10.5731 10.4876L14.4904 6.57028C14.4988 6.62897 14.5032 6.68897 14.5032 6.75V10.5H16.0032V6.75C16.0032 5.23122 14.772 4 13.2532 4H9.50321V5.5ZM0 5V5.00405L5.12525 11.5307C5.74119 12.3151 7.00106 11.8795 7.00106 10.8822V5H5.50106V9.58056L1.90404 5H0Z" fill="currentColor"/>
          </svg>
          v0
        </a>
        <a
          href="https://cursor.com"
          target="_blank"
          className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          Cursor AI
        </a>
        <a
          href="https://claude.ai"
          target="_blank"
          className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          Claude AI
        </a>
      </div>
      <div className="flex justify-center space-x-6">
        <a href="https://github.com/meetpateltech" target="_blank" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Github size={20} aria-label="GitHub" />
        </a>
        <a href="https://x.com/mn_google" target="_blank" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Twitter size={20} aria-label="Twitter" />
        </a>
      </div>
    </footer>

      </div>
      {/* <Particles /> */}
    </div>
  )
}

function HeroSection() {
  return (
    <section className="text-center mb-16 sm:mb-32 relative">
      <div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600 mb-6 leading-tight py-2">
         Your ChatGPT usage, visualized
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
        See your ChatGPT conversations in a whole new way. Our simple and easy-to-use dashboard shows you how you&apos;re using ChatGPT, so you can get more out of it.
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base text-white sm:text-lg mb-12 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            Get Started <ArrowRight className="ml-2" />
          </Button>
        </Link>
      </div>
      <div className="relative w-full h-auto sm:h-120 mb-12">
        <img 
          src="https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/dashboard.png" 
          alt="Dashboard Preview" 
          className="rounded-3xl shadow-2xl object-cover w-full h-full"
        />
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="mb-16 sm:mb-32 relative">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
        Supercharge Your Chat Analysis
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
        <FeatureCard 
          icon={<BarChart2 />}
          title="Comprehensive Analytics"
          description="Track conversations, messages, GPT usage, model usage and more with our comprehensive analytics."
          color="from-pink-500 to-red-500"
        />
        <FeatureCard 
          icon={<Shield />}
          title="Privacy First"
          description="All data processed client-side for maximum security. Your conversations stay private."
          color="from-green-500 to-teal-500"
        />
        <FeatureCard 
          icon={<Github />}
          title="Open Source"
          description="This project is open source, which means you can view, modify, and contribute to the code."
          color="from-yellow-500 to-orange-500"
        />
        <FeatureCard 
          icon={<Sun />}
          title="Light & Dark Mode"
          description="Easy on the eyes, day or night. Seamlessly switch between light and dark themes."
          color="from-purple-500 to-indigo-500"
        />
      </div>
    </section>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
      <div className="relative">
        <div className={`absolute -top-10 -right-10 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${color} rounded-full opacity-20`}></div>
        <div className="text-3xl sm:text-4xl mb-4 sm:mb-6 relative z-10">
          <div>{icon}</div>
        </div>
      </div>
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">{description}</p>
    </div>
  );
}

function HowToUseSection() {
  return (
    <section className="mb-16 sm:mb-32 relative">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
        Three Simple Steps to Insights
      </h2>
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gradient-to-b from-green-600 to-cyan-600 hidden sm:block"></div>
        <StepCard 
          number={1}
          title="Export Your ChatGPT Data"
          description="Go to chatgpt.com, open Profile -> Settings -> Data controls, and click on 'Export data'."
          imageSrc="https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/step-1.png"
        />
        <StepCard 
          number={2}
          title="Receive Export Email"
          description="Wait for an email from OpenAI with your data export. If you're lucky, it will arrive within a few minutes, or you may need to try continuously for the coming few weeks."
          imageSrc="https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/step-2.png"
        />
        <StepCard 
          number={3}
          title="Upload and Analyze"
          description="Extract the zip file, then upload conversations.json to our dashboard to see your analysis."
          imageSrc="https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/step-3.png"
        />
      </div>
    </section>
  )
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  imageSrc: string;
}

function StepCard({ number, title, description, imageSrc }: StepCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center mb-16 sm:mb-24 relative">
      <div className={`w-full sm:w-1/2 ${number % 2 === 0 ? 'sm:order-2 sm:pl-8' : 'sm:pr-8'} mb-6 sm:mb-0`}>
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-600 mb-4">{number}</div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">{description}</p>
        </div>
      </div>
      <div className={`w-full sm:w-1/2 ${number % 2 === 0 ? 'sm:order-1' : ''} mt-6 sm:mt-0`}>
        <img src={imageSrc} alt={title} className="w-full h-fit sm:h-70 object-cover rounded-3xl shadow-lg" />
      </div>
      <div className="absolute left-1/2 -top-6 sm:top-1/2 transform -translate-x-1/2 sm:-translate-y-1/2 w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold z-10">
        {number}
      </div>
    </div>
  )
}

/* function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-cyan-500 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 5}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  )
} */