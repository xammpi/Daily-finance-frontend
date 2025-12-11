import { useState, useEffect, FormEvent, useCallback } from 'react'
import { User, Mail, Lock, Save, Shield, UserCircle } from 'lucide-react'
import { userApi } from '@/api/user'
import type { User as UserType, UpdateProfileRequest, ChangePasswordRequest } from '@/types'
import Layout from '@/components/Layout'
import { toast } from '@/lib/toast'
import { extractErrorMessage } from '@/utils/errorHandler'

import { logger } from '@/utils/logger'
export default function AccountPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Profile form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Memoize fetchProfile to avoid recreating on every render
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true)
      const userData = await userApi.getProfile()
      setUser(userData)
      setFirstName(userData.firstName)
      setLastName(userData.lastName)
      setEmail(userData.email)
    } catch (err) {
      logger.error('Failed to fetch profile', err)
      toast.error('Failed to load profile')
    } finally {
      setIsLoadingProfile(false)
    }
  }, [])

  useEffect(() => {
    void fetchProfile()
  }, [fetchProfile])

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault()

    const profileData: UpdateProfileRequest = {
      firstName,
      lastName,
      email,
    }

    try {
      setIsUpdatingProfile(true)
      const updatedUser = await userApi.updateProfile(profileData)
      setUser(updatedUser)
      toast.success('Profile updated successfully')
    } catch (err) {
      logger.error('Failed to update profile', err)
      const errorMessage = extractErrorMessage(err)
      toast.error(errorMessage)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    // Validate password length
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }

    const passwordData: ChangePasswordRequest = {
      currentPassword,
      newPassword,
    }

    try {
      setIsChangingPassword(true)
      await userApi.changePassword(passwordData)
      toast.success('Password changed successfully')
      // Clear password fields
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      logger.error('Failed to change password', err)
      const errorMessage = extractErrorMessage(err)
      toast.error(errorMessage)
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoadingProfile) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" aria-hidden="true" />
            <p className="text-slate-600">Loading account information...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
          <p className="mt-1 text-slate-600">Manage your profile and security settings</p>
        </div>

        {/* User Info Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 p-8 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm">
              <UserCircle className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="mt-1 text-lg text-white/90">@{user?.username}</p>
              <p className="mt-1 text-sm text-white/80">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Information Form */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Profile Information</h2>
                  <p className="text-sm text-white/90">Update your personal details</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
              <div>
                <label htmlFor="firstName" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="h-4 w-4" />
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="h-4 w-4" />
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Save className="h-5 w-5" />
                  {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shadow-lg backdrop-blur-sm">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Change Password</h2>
                  <p className="text-sm text-white/90">Update your security credentials</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-5">
              <div>
                <label htmlFor="currentPassword" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Lock className="h-4 w-4" />
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Lock className="h-4 w-4" />
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter new password (min 6 characters)"
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Lock className="h-4 w-4" />
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Shield className="h-5 w-5" />
                  {isChangingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
