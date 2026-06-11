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

export default function Index() {
  const [section, setSection] = useState<Section>("dashboard");
  const [role, setRole] = useState<UserRole>("cadet");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleRoleChange = (r: UserRole) => {
    setRole(r);
    setSection(r === "instructor" ? "instructor" : "dashboard");
  };

  const renderSection = () => {
    switch (section) {
      case "dashboard": return <Dashboard />;
      case "materials": return <Materials />;
      case "lectures": return <Lectures />;
      case "practices": return <Practices />;
      case "exams": return <Exams />;
      case "reports": return <Reports />;
      case "grades": return <Grades />;
      case "profile": return <Profile />;
      case "instructor": return <InstructorPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        role={role}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onRoleChange={handleRoleChange}
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
