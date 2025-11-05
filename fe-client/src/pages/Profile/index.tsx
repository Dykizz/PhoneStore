import { useState, useRef } from 'react'
import type { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showToast } from '@/utils/toast'
import { getMyProfile, updateProfile, changePassword } from '@/apis/user.api'
import { uploadImages } from '@/apis/upload.api'
import {
  ProfileSchema,
  ChangePasswordSchema
} from '@/types/user.type' 
import type { DetailUser } from '@/types/user.type'
import type {
  ApiResponseSuccess
} from '@/interfaces/apiResponse.interface'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, KeyRound, User } from 'lucide-react'

type ProfileView = 'profile' | 'password'

// =================== Profile Form ===================
function ProfileForm() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getMyProfile
  })
  const user = profileData?.data

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    values: user ? { userName: user.userName } : { userName: '' },
    defaultValues: {
      userName: ''
    }
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadImages, 
    onError: () => {
      showToast({
        type: 'error',
        title: 'Tải ảnh thất bại',
        description: 'Không thể tải ảnh lên.'
      })
    }
  })

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res: ApiResponseSuccess<DetailUser>) => {
      showToast({
        type: 'success',
        title: 'Cập nhật thành công!',
        description: 'Cập nhật thông tin thành công.'
      })
      queryClient.setQueryData(['profile'], res)
      setPreviewUrl(null)
      setSelectedFile(null)
    },
    onError: () => {
      showToast({
        type: 'error',
        title: 'Cập nhật thất bại!',
        description: 'Cập nhật thông tin thất bại.'
      })
    }
  })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const onSubmit = async (values: z.infer<typeof ProfileSchema>) => {
    let avatarUrl = user?.avatar 

    if (selectedFile) {
      try {
        const urls = await uploadAvatarMutation.mutateAsync([selectedFile])

        if (!urls || urls.length === 0) {
          throw new Error('Không nhận được URL sau khi tải lên')
        }
        
        avatarUrl = urls[0] 
      } catch (error) {
        showToast({
          type: 'error',
          title: 'Lỗi tải ảnh',
          description: (error as Error).message
        })
        return 
      }
    }

    updateProfileMutation.mutate({
      userName: values.userName,
      avatar: avatarUrl
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-8 w-1/3' />
          <Skeleton className='h-4 w-2/3' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <Skeleton className='h-24 w-24 rounded-full' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lỗi</CardTitle>
          <CardDescription>
            Không thể tải thông tin hồ sơ.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hồ sơ công khai</CardTitle>
        <CardDescription>
          Thông tin này sẽ được hiển thị trên trang.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              className='hidden'
              accept='image/png, image/jpeg, image/webp'
            />

            <FormItem className='flex justify-center'>
              <button
                type='button'
                onClick={handleAvatarClick}
                className='relative group rounded-full'
              >
                <Avatar className='h-24 w-24'>
                  <AvatarImage
                    src={previewUrl || user.avatar}
                    alt={user.userName}
                  />
                  <AvatarFallback>
                    {user.userName?.[0].toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='absolute inset-0 h-full w-full rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                  <Camera className='h-8 w-8 text-white' />
                </div>
              </button>
            </FormItem>

            <FormField
              control={form.control}
              name='userName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên người dùng</FormLabel>
                  <FormControl>
                    <Input placeholder='Tên người dùng' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input readOnly disabled value={user.email || ''} />
              </FormControl>
            </FormItem>

            <Button
              type='submit'
              disabled={
                updateProfileMutation.isPending ||
                uploadAvatarMutation.isPending
              }
            >
              {updateProfileMutation.isPending ||
              uploadAvatarMutation.isPending
                ? 'Đang lưu...'
                : 'Lưu thay đổi'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// =================== Password Form ===================
function PasswordForm() {
  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      showToast({
        type: 'success',
        title: 'Đổi mật khẩu thành công!',
        description: 'Đã đổi mật khẩu thành công!'
      })
      form.reset()
    },
    onError: () => {
      showToast({
        type: 'error',
        title: 'Đổi mật khẩu thất bại!',
        description: 'Đổi mật khẩu không thành công!'
      })
    }
  })

  function onSubmit(values: z.infer<typeof ChangePasswordSchema>) {
    changePasswordMutation.mutate(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mật khẩu</CardTitle>
        <CardDescription>
          Thay đổi mật khẩu của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu cũ</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <Input type='password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending
                ? 'Đang lưu...'
                : 'Đổi mật khẩu'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// =================== Main Page ===================
export default function ProfilePage() {
  const [view, setView] = useState<ProfileView>('profile')

  return (
    <div className='container mx-auto max-w-6xl py-10'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
        {/* Cột Menu bên trái */}
        <nav className='md:col-span-1 flex flex-col space-y-1'>
          <Button
            variant={view === 'profile' ? 'secondary' : 'ghost'}
            onClick={() => setView('profile')}
            className='justify-start'
          >
            <User className='mr-2 h-4 w-4' />
            Hồ sơ
          </Button>
          <Button
            variant={view === 'password' ? 'secondary' : 'ghost'}
            onClick={() => setView('password')}
            className='justify-start'
          >
            <KeyRound className='mr-2 h-4 w-4' />
            Mật khẩu
          </Button>
        </nav>

        <div className='md:col-span-3'>
          {view === 'profile' && <ProfileForm />}
          {view === 'password' && <PasswordForm />}
        </div>
      </div>
    </div>
  )
}