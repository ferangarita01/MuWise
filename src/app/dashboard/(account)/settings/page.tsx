
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                    Manage your account and application settings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-8 text-center text-muted-foreground">
                    Settings form will be built here.
                </div>
            </CardContent>
        </Card>
    );
}
