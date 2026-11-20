"use client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../atoms/card";
import { Button } from "../atoms/button";
import { Separator } from "../atoms/separator";
import { Badge } from "../atoms/badge";
import { Home, ArrowLeft, HelpCircle } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mb-4">
            <h1 className="text-8xl font-bold text-primary mb-2">404</h1>
            <Badge variant="secondary" className="text-sm">
              Page Not Found
            </Badge>
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground mb-4">
            Oops! Page Not Found
          </CardTitle>
          <CardDescription className="text-muted-foreground leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist. It might have been moved,
            deleted, or you entered the wrong URL.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Need help? Contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
