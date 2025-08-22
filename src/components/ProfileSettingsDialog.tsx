import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSettingsDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProfileSettingsDialog({
  children,
  open: controlledOpen,
  onOpenChange,
}: ProfileSettingsDialogProps) {
  const { user } = useAuth();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? (controlledOpen as boolean) : uncontrolledOpen;
  const handleOpenChange = (value: boolean) => {
    if (!isControlled) setUncontrolledOpen(value);
    if (onOpenChange) onOpenChange(value);
  };
  const [displayName, setDisplayName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (open) {
      const currentName = (user?.user_metadata as any)?.display_name || "";
      setDisplayName(currentName);
    }
  }, [open, user]);

  const handleSaveDisplayName = async () => {
    if (!user) return;
    setUpdatingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });
      if (error) throw error;
      toast({ title: "Profile updated", description: "Display name saved." });
    } catch (err: any) {
      toast({
        title: "Failed to update",
        description: err.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingName(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      const redirectTo = "https://styleincheck.vercel.app/auth";
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo,
      });
      if (error) throw error;
      toast({
        title: "Email sent",
        description: "Check your inbox to reset your password.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to send email",
        description: err.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReset(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setNewPassword("");
      toast({
        title: "Password updated",
        description: "Your password has been changed.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to update password",
        description: err.message || "Try again.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Manage your account and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>

          <div className="space-y-3">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
              <Button onClick={handleSaveDisplayName} disabled={updatingName}>
                {updatingName ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Reset Password</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleSendPasswordReset}
                disabled={sendingReset}
              >
                {sendingReset ? "Sending..." : "Send reset email"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="newPassword">Change Password</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="newPassword"
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>

          <Separator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete account</AlertDialogTitle>
                <AlertDialogDescription>
                  Deleting your account requires admin privileges and cannot be
                  done from the client. Contact support or an admin to proceed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button disabled variant="destructive">
                    Delete
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
