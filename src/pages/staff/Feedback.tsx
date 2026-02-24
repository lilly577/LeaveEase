import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Shield, Lock } from 'lucide-react';
import { sendFeedback } from '@/services/feedback.service';

export default function Feedback() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
    await sendFeedback({
      subject,
      message,
      isAnonymous,
    });
    
    toast({
      title: 'Feedback Submitted',
      description: 'Thank you for your feedback. HR will review it confidentially.',
    });
    
    // Reset form
    setSubject('');
    setMessage('');
    setIsAnonymous(false);
  } catch (error) {
    toast({
      title: 'Submission Failed',
      description: 'There was an error submitting your feedback. Please try again later.',
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
  }
  };

  return (
    <AppLayout title="Feedback">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Info Card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Confidential Feedback</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your feedback is confidential and will only be visible to HR personnel. 
                You can choose to submit anonymously if you prefer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Submit Feedback
            </CardTitle>
            <CardDescription>
              Share your thoughts, suggestions, or concerns with the HR department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief summary of your feedback"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide detailed feedback..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="anonymous"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="h-4 w-4" />
                    Submit Anonymously
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Your name will not be attached to this feedback if checked
                  </p>
                  <p className="text-xs text-warning">
                    Anonymous mode is permanent after submission.
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
