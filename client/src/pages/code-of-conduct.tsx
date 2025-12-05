import { Link } from "wouter";
import { ArrowLeft, Shield, Heart, Briefcase, MessageSquare, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";

export default function CodeOfConduct() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-3xl mx-auto">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="mb-6"
            data-testid="button-back-home"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100" data-testid="heading-code-of-conduct">
              Code of Conduct
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6" data-testid="heading-hackathon-code">
              HACKATHON CODE OF CONDUCT
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 border-slate-600">
                <CardContent className="pt-6 text-center">
                  <Heart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-100 mb-2">Respect Others</h3>
                  <p className="text-slate-300 text-sm">
                    Treat all participants with kindness, respect, and consideration.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 border-slate-600">
                <CardContent className="pt-6 text-center">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-100 mb-2">Act Professionally</h3>
                  <p className="text-slate-300 text-sm">
                    Avoid harassment, sexism, racism, or inappropriate behavior.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 border-slate-600">
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-100 mb-2">Communicate Constructively</h3>
                  <p className="text-slate-300 text-sm">
                    Critique ideas, not individuals, avoid demeaning or harassing behavior.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 border-slate-600">
                <CardContent className="pt-6 text-center">
                  <Eye className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-100 mb-2">Be Mindful of Your Surroundings</h3>
                  <p className="text-slate-300 text-sm">
                    Alert event organizers if you notice a dangerous situation or someone in distress.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 border-slate-600">
                <CardContent className="pt-6 text-center">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-100 mb-2">Participate Authentically</h3>
                  <p className="text-slate-300 text-sm">
                    Engage authentically and contribute positively to the community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <hr className="border-gray-200 dark:border-gray-700 my-8" />

          <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            The citizenship committee was elected to define our community standards and set membership guidelines. Any individual who violates community standards may receive a warning, temporary suspension, or ban from the building, depending on severity and frequency. The committee reserves the authority to remove individuals physical access to the property — as well as reinstate access. Anyone may request a review by the committee.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            COMMUNITY STANDARDS
          </h2>

          <ol className="space-y-4 mb-10">
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">1.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Respect shared spaces</span>
                <span className="text-gray-700 dark:text-gray-300"> - Clean up after yourself, follow building and floor-specific guidelines, keep noise levels considerate</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">2.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">No sleeping in the building</span>
                <span className="text-gray-700 dark:text-gray-300"> - No sleep overs or overnight stays in the building. We are applying for residential rezoning and a fine is $20,000</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">3.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Respectful conduct</span>
                <span className="text-gray-700 dark:text-gray-300"> - Maintain appropriate behavior for a collaborative environment: be respectful and inclusive of people of all backgrounds and identities</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">4.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Guest responsibility</span>
                <span className="text-gray-700 dark:text-gray-300"> - You're accountable for your guests' behavior and must accompany them at all times</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">5.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Communication</span>
                <span className="text-gray-700 dark:text-gray-300"> - Address conflicts directly and respectfully; escalate to a floor lead or event organizer as needed</span>
              </div>
            </li>
          </ol>

          <hr className="border-gray-200 dark:border-gray-700 my-8" />

          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            IMMEDIATE REMOVAL OFFENSES
          </h2>

          <p className="text-gray-600 dark:text-gray-400 italic mb-6">
            The following result in immediate membership revocation and building ban:
          </p>

          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="font-bold text-red-600 dark:text-red-400 flex-shrink-0">1.</span>
              <div>
                <span className="font-bold text-red-600 dark:text-red-400">Violence or threats</span>
                <span className="text-gray-700 dark:text-gray-300"> - Any violence, threats, or intimidation toward members, staff, or visitors</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-600 dark:text-red-400 flex-shrink-0">2.</span>
              <div>
                <span className="font-bold text-red-600 dark:text-red-400">Harassment</span>
                <span className="text-gray-700 dark:text-gray-300"> - Repeated unwelcome behavior that creates a hostile environment, including sexual harassment, non-consensual physical interactions, and other behaviors that violate the personal space of other citizens</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-600 dark:text-red-400 flex-shrink-0">3.</span>
              <div>
                <span className="font-bold text-red-600 dark:text-red-400">Theft or property damage</span>
                <span className="text-gray-700 dark:text-gray-300"> - Taking others' belongings or intentionally damaging building property</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-600 dark:text-red-400 flex-shrink-0">4.</span>
              <div>
                <span className="font-bold text-red-600 dark:text-red-400">Illegal activities</span>
                <span className="text-gray-700 dark:text-gray-300"> - Using the space for unlawful purposes or bringing illegal substances/weapons</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-red-600 dark:text-red-400 flex-shrink-0">5.</span>
              <div>
                <span className="font-bold text-red-600 dark:text-red-400">Compromising building security</span>
                <span className="text-gray-700 dark:text-gray-300"> - Sharing access in any form, propping doors, or allowing unauthorized entry, disabling security cameras</span>
              </div>
            </li>
          </ol>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link href="/">
              <Button className="w-full sm:w-auto" data-testid="button-agree-code-of-conduct">
                I Agree to the Code of Conduct
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
