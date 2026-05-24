import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"
import { api } from "@/api/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Loader2, Edit2, MapPin, Phone, User as UserIcon, Calendar, 
  Globe, Camera, Briefcase, MessageCircle, Check, XIcon
} from "lucide-react"

// Ensure dates are converted cleanly
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().max(500, "Bio is too long").optional().nullable(),
  profilePicture: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
  coverPicture: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  facebookUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
  instagramUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
  linkedinUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
  twitterUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export const Profile = () => {
  const { user, setUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  // Fetch complete profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profiles/me")
        const data = response.data.data
        setProfileData(data)
        
        // Parse socialLinks safely
        const socials = data.socialLinks || {}
        
        // Format birthDate to YYYY-MM-DD for date input
        let formattedDate = ""
        if (data.birthDate) {
          try {
            formattedDate = new Date(data.birthDate).toISOString().split('T')[0]
          } catch (e) {}
        }

        reset({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          bio: data.bio || "",
          profilePicture: data.profilePicture || "",
          coverPicture: data.coverPicture || "",
          phone: data.phone || "",
          birthDate: formattedDate,
          gender: data.gender || "",
          address: data.address || "",
          facebookUrl: socials.facebook || "",
          instagramUrl: socials.instagram || "",
          linkedinUrl: socials.linkedin || "",
          twitterUrl: socials.twitter || "",
        })
      } catch (error) {
        toast.error("Failed to load profile details")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [reset, isEditing]) // Re-fetch or re-reset when exiting edit mode

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      // Build social links object
      const socialLinks: Record<string, string> = {}
      if (data.facebookUrl) socialLinks.facebook = data.facebookUrl
      if (data.instagramUrl) socialLinks.instagram = data.instagramUrl
      if (data.linkedinUrl) socialLinks.linkedin = data.linkedinUrl
      if (data.twitterUrl) socialLinks.twitter = data.twitterUrl

      // Prepare payload exactly as backend expects
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio || undefined,
        profilePicture: data.profilePicture || undefined,
        coverPicture: data.coverPicture || undefined,
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined
      }

      // Format date to ISO string if provided
      if (data.birthDate) {
        payload.birthDate = new Date(data.birthDate).toISOString()
      }

      const response = await api.put("/profiles/me", payload)
      const updatedProfile = response.data.data
      setProfileData(updatedProfile)
      
      // Update global auth store
      if (user) {
        setUser({ ...user, profile: updatedProfile })
      }
      
      toast.success("Profile updated successfully")
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const socials = profileData?.socialLinks || {}

  return (
    <div className="space-y-6">
      {/* View Mode */}
      {!isEditing ? (
        <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 w-full bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {profileData?.coverPicture && (
              <img 
                src={profileData.coverPicture} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute top-4 right-4 shadow-sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          {/* Profile Details Container */}
          <div className="px-6 pb-6 sm:px-10 relative">
            {/* Avatar overlapping cover */}
            <div className="-mt-16 sm:-mt-20 mb-4 flex justify-between items-end">
              <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-background shadow-lg">
                <AvatarImage src={profileData?.profilePicture} alt={profileData?.firstName} className="object-cover" />
                <AvatarFallback className="text-4xl">{profileData?.firstName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Bio */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold">{profileData?.firstName} {profileData?.lastName}</h1>
              {profileData?.bio ? (
                <p className="text-muted-foreground mt-2 max-w-2xl">{profileData.bio}</p>
              ) : (
                <p className="text-muted-foreground italic mt-2 opacity-60">No bio provided.</p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 py-4 border-t border-border">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-3 text-primary/70" />
                <span>{profileData?.address || "No address provided"}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-5 w-5 mr-3 text-primary/70" />
                <span>{profileData?.phone || "No phone number provided"}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-5 w-5 mr-3 text-primary/70" />
                <span>
                  {profileData?.birthDate 
                    ? new Date(profileData.birthDate).toLocaleDateString() 
                    : "No birth date provided"}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <UserIcon className="h-5 w-5 mr-3 text-primary/70" />
                <span>{profileData?.gender || "No gender specified"}</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-6 border-t border-border flex gap-4">
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-blue-600 transition-colors">
                  <Globe className="h-6 w-6" />
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-pink-600 transition-colors">
                  <Camera className="h-6 w-6" />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-blue-400 transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-blue-700 transition-colors">
                  <Briefcase className="h-6 w-6" />
                </a>
              )}
              {(!socials.facebook && !socials.instagram && !socials.twitter && !socials.linkedin) && (
                <span className="text-sm text-muted-foreground italic">No social links added.</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
          <div className="border-b p-6 flex justify-between items-center bg-muted/30">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              <XIcon className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Images Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="profilePicture">Avatar URL</Label>
                  <Input id="profilePicture" placeholder="https://example.com/avatar.jpg" {...register("profilePicture")} />
                  {errors.profilePicture && <p className="text-sm text-destructive">{errors.profilePicture.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverPicture">Cover Image URL</Label>
                  <Input id="coverPicture" placeholder="https://example.com/cover.jpg" {...register("coverPicture")} />
                  {errors.coverPicture && <p className="text-sm text-destructive">{errors.coverPicture.message}</p>}
                </div>
              </div>
            </div>

            {/* Basic Details Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" placeholder="John" {...register("firstName")} />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Doe" {...register("lastName")} />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us a little bit about yourself" {...register("bio")} />
                {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
              </div>
            </div>

            {/* Contact & Personal Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Contact & Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+1234567890" {...register("phone")} />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Date of Birth</Label>
                  <Input id="birthDate" type="date" {...register("birthDate")} />
                  {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input id="gender" placeholder="e.g. Male, Female, Non-binary" {...register("gender")} />
                  {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main St, City, Country" {...register("address")} />
                  {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg border-b pb-2">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 relative">
                  <Label htmlFor="facebookUrl" className="flex items-center"><Globe className="h-4 w-4 mr-2" /> Facebook URL</Label>
                  <Input id="facebookUrl" placeholder="https://facebook.com/..." {...register("facebookUrl")} />
                  {errors.facebookUrl && <p className="text-sm text-destructive">{errors.facebookUrl.message}</p>}
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="instagramUrl" className="flex items-center"><Camera className="h-4 w-4 mr-2" /> Instagram URL</Label>
                  <Input id="instagramUrl" placeholder="https://instagram.com/..." {...register("instagramUrl")} />
                  {errors.instagramUrl && <p className="text-sm text-destructive">{errors.instagramUrl.message}</p>}
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="twitterUrl" className="flex items-center"><MessageCircle className="h-4 w-4 mr-2" /> Twitter/X URL</Label>
                  <Input id="twitterUrl" placeholder="https://twitter.com/..." {...register("twitterUrl")} />
                  {errors.twitterUrl && <p className="text-sm text-destructive">{errors.twitterUrl.message}</p>}
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="linkedinUrl" className="flex items-center"><Briefcase className="h-4 w-4 mr-2" /> LinkedIn URL</Label>
                  <Input id="linkedinUrl" placeholder="https://linkedin.com/in/..." {...register("linkedinUrl")} />
                  {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl.message}</p>}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end pt-4 gap-4 border-t">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
