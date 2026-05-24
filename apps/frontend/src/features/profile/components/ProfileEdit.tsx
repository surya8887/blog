import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Loader2, Camera, Globe, Briefcase, MessageCircle, Check, XIcon
} from "lucide-react"
import { api } from "@/api/axios"
import { useAuthStore } from "@/store/useAuthStore"
import { profileSchema, type ProfileFormValues, type ProfileData } from "../types"

interface ProfileEditProps {
  profileData: ProfileData;
  onCancel: () => void;
  onSaveSuccess: (updatedProfile: ProfileData) => void;
}

export const ProfileEdit = ({ profileData, onCancel, onSaveSuccess }: ProfileEditProps) => {
  const { user, setUser } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)
  
  // File upload states
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  // Synchronously reset form values
  useEffect(() => {
    if (profileData) {
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
  }, [profileData, reset])

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [avatarPreview, coverPreview])

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
      const socialLinks: Record<string, string> = {}
      if (data.facebookUrl) socialLinks.facebook = data.facebookUrl
      if (data.instagramUrl) socialLinks.instagram = data.instagramUrl
      if (data.linkedinUrl) socialLinks.linkedin = data.linkedinUrl
      if (data.twitterUrl) socialLinks.twitter = data.twitterUrl

      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio || undefined,
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined
      }

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

      // Update global auth store
      if (user) {
        setUser(fullUserObject)
      }
      
      toast.success("Profile updated successfully")
      onSaveSuccess(fullUserObject.profile)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
      <div className="border-b p-6 flex justify-between items-center bg-muted/30">
        <h2 className="text-xl font-semibold">Edit Profile</h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <XIcon className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-0 sm:p-6 space-y-8">
        {/* Images Section */}
        <div className="group">
          {/* Cover Image Upload */}
          <div className="relative h-48 w-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-b sm:rounded-t-xl overflow-hidden">
            {(coverPreview || profileData?.coverPicture) && (
              <img 
                src={coverPreview || profileData?.coverPicture || undefined} 
                alt="Cover Preview" 
                className="w-full h-full object-cover opacity-80" 
              />
            )}
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

          {/* Avatar Upload */}
          <div className="-mt-16 flex justify-center relative z-10 mb-6">
            <div className="relative group/avatar">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={avatarPreview || profileData?.profilePicture || undefined} className="object-cover" />
                <AvatarFallback className="text-4xl">{profileData?.firstName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
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

        {/* Basic Details */}
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

        {/* Contact & Personal */}
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

        {/* Social Links */}
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

        {/* Actions */}
        <div className="flex justify-end pt-4 gap-4 border-t px-6 sm:px-0">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
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
  )
}
