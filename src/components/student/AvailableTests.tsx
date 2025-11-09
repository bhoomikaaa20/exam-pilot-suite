import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Play, CheckCircle } from "lucide-react";

const AvailableTests = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [completedTests, setCompletedTests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Load all tests
      const { data: testsData, error: testsError } = await supabase
        .from("tests")
        .select("*")
        .order("created_at", { ascending: false });

      if (testsError) throw testsError;

      // Load completed tests
      const { data: resultsData, error: resultsError } = await supabase
        .from("test_results")
        .select("test_id")
        .eq("student_id", user!.id);

      if (resultsError) throw resultsError;

      setTests(testsData || []);
      setCompletedTests(new Set(resultsData?.map((r) => r.test_id) || []));
    } catch (error: any) {
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tests...</div>;
  }

  if (tests.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No tests available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tests.map((test) => {
        const isCompleted = completedTests.has(test.id);
        return (
          <Card key={test.id} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-start gap-2 flex-1">
                  <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{test.title}</span>
                </CardTitle>
                {isCompleted && (
                  <Badge variant="secondary" className="ml-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Done
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Questions: <span className="font-medium text-foreground">{test.num_questions}</span>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate(`/test/${test.id}`)}
                disabled={isCompleted}
              >
                <Play className="h-4 w-4 mr-2" />
                {isCompleted ? "Already Taken" : "Start Test"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AvailableTests;
