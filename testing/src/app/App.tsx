import { useState } from "react";
import { ProfileCard } from "./components/ProfileCard";
import { FilterBar } from "./components/FilterBar";
import { BottomNav } from "./components/BottomNav";
import { ProfilePage } from "./components/ProfilePage";
import { LikesPage } from "./components/LikesPage";
import { MessagesPage } from "./components/MessagesPage";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles } from "lucide-react";
import React from 'react'; // <-- add this
const mockProfiles = [
  {
    id: 1,
    name: "Emma",
    age: 26,
    location: "Brooklyn, NY",
    occupation: "Product Designer",
    education: "Parsons School of Design",
    bio: "Art enthusiast who loves exploring new coffee shops and planning spontaneous weekend trips. Always up for a good conversation about design, books, or the best tacos in town.",
    interests: ["Art", "Coffee", "Travel", "Design", "Photography", "Yoga"],
    photos: [
      "https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NzI2ODA2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    distance: "2 miles away",
  },
  {
    id: 2,
    name: "Marcus",
    age: 29,
    location: "Manhattan, NY",
    occupation: "Software Engineer",
    education: "MIT",
    bio: "Tech geek by day, amateur chef by night. I believe the best relationships start with great conversations and shared adventures. Let's grab coffee and see where it goes!",
    interests: ["Coding", "Cooking", "Gaming", "Hiking", "Music", "Reading"],
    photos: [
      "https://images.unsplash.com/photo-1584940121258-c2553b66a739?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwb3J0cmFpdCUyMGNvbmZpZGVudHxlbnwxfHx8fDE3NzI2ODI5NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    distance: "5 miles away",
  },
  {
    id: 3,
    name: "Sophia",
    age: 24,
    location: "Queens, NY",
    occupation: "Environmental Scientist",
    education: "Columbia University",
    bio: "Nature lover on a mission to make the world greener. When I'm not saving the planet, you'll find me hiking, rock climbing, or trying new vegetarian restaurants.",
    interests: [
      "Hiking",
      "Rock Climbing",
      "Sustainability",
      "Cooking",
      "Podcasts",
    ],
    photos: [
      "https://images.unsplash.com/photo-1602304648968-dd05bad729e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG91dGRvb3IlMjBhZHZlbnR1cmV8ZW58MXx8fHwxNzcyNjMxMDMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    distance: "3 miles away",
  },
  {
    id: 4,
    name: "Alex",
    age: 27,
    location: "Williamsburg, NY",
    occupation: "Marketing Manager",
    education: "NYU",
    bio: "Storyteller with a passion for brands that matter. Love exploring new neighborhoods, trying fusion cuisine, and debating the best superhero movies over drinks.",
    interests: ["Marketing", "Movies", "Food", "Running", "Craft Beer"],
    photos: [
      "https://images.unsplash.com/photo-1695485121912-25c7ea05119c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBjYXN1YWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI2MjE0MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    distance: "4 miles away",
  },
  {
    id: 5,
    name: "Isabella",
    age: 28,
    location: "Upper East Side, NY",
    occupation: "Financial Analyst",
    education: "Cornell University",
    bio: "Numbers by day, adventure by night. I'm all about balance - yoga in the morning, wine tasting in the evening. Looking for someone to explore the city with.",
    interests: ["Finance", "Yoga", "Wine", "Travel", "Theater", "Fashion"],
    photos: [
      "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjY1MzI5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    distance: "6 miles away",
  },
  {
    id: 6,
    name: "James",
    age: 30,
    location: "Chelsea, NY",
    occupation: "Architect",
    education: "Cooper Union",
    bio: "Designing spaces that inspire. Fascinated by the intersection of form and function. When I'm not sketching buildings, I'm exploring architectural wonders around the world.",
    interests: [
      "Architecture",
      "Travel",
      "Photography",
      "Jazz",
      "Museums",
      "Biking",
    ],
    photos: [
      "https://images.unsplash.com/photo-1666620657207-c748f7600a42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjB0cmF2ZWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI2ODI5NTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    distance: "3 miles away",
  },
  {
    id: 7,
    name: "Mia",
    age: 25,
    location: "East Village, NY",
    occupation: "Content Creator",
    education: "NYU Tisch",
    bio: "Creating content that makes people smile. Beach lover, sunset chaser, and eternal optimist. Life's too short for boring conversations - let's make some memories!",
    interests: [
      "Content Creation",
      "Beach",
      "Sunset",
      "Vlogging",
      "Dance",
      "Brunch",
    ],
    photos: [
      "https://images.unsplash.com/photo-1650895422057-355060e05c95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGJlYWNoJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcyNjgwNjAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    distance: "2 miles away",
  },
  {
    id: 8,
    name: "Daniel",
    age: 31,
    location: "Tribeca, NY",
    occupation: "Creative Director",
    education: "School of Visual Arts",
    bio: "Bringing ideas to life through visual storytelling. Art gallery regular, vinyl collector, and weekend DJ. Looking for someone who appreciates creativity in all its forms.",
    interests: ["Art", "Music", "DJing", "Vinyl", "Fashion", "Film"],
    photos: [
      "https://images.unsplash.com/photo-1644579140038-6140b454a250?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBhcnRpc3RpYyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MjY4Mjk1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
    distance: "4 miles away",
  },
];

export default function App() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [activeFilters, setActiveFilters] = useState<string[]>(["Nearby"]);
  const [activeTab, setActiveTab] = useState("discover");
  const [direction, setDirection] = useState(0);

  const currentProfile = mockProfiles[currentProfileIndex];

  const handleLike = () => {
    setDirection(1);
    setTimeout(() => {
      setCurrentProfileIndex((prev) => (prev + 1) % mockProfiles.length);
      setDirection(0);
    }, 300);
  };

  const handlePass = () => {
    setDirection(-1);
    setTimeout(() => {
      setCurrentProfileIndex((prev) => (prev + 1) % mockProfiles.length);
      setDirection(0);
    }, 300);
  };

  const handleFilterToggle = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const handleOpenSettings = () => {
    // Settings modal would open here
    console.log("Open settings");
  };

  // Render different pages based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case "likes":
        return <LikesPage />;
      case "messages":
        return <MessagesPage />;
      case "profile":
        return <ProfilePage />;
      case "discover":
      default:
        return (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                    Discover
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-sm">
                    {mockProfiles.length - currentProfileIndex} new
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              activeFilters={activeFilters}
              onFilterToggle={handleFilterToggle}
              onOpenSettings={handleOpenSettings}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-hidden p-4 pb-24">
              <div className="max-w-lg mx-auto h-full">
                <AnimatePresence mode="wait">
                  {currentProfile && (
                    <motion.div
                      key={currentProfile.id}
                      initial={{
                        x: direction === 1 ? 300 : direction === -1 ? -300 : 0,
                        opacity: 0,
                        rotate: direction === 1 ? 10 : direction === -1 ? -10 : 0,
                      }}
                      animate={{ x: 0, opacity: 1, rotate: 0 }}
                      exit={{
                        x: direction === 1 ? -300 : 300,
                        opacity: 0,
                        rotate: direction === 1 ? -10 : 10,
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      <ProfileCard
                        profile={currentProfile}
                        onLike={handleLike}
                        onPass={handlePass}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col">
      {renderContent()}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
