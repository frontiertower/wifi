import { Link } from "wouter";
import { ArrowLeft, Play, Video, ExternalLink } from "lucide-react";
import { SiYoutube } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const videos = [
  {
    title: "Vibe Coding XR",
    description: "Learn to build XR experiences with AI-assisted development",
    url: "https://streamyard.com/watch/vH8pNPYvEGQa",
    icon: Video,
    color: "purple",
  },
  {
    title: "XR AI Crash Course",
    description: "Quick introduction to XR and AI integration",
    url: "https://streamyard.com/5x4hqnvzyn6p",
    icon: Play,
    color: "blue",
  },
  {
    title: "SensAI Workshop Playlist",
    description: "Full collection of SensAI hackathon workshop recordings",
    url: "https://www.youtube.com/playlist?list=PLRQI9ZSqDkKckICPBwv19jPT9hLKxvNlL",
    icon: SiYoutube,
    color: "red",
  },
];

export default function WorkshopVideos() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Workshop Videos</h1>
          <p className="text-muted-foreground">
            Watch recordings from SensAI hackathon workshops and tutorials
          </p>
        </div>

        <div className="space-y-4">
          {videos.map((video, index) => {
            const IconComponent = video.icon;
            const colorClasses = {
              purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400",
              blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
              red: "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400",
            };
            
            return (
              <a
                key={index}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                data-testid={`link-video-${index}`}
              >
                <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[video.color as keyof typeof colorClasses]}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {video.title}
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </h3>
                        <p className="text-sm text-muted-foreground">{video.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            More workshop recordings will be added throughout the hackathon.
          </p>
        </div>
      </div>
    </div>
  );
}
