import React from 'react'
import { ArrowRight, Shield, Sun, BarChart2, Github, Twitter, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ModeToggle'
import Background from '@/components/ui/background'
import DashboardCarousel from '@/components/DashboardCarousel'
import Link from 'next/link'
import Image from 'next/image'
import AnimatedButton from '@/components/footer/AnimatedButton'
import { V0Icon, ClaudeIcon } from '@/components/footer/icons'

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
              <Button variant="default" className="rounded-full">View Demo</Button>
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
        
        <footer className="mt-4 p-6 text-center">
         <div className="flex justify-center items-center space-x-8 mb-8">
          <AnimatedButton 
            initialText="Cooked in"
            targetText="Let me cook"
            icon={<V0Icon />}
          />
          <AnimatedButton 
            initialText="Coded in"
            targetText="Let me code"
            icon={<ClaudeIcon />}
          />
         </div>
      <div className="flex justify-center space-x-6">
        <a href="https://github.com/meetpateltech" target="_blank" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Github size={20} aria-label="GitHub" />
        </a>
        <a href="https://x.com/MeetPatelTech" target="_blank" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <Twitter size={20} aria-label="Twitter" />
        </a>
      </div>
    </footer>

      </div>
    </div>
  )
}

function HeroSection() {
  return (
    <section className="text-center mb-16 sm:mb-32 relative">
      <div className="flex flex-col items-center">
        {/* New Feature Badge */}
        <div className="flex items-center space-x-2 mb-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200 px-4 py-1 rounded-full">
          <BadgeCheck className="w-5 h-5" />
          <span className="font-semibold">New Feature: Token Usage & Estimated Cost</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600 mb-6 leading-tight py-2">
         Your ChatGPT usage, visualized
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
         See your ChatGPT conversations in a whole new way. Our simple and easy-to-use dashboard shows you how you&apos;re using ChatGPT, so you can get more out of it.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base text-white sm:text-lg mb-12 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Get Started <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <Link href="https://github.com/meetpateltech/convelyze">
            <Button size="lg" className="rounded-full px-6 sm:px-8 py-4 sm:py-6 text-base text-white sm:text-lg mb-12 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Source Code <Github className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="relative w-full h-auto sm:h-120 mb-12">
      <DashboardCarousel/>
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
    <div
      className={`relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl transition-all transform hover:scale-105 hover:shadow-2xl duration-500 ease-out overflow-hidden group`}
    >
      {/* Glassy gradient background */}
      <div
        className={`absolute inset-0 z-0 bg-gradient-to-br ${color} opacity-25 blur-lg transform scale-110 transition-transform group-hover:rotate-6 group-hover:scale-125`}
      />

      {/* Glowing decorative circles */}
      <div
        className={`absolute -top-14 -right-14 w-36 h-36 bg-gradient-to-br ${color} rounded-full opacity-30 transform group-hover:scale-125 group-hover:blur-md transition-all duration-500 animate-pulse`}
      />

      <div className="relative z-10">
        {/* Icon stays in place on hover */}
        <div className="text-4xl sm:text-5xl mb-6 transition-transform duration-500">
          {icon}
        </div>

        {/* Title with gradient mask */}
        <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-4">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
          {description}
        </p>
      </div>

      {/* Floating glowing background element */}
      <div
        className={`absolute -bottom-12 -left-12 w-36 h-36 bg-gradient-to-br ${color} opacity-40 rounded-full transform rotate-45 scale-110 blur-2xl transition-transform group-hover:scale-125`}
      />

      {/* Light shine effect on hover */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-10 rounded-3xl transition-opacity duration-500 group-hover:opacity-20"
      />
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
      {/* Content Area */}
      <div className={`w-full sm:w-1/2 ${number % 2 === 0 ? 'sm:order-2 sm:pl-8' : 'sm:pr-8'} mb-6 sm:mb-0`}>
        {/* Glassmorphism Effect */}
        <div className="backdrop-blur-lg bg-white/30 dark:bg-gray-800/30 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 mb-4">
            {number}
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">{description}</p>
        </div>
      </div>

      {/* Image Area */}
      <div className={`w-full sm:w-1/2 ${number % 2 === 0 ? 'sm:order-1' : ''} mt-6 sm:mt-0`}>
        <Image 
          src={imageSrc} 
          alt={title} 
          width={800}
          height={600}
          className="w-full h-fit sm:h-70 object-cover rounded-3xl shadow-lg" 
        />
      </div>
    </div>
  );
}
