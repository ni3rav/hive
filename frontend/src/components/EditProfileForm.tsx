import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEditProfile } from "@/hooks/useAuth";
import { type User } from "@/api/auth";
import { Loader2, Check, X } from "lucide-react";

interface EditProfileFormProps {
  user: User;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function EditProfileForm({ user, onCancel, onSuccess }: EditProfileFormProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<{ name?: string; email?: string; general?: string }>({});
  
  const editProfileMutation = useEditProfile();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!name.trim() && !email.trim()) {
      newErrors.general = "At least one field must be filled";
      setErrors(newErrors);
      return false;
    }
    
    if (name.trim() && name.trim().length < 1) {
      newErrors.name = "Name must be at least 1 character";
    }
    
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const updateData: { name?: string; email?: string } = {};
    
    if (name.trim() !== user.name) {
      updateData.name = name.trim();
    }
    if (email.trim() !== user.email) {
      updateData.email = email.trim();
    }
    
    if (Object.keys(updateData).length === 0) {
      onCancel();
      return;
    }
    
    editProfileMutation.mutate(updateData, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error: unknown) => {
        let errorMessage = "Failed to update profile";
        if (error && typeof error === 'object' && 'response' in error) {
          const response = (error as { response?: { data?: { message?: string } } }).response;
          if (response?.data?.message) {
            errorMessage = response.data.message;
          }
        }
        setErrors({ general: errorMessage });
      },
    });
  };

  const hasChanges = name.trim() !== user.name || email.trim() !== user.email;

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your name and email address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          
          {errors.general && (
            <p className="text-sm text-destructive">{errors.general}</p>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={editProfileMutation.isPending || !hasChanges}
              className="flex-1"
            >
              {editProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={editProfileMutation.isPending}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
