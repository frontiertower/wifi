import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

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

          <hr className="border-gray-200 dark:border-gray-700 my-8" />

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            EVENT ORGANIZER GUIDE
          </h2>

          <ol className="space-y-4 mb-10">
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">1.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Host Affiliation</span>
                <span className="text-gray-700 dark:text-gray-300"> - Every event must have a Tower Citizen as a co-host. You must be directly connected to the event—their startup, art project, charity, etc. You cannot host on behalf of outside groups.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">2.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Big Event SOP</span>
                <span className="text-gray-700 dark:text-gray-300"> - For events with &gt;50 people registered, follow both this guide and our Big Event SOP (see below).</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">3.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Calendar & App</span>
                <span className="text-gray-700 dark:text-gray-300"> - All events must be created through the FrontierTower app and listed on the official lu.ma calendar. If it's not in the calendar, it cannot take place.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">4.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Host Presence & Responsibility</span>
                <span className="text-gray-700 dark:text-gray-300"> - As the host, you are fully responsible for the event. You must attend, be present at the start, and remain until the event is finished.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">5.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Marketing & Visibility</span>
                <span className="text-gray-700 dark:text-gray-300"> - In all promotion—flyers, emails, and every social media post—FrontierTower must be listed as a <strong>co-host</strong>. Always tag FrontierTower in posts.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">6.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Cleanup Policy</span>
                <span className="text-gray-700 dark:text-gray-300"> - You must clean up <strong>immediately after your event</strong>—not the next day, not later in the week. If your event ends very late and the space is not booked the following morning, you may request an exception at <a href="mailto:support@frontiertower.io" className="text-blue-600 dark:text-blue-400 hover:underline">support@frontiertower.io</a>. $500 cleaning fee otherwise.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">7.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Tower Share of Earnings</span>
                <span className="text-gray-700 dark:text-gray-300"> - 20% of all revenue (tickets, sponsorships, etc.) goes to the Tower. For lu.ma-hosted events, this share is automatically collected, and you receive your distribution (minus 20%) weekly. Large sums can be paid out earlier upon request. For other income, you are responsible for paying the Tower directly.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">8.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Community Floor Liaison</span>
                <span className="text-gray-700 dark:text-gray-300"> - If you host an event on the floor of your community—or in a floor where you hold an affiliation—you must <strong>liaise with the floor leads upfront</strong>. If there is a conflict with an existing event and the floor leads veto, your event may be cancelled.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">9.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Food & Drink Sales</span>
                <span className="text-gray-700 dark:text-gray-300"> - Selling food or drink is prohibited unless you have a licensed vendor. Free food and drink at your event is allowed.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">10.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Illegal Drugs</span>
                <span className="text-gray-700 dark:text-gray-300"> - Illegal drugs are strictly prohibited anywhere in the tower at any time.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">11.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Minors</span>
                <span className="text-gray-700 dark:text-gray-300"> - Minors are not allowed at events past 10pm.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">12.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Fog Machines</span>
                <span className="text-gray-700 dark:text-gray-300"> - Fog machines are not allowed. $1000 fine if the smoke alarm is set off.</span>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 flex-shrink-0">13.</span>
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100">Prohibited Events</span>
                <span className="text-gray-700 dark:text-gray-300"> - Events that are political PR, harmful, illegal, discriminatory, or otherwise damaging to the Tower's reputation are strictly disallowed. FrontierTower reserves the right to cancel any event that violates this principle.</span>
              </div>
            </li>
          </ol>

          <hr className="border-gray-200 dark:border-gray-700 my-8" />

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            BIG EVENT (&gt;50 PEOPLE) ORGANIZER GUIDE
          </h2>

          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            All organizers must agree with both the Event Organizer Guide above and this section. Only "Founding Citizens" with annual memberships can book our main venue - "The Spaceship" on the 2nd floor. They may book the venue 3 days per month for free.
          </p>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Set Up</h3>
          <ul className="space-y-2 mb-6 list-disc list-inside text-gray-700 dark:text-gray-300">
            <li>A $500 deposit is required in case of a failure to clean the space or have a check in person at the lobby</li>
            <li>AV requests must be submitted 24+ hours in advance via Arts & Music Telegram</li>
            <li>Do not move/borrow AV gear without permission — fines $100–$1,000</li>
            <li>Chairs in usable order (You do not need to fold them up on the 2nd floor)</li>
            <li>Trash bins & bathroom check</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Check-in & Security</h3>
          <ul className="space-y-2 mb-6 list-disc list-inside text-gray-700 dark:text-gray-300">
            <li>A check-in person in the lobby is mandatory from 20 minutes before until 20 minutes after the event. (Exception: If your event is for members only you do not need a check in person.) The Frontier Tower representative at the front desk is <strong>not</strong> your check in person. Without a check-in person, your guests will not be admitted.</li>
            <li>After the event you have to make sure your attendees leave the tower.</li>
            <li>Attendees must remain on permitted floors with their host.</li>
            <li>Basement events after dark require that you provide a guard. Email <a href="mailto:support@frontiertower.io" className="text-blue-600 dark:text-blue-400 hover:underline">support@frontiertower.io</a> if you'd like to hire security from our contacts.</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Post-Event Cleanup</h3>
          <ul className="space-y-2 mb-6 list-disc list-inside text-gray-700 dark:text-gray-300">
            <li>Take trash to first-floor trash room</li>
            <li>Break down boxes</li>
            <li>Tidy chairs</li>
            <li>Clean bathrooms and surfaces</li>
          </ul>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Food and Beverage Policy</h3>
          <ul className="space-y-2 mb-6 list-disc list-inside text-gray-700 dark:text-gray-300">
            <li>No alcohol will be served to anyone under 21</li>
            <li>Alcohol sales require a licensed vendor</li>
            <li>Discard perishables after 2 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
