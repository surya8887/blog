import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Briefcase, Camera, Check, Globe, Loader2, MessageCircle, X as XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { profilesApi } from "@/api/profiles.api"
import { useAuthStore } from "@/store/useAuthStore"
import { getErrorMessage } from "@/lib/error"
import { getInitial } from "@/lib/format"
import { profileSchema, type ProfileFormValues, type ProfileData } from "../types"
import type { Profile } from "@/types"

interface ProfileEditProps {
  profileData: ProfileData
  onCancel: () => void
  onSaveSuccess: (updatedProfile: ProfileData) => void
}

export const ProfileEdit = ({ profileData, onCancel, onSaveSuccess }: ProfileEditProps) => {
  const { user, setUser } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    if (!profileData) return
    const socials = profileData.socialLinks ?? {}
    let formattedDate = ""
    if (profileData.birthDate) {
      const d = new Date(profileData.birthDate)
      if (!Number.isNaN(d.getTime())) {
        formattedDate = d.toISOString().split("T")[0] ?? ""
      }
    }
    reset({
      firstName: profileData.firstName ?? "",
      lastName: profileData.lastName ?? "",
      bio: profileData.bio ?? "",
      phone: profileData.phone ?? "",
      birthDate: formattedDate,
      gender: profileData.gender ?? "",
      address: profileData.address ?? "",
      facebookUrl: socials.facebook ?? "",
      instagramUrl: socials.instagram ?? "",
      linkedinUrl: socials.linkedin ?? "",
      twitterUrl: socials.twitter ?? "",
    })
  }, [profileData, reset])

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [avatarPreview, coverPreview])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true)
    try {
      const socialLinks: Record<string, string> = {}
      if (data.facebookUrl) socialLinks.facebook = data.facebookUrl
      if (data.instagramUrl) socialLinks.instagram = data.instagramUrl
      if (data.linkedinUrl) socialLinks.linkedin = data.linkedinUrl
      if (data.twitterUrl) socialLinks.twitter = data.twitterUrl

      const payload: Partial<Profile> = {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio || undefined,
        phone: data.phone || undefined,
        gender: data.gender || undefined,
        address: data.address || undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      }

      if (data.birthDate) {
        payload.birthDate = new Date(data.birthDate).toISOString()
      }

      let updatedUser = await profilesApi.updateMe(payload)

      if (avatarFile) {
        updatedUser = await profilesApi.uploadAvatar(avatarFile)
      }
      if (coverFile) {
        updatedUser = await profilesApi.uploadCover(coverFile)
      }

      if (user) setUser(updatedUser)
      toast.success("Profile updated successfully")
      if (updatedUser.profile) onSaveSuccess(updatedUser.profile)
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile"))
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
        {/* Cover + Avatar */}
        <div className="group">
          <div className="relative h-48 w-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-b sm:rounded-t-xl overflow-hidden">
            {(coverPreview || profileData?.coverPicture) && (
              <img
                src={coverPreview ?? profileData?.coverPicture ?? undefined}
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

          <div className="-mt-16 flex justify-center relative z-10 mb-6">
            <div className="relative group/avatar">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={avatarPreview ?? profileData?.profilePicture ?? undefined} className="object-cover" />
                <AvatarFallback className="text-4xl">{getInitial(profileData?.firstName, "U")}</AvatarFallback>
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
        <Section title="Basic Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField id="firstName" label="First Name *" placeholder="John" error={errors.firstName?.message} {...register("firstName")} />
            <FormField id="lastName" label="Last Name *" placeholder="Doe" error={errors.lastName?.message} {...register("lastName")} />
          </div>
          <FormField id="bio" label="Bio" placeholder="Tell us a little bit about yourself" error={errors.bio?.message} {...register("bio")} />
        </Section>

        {/* Contact & Personal */}
        <Section title="Contact & Personal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField id="phone" label="Phone Number" placeholder="+1234567890" error={errors.phone?.message} {...register("phone")} />
            <FormField id="birthDate" label="Date of Birth" type="date" error={errors.birthDate?.message} {...register("birthDate")} />
            <FormField id="gender" label="Gender" placeholder="e.g. Male, Female, Non-binary" error={errors.gender?.message} {...register("gender")} />
            <FormField id="address" label="Address" placeholder="123 Main St, City, Country" error={errors.address?.message} {...register("address")} />
          </div>
        </Section>

        {/* Social Links */}
        <Section title="Social Links">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField id="facebookUrl" label="Facebook URL" icon={Globe} placeholder="https://facebook.com/..." error={errors.facebookUrl?.message} {...register("facebookUrl")} />
            <FormField id="instagramUrl" label="Instagram URL" icon={Camera} placeholder="https://instagram.com/..." error={errors.instagramUrl?.message} {...register("instagramUrl")} />
            <FormField id="twitterUrl" label="Twitter/X URL" icon={MessageCircle} placeholder="https://twitter.com/..." error={errors.twitterUrl?.message} {...register("twitterUrl")} />
            <FormField id="linkedinUrl" label="LinkedIn URL" icon={Briefcase} placeholder="https://linkedin.com/in/..." error={errors.linkedinUrl?.message} {...register("linkedinUrl")} />
          </div>
        </Section>

        {/* Actions */}
        <div className="flex justify-end pt-4 gap-4 border-t px-6 sm:px-0">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 px-6 sm:px-0">
      <h3 className="font-medium text-lg border-b pb-2">{title}</h3>
      {children}
    </div>
  )
}

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  icon?: React.ComponentType<{ className?: string }>
}

const FormField = (props: FormFieldProps) => {
  const { id, label, error, icon: Icon, className, ...rest } = props
  return (
    <div className="space-y-2 relative">
      <Label htmlFor={id} className={Icon ? "flex items-center" : undefined}>
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        {label}
      </Label>
      <Input id={id} className={className} {...rest} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
