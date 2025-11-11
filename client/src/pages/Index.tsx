import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, ClipboardCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">TestMaster</span>
          </div>
          <Button variant="secondary" onClick={() => navigate("/auth")}>
            Login / Sign Up
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Online Test Management System
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Create, manage, and take tests online with instant results and comprehensive tracking
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => navigate("/auth")}>
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Students</h3>
            <p className="text-white/80">
              Take tests online, get instant results, and track your performance
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">For Teachers</h3>
            <p className="text-white/80">
              Upload tests, manage answer keys, and monitor student results
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Auto Grading</h3>
            <p className="text-white/80">
              Automatic evaluation based on answer keys with detailed analytics
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
