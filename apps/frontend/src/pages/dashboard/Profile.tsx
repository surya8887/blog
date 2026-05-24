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
  
  // File upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  // Fetch complete profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profiles/me")
        setProfileData(response.data.data)
      } catch (error) {
        toast.error("Failed to load profile details")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
    
    // Cleanup object URLs to avoid memory leaks
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, []) // Fetch once on mount

  // Initialize react-hook-form
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  // Synchronously reset form values whenever profileData or isEditing changes
  useEffect(() => {
    if (profileData && isEditing) {
      const socials = profileData.socialLinks || {}
      
      let formattedDate = ""
      if (profileData.birthDate) {
        try {
          formattedDate = new Date(profileData.birthDate).toISOString().split('T')[0]
        } catch (e) {}
      }

      reset({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        bio: profileData.bio || "",
        phone: profileData.phone || "",
        birthDate: formattedDate,
        gender: profileData.gender || "",
        address: profileData.address || "",
        facebookUrl: socials.facebook || "",
        instagramUrl: socials.instagram || "",
        linkedinUrl: socials.linkedin || "",
        twitterUrl: socials.twitter || "",
      })
    }
  }, [profileData, isEditing, reset])

  // Handlers for file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

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
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined
      }

      // Format date to ISO string if provided
      if (data.birthDate) {
        payload.birthDate = new Date(data.birthDate).toISOString()
      }

      // 1. Update basic profile info
      let currentProfile = null;
      const response = await api.put("/profiles/me", payload)
      currentProfile = response.data.data

      // 2. Upload Avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("profilePicture", avatarFile);
        const avatarRes = await api.post("/profiles/me/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        currentProfile = avatarRes.data.data;
      }

      // 3. Upload Cover if selected
      if (coverFile) {
        const formData = new FormData();
        formData.append("coverPicture", coverFile);
        const coverRes = await api.post("/profiles/me/cover", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        currentProfile = coverRes.data.data;
      }

      setProfileData(currentProfile)
      
      // Update global auth store
      if (user) {
        setUser({ ...user, profile: currentProfile })
      }
      
      // Reset file states
      setAvatarFile(null)
      setCoverFile(null)
      setAvatarPreview(null)
      setCoverPreview(null)
      
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

          <form onSubmit={handleSubmit(onSubmit)} className="p-0 sm:p-6 space-y-8">
            {/* Images Section (Visual Editor) */}
            <div className="group">
              {/* Cover Image Upload Area */}
              <div className="relative h-48 w-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-b sm:rounded-t-xl overflow-hidden">
                {(coverPreview || profileData?.coverPicture) && (
                  <img 
                    src={coverPreview || profileData?.coverPicture} 
                    alt="Cover Preview" 
                    className="w-full h-full object-cover opacity-80" 
                  />
                )}
                {/* Button for uploading cover */}
                <Button 
                  asChild
                  size="sm" 
                  variant="secondary" 
{statusCode: 500, data: null, message: "Internal Server Error", success: false}
data
: 
null
message
: 
"Internal Server Error"
statusCode
: 
500
success
: 
false
                  className="absolute top-4 right-4 shadow-sm cursor-pointer hover:bg-secondary/80"
                >
                  <Label htmlFor="coverUpload" className="cursor-pointer flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Cover
                  </Label>
                </Button>
                <Input 
                  id="coverUpload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>

              {/* Avatar Upload Area (Centered & Overlapping) */}
              <div className="-mt-16 flex justify-center relative z-10 mb-6">
                <div className="relative group/avatar">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={avatarPreview || profileData?.profilePicture} className="object-cover" />
                    <AvatarFallback className="text-4xl">{profileData?.firstName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  {/* Overlay for uploading avatar */}
                  <Label 
                    htmlFor="avatarUpload" 
                    className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border-4 border-transparent"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </Label>
                  <Input 
                    id="avatarUpload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Basic Details Section */}
            <div className="space-y-4 px-6 sm:px-0">
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
            <div className="space-y-4 px-6 sm:px-0">
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
            <div className="space-y-4 px-6 sm:px-0">
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
            <div className="flex justify-end pt-4 gap-4 border-t px-6 sm:px-0">
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
