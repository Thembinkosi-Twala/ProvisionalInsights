
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProvincialInsightsIcon } from '@/components/icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Uploader');
  const [isMfaOpen, setIsMfaOpen] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLoginAttempt = () => {
    // In a real app, you'd verify username/password first
    setIsMfaOpen(true);
  };

  const handleMfaVerification = () => {
    // Mock MFA verification - any 6 digit code is valid for demo
    if (mfaCode.length === 6 && /^\d+$/.test(mfaCode)) {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userRole', role);
      router.push('/');
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid MFA Code',
        description: 'Please enter a valid 6-digit code.',
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <ProvincialInsightsIcon className="w-12 h-12 mx-auto mb-4" />
            <CardTitle>Provincial Insights</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin@provincial.gov"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Uploader">Document Uploader</SelectItem>
                      <SelectItem value="Approver">Approver</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleLoginAttempt} className="w-full">
              Login
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isMfaOpen} onOpenChange={setIsMfaOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mfa" className="text-right">
                Code
              </Label>
              <Input
                id="mfa"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="col-span-3"
                maxLength={6}
                placeholder="123456"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleMfaVerification}>Verify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoginPage;
