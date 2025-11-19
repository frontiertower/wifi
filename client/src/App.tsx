import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import Events from "@/pages/events";
import PastEvents from "@/pages/past-events";
import Booking from "@/pages/booking";
import TourBooking from "@/pages/tour-booking";
import RentOffice from "@/pages/rent-office";
import EventHostBooking from "@/pages/event-host-booking";
import ApplyToJoin from "@/pages/apply-to-join";
import Chat from "@/pages/chat";
import Directory from "@/pages/directory";
import AddListing from "@/pages/addlisting";
import DirectoryAdmin from "@/pages/directory-admin";
import DirectoryEdit from "@/pages/directory-edit";
import AdminDashboard from "@/pages/admin-dashboard";
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
        <Route path="/events" component={Events} />
        <Route path="/past-events" component={PastEvents} />
        <Route path="/booking" component={Booking} />
        <Route path="/tour-booking" component={TourBooking} />
        <Route path="/rent-office" component={RentOffice} />
        <Route path="/event-host-booking" component={EventHostBooking} />
        <Route path="/apply-to-join" component={ApplyToJoin} />
        <Route path="/chat" component={Chat} />
        <Route path="/directory" component={Directory} />
        <Route path="/directory/admin" component={DirectoryAdmin} />
        <Route path="/directory/edit/:slug" component={DirectoryEdit} />
        <Route path="/addlisting" component={AddListing} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
