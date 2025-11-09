import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Award } from "lucide-react";

interface TestResultProps {
  result: {
    score: number;
    total: number;
    percentage: number;
    wrong: number;
  };
  testTitle: string;
}

const TestResult = ({ result, testTitle }: TestResultProps) => {
  const navigate = useNavigate();

  const getGrade = (percentage: number) => {
    if (percentage >= 80) return { grade: "A", color: "text-green-500", message: "Excellent!" };
    if (percentage >= 60) return { grade: "B", color: "text-blue-500", message: "Good Job!" };
    if (percentage >= 40) return { grade: "C", color: "text-yellow-500", message: "Keep Practicing!" };
    return { grade: "D", color: "text-red-500", message: "Need Improvement" };
  };

  const gradeInfo = getGrade(result.percentage);

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-elevated">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Award className="h-16 w-16 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-2">Test Completed!</CardTitle>
          <p className="text-muted-foreground">{testTitle}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${gradeInfo.color}`}>
              {result.percentage.toFixed(1)}%
            </div>
            <div className="text-2xl font-semibold mb-1">{gradeInfo.message}</div>
            <div className="text-xl text-muted-foreground">Grade: {gradeInfo.grade}</div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-muted">
              <CardContent className="text-center py-6">
                <div className="text-2xl font-bold text-foreground">{result.total}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="text-center py-6">
                <div className="flex items-center justify-center mb-1">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">{result.score}</div>
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="text-center py-6">
                <div className="flex items-center justify-center mb-1">
                  <XCircle className="h-5 w-5 text-red-500 mr-1" />
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">{result.wrong}</div>
                </div>
                <div className="text-sm text-muted-foreground">Wrong</div>
              </CardContent>
            </Card>
          </div>

          <Button className="w-full" size="lg" onClick={() => navigate("/student")}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestResult;
