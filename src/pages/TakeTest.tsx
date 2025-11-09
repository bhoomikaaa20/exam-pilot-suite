import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import TestResult from "@/components/student/TestResult";

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadTest();
  }, [testId]);

  const loadTest = async () => {
    try {
      const { data: testData, error } = await supabase
        .from("tests")
        .select("*")
        .eq("id", testId)
        .single();

      if (error) throw error;

      setTest(testData);
    } catch (error: any) {
      toast.error("Failed to load test");
      navigate("/student");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all answers are filled
    const totalQuestions = test.num_questions;
    const answeredQuestions = Object.keys(answers).length;

    if (answeredQuestions < totalQuestions) {
      toast.error(`Please answer all ${totalQuestions} questions`);
      return;
    }

    setSubmitting(true);

    try {
      // Fetch correct answers
      const { data: questions, error: questionsError } = await supabase
        .from("test_questions")
        .select("*")
        .eq("test_id", testId)
        .order("question_number");

      if (questionsError) throw questionsError;

      // Calculate score
      let correctCount = 0;
      questions.forEach((q) => {
        const studentAnswer = answers[q.question_number]?.trim().toLowerCase();
        const correctAnswer = q.correct_answer.trim().toLowerCase();
        if (studentAnswer === correctAnswer) {
          correctCount++;
        }
      });

      const percentage = (correctCount / totalQuestions) * 100;

      // Save result
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: resultError } = await supabase
        .from("test_results")
        .upsert({
          test_id: testId,
          student_id: user!.id,
          student_answers: answers,
          score: correctCount,
          total_questions: totalQuestions,
          percentage: percentage,
        });

      if (resultError) throw resultError;

      setResult({
        score: correctCount,
        total: totalQuestions,
        percentage: percentage,
        wrong: totalQuestions - correctCount,
      });

      toast.success("Test submitted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit test");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return <TestResult result={result} testTitle={test.title} />;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/student")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-elevated mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{test.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total Questions: {test.num_questions}
            </p>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Question Paper</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                src={test.pdf_url}
                className="w-full h-[600px] border rounded-md"
                title="Test PDF"
              />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Your Answers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: test.num_questions }, (_, i) => i + 1).map((qNum) => (
                <div key={qNum} className="flex items-center gap-3">
                  <Label className="w-24 text-sm font-medium">Q{qNum}:</Label>
                  <Input
                    placeholder="a, b, c, d..."
                    value={answers[qNum] || ""}
                    onChange={(e) =>
                      setAnswers({ ...answers, [qNum]: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
              ))}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Submitting..." : "Submit Test"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
