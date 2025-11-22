"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Upload } from 'lucide-react'
import Image from 'next/image'
import { toast } from "sonner"
import { Book } from '@/types/BookCard'

interface EditBookCardProps {
  book: Book
  onSuccess: () => void
  onCancel: () => void
}

function EditBookCard({ book, onSuccess, onCancel }: EditBookCardProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: book.title || '',
    author: book.author || '',
    description: book.description || '',
    category: book.category || '',
    packageType: book.packageType || 'free',
    totalCopies: book.totalCopies || 1,
    isbn: book.isbn || ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(book.imageUrl || '')

  // Close form when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('[data-radix-select-trigger]') ||
        target.closest('[data-radix-select-content]') ||
        target.closest('[data-radix-select-item]') ||
        target.closest('[data-radix-select-viewport]')
      ) {
        return;
      }
      if (formRef.current && !formRef.current.contains(target)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ✅ Validate required fields
    if (!formData.title || !formData.author || !formData.description || !formData.isbn) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('id', book._id) // ✅ Include book ID
      formDataToSend.append('title', formData.title)
      formDataToSend.append('author', formData.author)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category', formData.category)
      formDataToSend.append('packageType', formData.packageType)
      formDataToSend.append('totalCopies', formData.totalCopies.toString())
      formDataToSend.append('isbn', formData.isbn)
      
      // Only append image if a new one was selected
      if (imageFile) {
        formDataToSend.append('image', imageFile)
      }
      
      const response = await fetch('/api/admin/resources', {
        method: 'PUT',
        body: formDataToSend
      })
      
      if (response.ok) {
        onSuccess()
        toast.success("Book updated successfully!")
      } else {
        const error = await response.json();
        toast.error(`Failed to update book: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to update book:', error)
      toast.error('Failed to update book. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview for selected file
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(book.imageUrl || '') // Reset to original image
  }

  return (
     <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-[34rem] min-h-[400px] max-h-[60vh] overflow-y-auto" ref={formRef}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Book</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="isbn">ISBN *</Label>
            <Input
              id="isbn"
              value={formData.isbn}
              onChange={(e) => handleChange('isbn', e.target.value)}
              required
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-gray-300">Cover Image</Label>
            <div 
              className={`
                relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                transition-all duration-200 ease-in-out group
                ${
                  imagePreview 
                    ? 'border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-gray-500' 
                    : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-700/50'
                }
              `}
              onClick={() => document.getElementById('imageFile')?.click()}
            >
              <Input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative w-full">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 z-10 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-600 border shadow-sm hover:bg-gray-50 dark:hover:bg-gray-500 dark:border-gray-500"
                  >
                    <X className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                  </Button>
                  
                  <div className="relative w-full h-48 bg-white/20 dark:bg-gray-600/20 rounded-md overflow-hidden mb-3">
                    <Image
                      src={imagePreview}
                      alt="Book cover preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                      {imageFile ? 'New image selected - Click to change' : 'Current image - Click to change'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3 group-hover:text-gray-500 dark:group-hover:text-gray-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select new cover image (optional)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="Fiction, Programming, etc."
            />
          </div>

          <div>
            <Label htmlFor="packageType">Access Level *</Label>
            <Select value={formData.packageType} onValueChange={(value) => handleChange('packageType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="totalCopies">Total Copies (must be more than current {formData.totalCopies})</Label>
            <Input
              id="totalCopies"
              type="number"
              min="1"
              value={formData.totalCopies}
              onChange={(e) => handleChange('totalCopies', parseInt(e.target.value))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Updating...' : 'Update Book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBookCard