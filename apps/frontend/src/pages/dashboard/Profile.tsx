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
        setProfileData(response.data.data.profile)
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
      let fullUserObject = null;
      const response = await api.put("/profiles/me", payload)
      fullUserObject = response.data.data

      // 2. Upload Avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("profilePicture", avatarFile);
        const avatarRes = await api.post("/profiles/me/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        fullUserObject = avatarRes.data.data;
      }

      // 3. Upload Cover if selected
      if (coverFile) {
        const formData = new FormData();
        formData.append("coverPicture", coverFile);
        const coverRes = await api.post("/profiles/me/cover", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        fullUserObject = coverRes.data.data;
      }

      // Set the local profile view to the nested profile object
      setProfileData(fullUserObject.profile)
      
      // Update global auth store with the full user object
      if (user) {
        setUser(fullUserObject)
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
              onClick={() => setIsEditing(true)}
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
                <AvatarImage src={profileData?.profilePicture} alt={profileData?.firstName} className="object-cover" />
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
