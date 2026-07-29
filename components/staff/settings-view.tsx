"use client";

import { useState } from "react";
import { Check, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/staff/page-header";
import { CURRENT_STAFF_USER } from "@/src/lib/staff-data";

export function SettingsView() {
  const [name, setName] = useState(CURRENT_STAFF_USER.name);
  const [email, setEmail] = useState("maria.santos@usc.edu.ph");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [notify, setNotify] = useState(true);
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Profile & account"
        actions={
          <>
            {saved && (
              <Badge variant="secondary" className="bg-success/15 text-success-strong">
                <CheckCircle2 /> Saved
              </Badge>
            )}
            <Button type="button" onClick={save}>
              <Check /> Save changes
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-6 p-5 sm:p-8">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarFallback className="bg-brand text-lg text-primary-foreground">
                  {CURRENT_STAFF_USER.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline">
                  <Upload /> Upload photo
                </Button>
                <Button type="button" size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                  Remove
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-name">Full name</Label>
                <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-email">Email</Label>
                <Input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="font-utility text-xs font-bold tracking-wide text-muted-foreground uppercase">
                Role
              </span>
              <Badge className="bg-brand text-primary-foreground">{CURRENT_STAFF_USER.role}</Badge>
              <span className="text-xs text-muted-foreground">Contact an administrator to change your role.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 sm:max-w-xs">
              <Label htmlFor="settings-current-pw">Current password</Label>
              <Input
                id="settings-current-pw"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-new-pw">New password</Label>
                <Input id="settings-new-pw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-confirm-pw">Confirm new password</Label>
                <Input
                  id="settings-confirm-pw"
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-ui text-sm font-bold text-foreground">
                  Email me when my articles are published
                </p>
                <p className="text-xs text-muted-foreground">
                  Sent once a scheduled or draft story goes live.
                </p>
              </div>
              <Switch checked={notify} onCheckedChange={setNotify} />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
