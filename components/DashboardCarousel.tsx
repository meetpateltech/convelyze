'use client'

import React from 'react';
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from 'next/image';

interface DashboardImage {
  src: string;
  alt: string;
}

const DashboardCarousel: React.FC = () => {
  
  const dashboardImages: DashboardImage[] = [
    {
      src: "https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/dashboard.png",
      alt: "Main Dashboard Overview"
    },
    {
      src: "https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/advanced-mode.png",
      alt: "Advanced Mode"
    },
    {
      src: "https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/advanced-mode-one.png",
      alt: "Advanced Mode One"
    },
    {
      src: "https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/token-graph.png",
      alt: "Token Graph Mode"
    },
    {
      src: "https://cdn.jsdelivr.net/gh/meetpateltech/convelyze@main/public/token-monthly.png",
      alt: "Token Monthly Usage"
    }
  ];

  return (
    <Carousel 
    plugins={[
        Autoplay({
          delay: 7000,
        }),
      ]}
    >
      <CarouselContent>
        {dashboardImages.map((image, index) => (
          <CarouselItem key={index}>
            <Image 
              src={image.src} 
              alt={image.alt} 
              width={1920}
              height={1080}
              className="rounded-3xl shadow-2xl object-cover w-full h-full"
              priority={index === 0} 
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="carousel-button absolute left-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-2 shadow-md hover:shadow-lg" />
      <CarouselNext className="carousel-button absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full p-2 shadow-md hover:shadow-lg" />
    </Carousel>
  );
};

export default DashboardCarousel;