import { useState } from "react";
import { Section, UserRole } from "@/components/academy/types";
import { AppHeader, AppSidebar } from "@/components/academy/Layout";
import {
  Dashboard,
  Materials,
  Lectures,
  Practices,
  Exams,
  Reports,
  Grades,
  Profile,
  InstructorPanel,
} from "@/components/academy/Sections";
import { User } from "@/lib/api";

interface IndexProps {
  authUser: User;
  onLogout: () => void;
}

export default function Index({ authUser, onLogout }: IndexProps) {
  const [section, setSection] = useState<Section>(
    authUser.role === "instructor" ? "instructor" : "dashboard"
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = authUser.role as UserRole;

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <Dashboard authUser={authUser} />;
      case "materials": return <Materials />;
      case "lectures": return <Lectures />;
      case "practices": return <Practices />;
      case "exams": return <Exams />;
      case "reports": return <Reports />;
      case "grades": return <Grades authUser={authUser} />;
      case "profile": return <Profile authUser={authUser} />;
      case "instructor": return <InstructorPanel authUser={authUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        role={role}
        authUser={authUser}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={onLogout}
      />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          section={section}
          role={role}
          sidebarOpen={sidebarOpen}
          onNavigate={setSection}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}