import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  getPolicies,
  updatePolicies,
  getEmergencyControls,
  updateEmergencyControls,
} from "@/services/super-admin.service";

export default function SuperAdminSystemControl() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingPolicies, setSavingPolicies] = useState(false);
  const [savingEmergency, setSavingEmergency] = useState(false);

  const [leaveSlaHours, setLeaveSlaHours] = useState(24);
  const [maxAttachments, setMaxAttachments] = useState(3);
  const [maxAttachmentSizeMb, setMaxAttachmentSizeMb] = useState(5);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [submissionsEnabled, setSubmissionsEnabled] = useState(true);

  const load = async () => {
    try {
      const [policiesRes, emergencyRes] = await Promise.all([getPolicies(), getEmergencyControls()]);
      const policies = policiesRes.data || {};
      const emergency = emergencyRes.data || {};
      setLeaveSlaHours(Number(policies.leaveSlaHours || 24));
      setMaxAttachments(Number(policies.maxAttachments || 3));
      setMaxAttachmentSizeMb(Number(policies.maxAttachmentSizeMb || 5));
      setMaintenanceMode(!!emergency.maintenanceMode);
      setSubmissionsEnabled(!!emergency.submissionsEnabled);
    } catch (error) {
      console.error("Failed to load system settings", error);
      toast({ title: "Load failed", description: "Could not load system settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const savePolicies = async () => {
    setSavingPolicies(true);
    try {
      await updatePolicies({ leaveSlaHours, maxAttachments, maxAttachmentSizeMb });
      toast({ title: "Policies updated", description: "System policies have been saved." });
    } catch (error) {
      console.error("Failed to save policies", error);
      toast({ title: "Save failed", description: "Could not update policies", variant: "destructive" });
    } finally {
      setSavingPolicies(false);
    }
  };

  const saveEmergency = async () => {
    setSavingEmergency(true);
    try {
      await updateEmergencyControls({ maintenanceMode, submissionsEnabled });
      toast({ title: "Emergency controls updated", description: "Emergency settings are now active." });
    } catch (error) {
      console.error("Failed to save emergency controls", error);
      toast({ title: "Save failed", description: "Could not update emergency controls", variant: "destructive" });
    } finally {
      setSavingEmergency(false);
    }
  };

  return (
    <AppLayout title="System Control" requireRoles={["super_admin"]}>
      {loading ? (
        <p className="text-center text-muted-foreground py-10">Loading system control...</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Control</CardTitle>
              <CardDescription>Configure leave and submission policy values.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Leave SLA (hours)</Label>
                <Input type="number" value={leaveSlaHours} onChange={(e) => setLeaveSlaHours(Number(e.target.value || 24))} />
              </div>
              <div className="space-y-2">
                <Label>Max Attachments</Label>
                <Input type="number" value={maxAttachments} onChange={(e) => setMaxAttachments(Number(e.target.value || 3))} />
              </div>
              <div className="space-y-2">
                <Label>Max Attachment Size (MB)</Label>
                <Input type="number" value={maxAttachmentSizeMb} onChange={(e) => setMaxAttachmentSizeMb(Number(e.target.value || 5))} />
              </div>
              <div className="md:col-span-3">
                <Button onClick={savePolicies} disabled={savingPolicies}>{savingPolicies ? "Saving..." : "Save Policies"}</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Controls</CardTitle>
              <CardDescription>Use with care. These settings affect all users immediately.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">Blocks system access for non-super-admin users.</p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="font-medium">Allow Submissions</p>
                  <p className="text-sm text-muted-foreground">When off, leave requests and feedback submissions are blocked.</p>
                </div>
                <Switch checked={submissionsEnabled} onCheckedChange={setSubmissionsEnabled} />
              </div>
              <Button onClick={saveEmergency} disabled={savingEmergency}>{savingEmergency ? "Applying..." : "Apply Emergency Controls"}</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}

