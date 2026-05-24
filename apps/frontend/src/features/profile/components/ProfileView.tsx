import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, User as UserIcon, Calendar, Edit2 } from "lucide-react"
import type { ProfileData } from "../types"

interface ProfileViewProps {
  profileData: ProfileData;
  onEditClick: () => void;
}

export const ProfileView = ({ profileData, onEditClick }: ProfileViewProps) => {
  const socials = profileData?.socialLinks || {}

  return (
    <div className="rounded-3xl border border-white/5 bg-card/80 backdrop-blur-xl text-card-foreground shadow-2xl overflow-hidden pb-10 relative">
      {/* Subtle background glow effect */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Cover Image */}
      <div className="h-64 w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative group">
        {profileData?.coverPicture && (
          <img 
            src={profileData.coverPicture} 
            alt="Cover" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
        <Button 
          size="sm" 
          variant="secondary" 
          className="absolute top-6 right-6 shadow-xl bg-black/40 backdrop-blur-md hover:bg-black/60 text-white border border-white/10 rounded-full px-4 py-5 transition-all duration-300"
          onClick={onEditClick}
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Details Container */}
      <div className="px-6 sm:px-12 relative flex flex-col md:flex-row gap-8 md:gap-12 z-10">
        {/* Avatar overlapping cover */}
        <div className="-mt-24 md:-mt-28 flex-shrink-0 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
          <Avatar className="h-44 w-44 md:h-52 md:w-52 border-[6px] border-background shadow-2xl relative">
            <AvatarImage src={profileData?.profilePicture || undefined} alt={profileData?.firstName} className="object-cover" />
            <AvatarFallback className="text-6xl font-light text-muted-foreground bg-muted">
              {profileData?.firstName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name, Bio and Links */}
        <div className="flex-grow pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {profileData?.firstName} {profileData?.lastName}
              </h1>
              {profileData?.bio ? (
                <p className="text-muted-foreground mt-4 text-lg leading-relaxed">{profileData.bio}</p>
              ) : (
                <p className="text-muted-foreground italic mt-4 opacity-60">No bio provided.</p>
              )}
            </div>

            {/* Social Links as modern pills */}
            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noreferrer" className="flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-blue-500/25 hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer" className="flex items-center justify-center h-12 w-12 rounded-2xl bg-pink-500/10 text-pink-500 border border-pink-500/20 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-pink-500/25 hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noreferrer" className="flex items-center justify-center h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 hover:bg-sky-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-sky-500/25 hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-center h-12 w-12 rounded-2xl bg-blue-700/10 text-blue-600 border border-blue-700/20 hover:bg-blue-700 hover:text-white transition-all duration-300 shadow-sm hover:shadow-blue-700/25 hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Details Grid - Modern Glass Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-10">
            <div className="group flex items-center p-5 rounded-2xl bg-muted/30 border border-white/5 hover:bg-muted/50 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mr-5 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-transform duration-300">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">Location</p>
                <p className="text-[15px] font-semibold text-foreground/90">{profileData?.address || "Not specified"}</p>
              </div>
            </div>

            <div className="group flex items-center p-5 rounded-2xl bg-muted/30 border border-white/5 hover:bg-muted/50 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mr-5 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-transform duration-300">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">Phone</p>
                <p className="text-[15px] font-semibold text-foreground/90">{profileData?.phone || "Not specified"}</p>
              </div>
            </div>

            <div className="group flex items-center p-5 rounded-2xl bg-muted/30 border border-white/5 hover:bg-muted/50 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mr-5 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-transform duration-300">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">Birth Date</p>
                <p className="text-[15px] font-semibold text-foreground/90">
                  {profileData?.birthDate 
                    ? new Date(profileData.birthDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="group flex items-center p-5 rounded-2xl bg-muted/30 border border-white/5 hover:bg-muted/50 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mr-5 text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-transform duration-300">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">Gender</p>
                <p className="text-[15px] font-semibold text-foreground/90 capitalize">{profileData?.gender || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
