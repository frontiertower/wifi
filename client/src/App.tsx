import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { WhiteRabbitButton } from "@/components/white-rabbit-button";
import Home from "@/pages/home";
import HomeDE from "@/pages/home-de";
import HomeES from "@/pages/home-es";
import HomeZH from "@/pages/home-zh";
import HomeKO from "@/pages/home-ko";
import HomeJA from "@/pages/home-ja";
import HomeFR from "@/pages/home-fr";
import HomeHI from "@/pages/home-hi";
import HomeAR from "@/pages/home-ar";
import HomeSW from "@/pages/home-sw";
import GreenHome from "@/pages/green-home";
import BlueHome from "@/pages/blue-home";
import Events from "@/pages/events";
import PastEvents from "@/pages/past-events";
import Booking from "@/pages/booking";
import TourBooking from "@/pages/tour";
import RentOffice from "@/pages/rent-office";
import EventHostBooking from "@/pages/event-host-booking";
import ApplyToJoin from "@/pages/apply-to-join";
import Chat from "@/pages/chat";
import Directory from "@/pages/directory";
import AddListing from "@/pages/addlisting";
import DirectoryAdmin from "@/pages/directory-admin";
import DirectoryEdit from "@/pages/directory-edit";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminLogin from "@/pages/admin-login";
import HiringPage from "@/pages/hiring";
import FinancePage from "@/pages/finance";
import PillsPage from "@/pages/pills";
import CareersPage from "@/pages/careers";
import ProductManagerPage from "@/pages/careers-product-manager";
import CommunityEventsPage from "@/pages/careers-community-events";
import EcosystemPage from "@/pages/ecosystem";
import ResidencyPage from "@/pages/residency";
import CodeOfConduct from "@/pages/code-of-conduct";
import WorkshopVideos from "@/pages/workshop-videos";
import AboutPage from "@/pages/about";
import CoworkingPage from "@/pages/coworking";
import EventOrganizerGuide from "@/pages/event-organizer-guide";
import FloorMaps from "@/pages/floor-maps";
import Gallery from "@/pages/gallery";
import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/de" component={HomeDE} />
        <Route path="/es" component={HomeES} />
        <Route path="/zh" component={HomeZH} />
        <Route path="/ko" component={HomeKO} />
        <Route path="/ja" component={HomeJA} />
        <Route path="/fr" component={HomeFR} />
        <Route path="/hi" component={HomeHI} />
        <Route path="/ar" component={HomeAR} />
        <Route path="/sw" component={HomeSW} />
        <Route path="/Green" component={GreenHome} />
        <Route path="/Blue" component={BlueHome} />
        <Route path="/events" component={Events} />
        <Route path="/past-events" component={PastEvents} />
        <Route path="/booking" component={Booking} />
        <Route path="/tour" component={TourBooking} />
        <Route path="/rent-office" component={RentOffice} />
        <Route path="/hosting" component={EventHostBooking} />
        <Route path="/membership" component={ApplyToJoin} />
        <Route path="/apply-to-join" component={ApplyToJoin} />
        <Route path="/chat" component={Chat} />
        <Route path="/Regen" component={HiringPage} />
        <Route path="/Finance" component={FinancePage} />
        <Route path="/rabbit" component={PillsPage} />
        <Route path="/careers" component={CareersPage} />
        <Route path="/careers/product-manager" component={ProductManagerPage} />
        <Route path="/careers/community-events" component={CommunityEventsPage} />
        <Route path="/ecosystem" component={EcosystemPage} />
        <Route path="/residency" component={ResidencyPage} />
        <Route path="/code-of-conduct" component={CodeOfConduct} />
        <Route path="/workshop-videos" component={WorkshopVideos} />
        <Route path="/about" component={AboutPage} />
        <Route path="/coworking" component={CoworkingPage} />
        <Route path="/event-organizer-guide" component={EventOrganizerGuide} />
        <Route path="/floor-maps" component={FloorMaps} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/directory" component={Directory} />
        <Route path="/directory/admin" component={DirectoryAdmin} />
        <Route path="/directory/edit/:slug" component={DirectoryEdit} />
        <Route path="/addlisting" component={AddListing} />
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/settings">
          {() => {
            window.location.href = "/admin#settings";
            return null;
          }}
        </Route>
        <Route path="/admin/users">
          {() => {
            window.location.href = "/admin#users";
            return null;
          }}
        </Route>
        <Route path="/admin/guests">
          {() => {
            window.location.href = "/admin#vouchers";
            return null;
          }}
        </Route>
        <Route path="/admin/events">
          {() => {
            window.location.href = "/admin#events";
            return null;
          }}
        </Route>
        <Route path="/admin/analytics">
          {() => {
            window.location.href = "/admin#analytics";
            return null;
          }}
        </Route>
        <Route path="/admin/location">
          {() => {
            window.location.href = "/admin#location";
            return null;
          }}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function AppHeader() {
  const [location] = useLocation();

  const handleRabbitClick = () => {
    if (location === "/" && (window as any).__whiteRabbitCallback) {
      (window as any).__whiteRabbitCallback();
    }
  };

  const hideRabbitOn = ["/", "/de", "/es", "/zh", "/ko", "/ja", "/fr", "/hi", "/ar", "/sw", "/Regen", "/Finance", "/Green", "/Blue", "/admin", "/admin-login", "/events", "/past-events", "/booking", "/tour", "/rent-office", "/hosting", "/membership", "/apply-to-join", "/chat", "/directory", "/addlisting", "/careers", "/ecosystem", "/residency", "/code-of-conduct", "/about", "/floor-maps"];
  const shouldHideRabbit = hideRabbitOn.some(path => location === path || location.startsWith(path + "/"));

  return (
    <>
      {!shouldHideRabbit && (
        <div className="absolute top-6 left-6 z-[60]">
          <WhiteRabbitButton onHomeClick={handleRabbitClick} />
        </div>
      )}
      {!shouldHideRabbit && (
        <div className="absolute top-7 right-6 z-50">
          <ThemeToggle />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="relative">
            <AppHeader />
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
