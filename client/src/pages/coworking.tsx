import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, MapPin, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiMeta } from "react-icons/si";

export default function Coworking() {
  const events = [
    {
      id: 1,
      title: "DevLabs Builder Coworking - T-Minus 2 Days",
      date: "Monday, Dec 8",
      time: "10 AM - 10 PM",
      description: "12 hours of focused coworking time to build your project",
      lumaUrl: "https://lu.ma/sensai-hacker-coworking-t-minus-2-days",
    },
    {
      id: 2,
      title: "DevLabs Builder Coworking - Submission Day",
      date: "Tuesday, Dec 9",
      time: "10 AM - 12 PM",
      description: "Final coworking session before submissions close",
      lumaUrl: "https://lu.ma/sensai-hacker-coworking-submission-day",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 dark:bg-cyan-500/30 rounded-full mb-4">
            <SiMeta className="w-8 h-8 text-cyan-600 dark:text-cyan-300" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Reserve Your Coworking Space
          </h1>
          <p className="text-xl text-muted-foreground">
            Meta Competition Coworking Sessions
          </p>
        </div>

        <Card className="mb-6 border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Have Questions?</p>
                <p className="text-muted-foreground">
                  Use the <span className="font-mono bg-cyan-100 dark:bg-cyan-800 px-1.5 py-0.5 rounded text-cyan-700 dark:text-cyan-300">meta-competition</span> channel in Devpost for questions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow" data-testid={`card-event-${event.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl mb-1">{event.title}</CardTitle>
                    <CardDescription>{event.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Frontier Tower</span>
                  </div>
                </div>
                <a
                  href={event.lumaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`button-register-event-${event.id}`}
                >
                  <Button className="w-full sm:w-auto">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Register on Luma
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Space is limited. Register early to secure your spot!
          </p>
          <Link href="/">
            <Button variant="outline" data-testid="button-return-home">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
