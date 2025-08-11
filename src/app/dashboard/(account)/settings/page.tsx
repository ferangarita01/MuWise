
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Account & Security</CardTitle>
                    <CardDescription>
                        Manage your password, email, and security settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-8 text-center text-muted-foreground">
                        Account security form will be built here.
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                        Choose how you want to be notified.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-8 text-center text-muted-foreground">
                        Notification settings form will be built here.
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                        Control your privacy and data sharing settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="p-8 text-center text-muted-foreground">
                        Privacy settings form will be built here.
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Application Preferences</CardTitle>
                    <CardDescription>
                        Customize the application to your liking.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="p-8 text-center text-muted-foreground">
                        Application preferences form will be built here.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
