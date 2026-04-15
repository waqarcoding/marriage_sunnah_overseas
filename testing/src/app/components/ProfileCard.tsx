import { Heart, X, MapPin, Briefcase, GraduationCap, Info } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import React from 'react'; // <-- add this
interface ProfileCardProps {
  profile: {
    id: number;
    name: string;
    age: number;
    location: string;
    occupation: string;
    education: string;
    bio: string;
    interests: string[];
    photos: string[];
    distance: string;
  };
  onLike: () => void;
  onPass: () => void;
}

export function ProfileCard({ profile, onLike, onPass }: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex(
      (prev) => (prev - 1 + profile.photos.length) % profile.photos.length
    );
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="relative w-full h-full rounded-3xl overflow-hidden bg-white shadow-2xl"
    >
      {/* Photo Section */}
      <div className="relative h-[70%] overflow-hidden">
        <motion.img
          key={currentPhotoIndex}
          src={profile.photos[currentPhotoIndex]}
          alt={profile.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Photo Navigation Overlay */}
        <div className="absolute inset-0 flex">
          <button
            onClick={prevPhoto}
            className="flex-1 cursor-pointer"
            aria-label="Previous photo"
          />
          <button
            onClick={nextPhoto}
            className="flex-1 cursor-pointer"
            aria-label="Next photo"
          />
        </div>

        {/* Photo Indicators */}
        <div className="absolute top-4 left-0 right-0 flex gap-2 px-4">
          {profile.photos.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${index === currentPhotoIndex ? "w-full" : "w-0"
                  }`}
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Basic Info Overlay */}
        <div className="absolute bottom-4 left-6 right-6 text-white">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-4xl mb-1">
                {profile.name}, {profile.age}
              </h2>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <MapPin className="w-4 h-4" />
                <span>{profile.location}</span>
                <span>•</span>
                <span>{profile.distance}</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowDetails(!showDetails)}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <Info className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <motion.div
        initial={false}
        animate={{ height: showDetails ? "auto" : "30%" }}
        className="bg-white overflow-y-auto"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="w-4 h-4" />
            <span>{profile.occupation}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GraduationCap className="w-4 h-4" />
            <span>{profile.education}</span>
          </div>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-sm text-gray-500 mb-2">About</h3>
                <p className="text-gray-800">{profile.bio}</p>
              </div>

              <div>
                <h3 className="text-sm text-gray-500 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPass}
            className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <X className="w-7 h-7 text-red-500" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLike}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            <Heart className="w-9 h-9 text-white fill-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow text-2xl"
          >
            ⭐
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
