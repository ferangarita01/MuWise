
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                    This is where you can edit your musical and professional profile.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-8 text-center text-muted-foreground">
                    Profile form will be built here.
                </div>
            </CardContent>
        </Card>
    );
}
