import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Spinner } from "@/components/shared/Spinner"
import { profilesApi } from "@/api/profiles.api"
import { getErrorMessage } from "@/lib/error"
import { ProfileView } from "@/features/profile/components/ProfileView"
import { ProfileEdit } from "@/features/profile/components/ProfileEdit"
import type { ProfileData } from "@/features/profile/types"

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  useEffect(() => {
    let cancelled = false
    profilesApi
      .getMe()
      .then((user) => {
        if (!cancelled) setProfileData(user.profile)
      })
      .catch((err) => toast.error(getErrorMessage(err, "Failed to load profile details")))
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="text-center p-8 text-muted-foreground">Profile data not available.</div>
    )
  }

  return (
    <div className="space-y-6">
      {isEditing ? (
        <ProfileEdit
          profileData={profileData}
          onCancel={() => setIsEditing(false)}
          onSaveSuccess={(updated) => {
            setProfileData(updated)
            setIsEditing(false)
          }}
        />
      ) : (
        <ProfileView profileData={profileData} onEditClick={() => setIsEditing(true)} />
      )}
    </div>
  )
}
