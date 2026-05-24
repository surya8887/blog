import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { api } from "@/api/axios"
import { ProfileView } from "@/features/profile/components/ProfileView"
import { ProfileEdit } from "@/features/profile/components/ProfileEdit"
import type { ProfileData } from "@/features/profile/types"

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  // Fetch complete profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profiles/me")
        setProfileData(response.data.data.profile)
      } catch (error) {
        toast.error("Failed to load profile details")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleSaveSuccess = (updatedProfile: ProfileData) => {
    setProfileData(updatedProfile)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {!isEditing && profileData ? (
        <ProfileView 
          profileData={profileData} 
          onEditClick={() => setIsEditing(true)} 
        />
      ) : profileData ? (
        <ProfileEdit 
          profileData={profileData} 
          onCancel={() => setIsEditing(false)}
          onSaveSuccess={handleSaveSuccess}
        />
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          Profile data not available.
        </div>
      )}
    </div>
  )
}
