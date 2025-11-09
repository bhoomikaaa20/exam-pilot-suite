import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface TestUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TestUploadDialog = ({ open, onOpenChange }: TestUploadDialogProps) => {
  const [title, setTitle] = useState("");
  const [numQuestions, setNumQuestions] = useState<number>(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [uploading, setUploading] = useState(false);

  const handleNumQuestionsChange = (num: number) => {
    setNumQuestions(num);
    const newAnswers: Record<number, string> = {};
    for (let i = 1; i <= num; i++) {
      newAnswers[i] = answers[i] || "";
    }
    setAnswers(newAnswers);
  };

  const handleUpload = async () => {
    if (!title || !pdfFile || numQuestions <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate all answers are provided
    for (let i = 1; i <= numQuestions; i++) {
      if (!answers[i]?.trim()) {
        toast.error(`Please provide answer for question ${i}`);
        return;
      }
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Upload PDF to storage
      const fileExt = pdfFile.name.split('.').pop();
      const fileName = `${user!.id}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("test-pdfs")
        .upload(fileName, pdfFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("test-pdfs")
        .getPublicUrl(fileName);

      // Create test record
      const { data: testData, error: testError } = await supabase
        .from("tests")
        .insert({
          title,
          pdf_url: publicUrl,
          num_questions: numQuestions,
          created_by: user!.id,
        })
        .select()
        .single();

      if (testError) throw testError;

      // Insert questions and answers
      const questionsData = Object.entries(answers).map(([qNum, answer]) => ({
        test_id: testData.id,
        question_number: parseInt(qNum),
        correct_answer: answer.trim(),
      }));

      const { error: questionsError } = await supabase
        .from("test_questions")
        .insert(questionsData);

      if (questionsError) throw questionsError;

      toast.success("Test uploaded successfully!");
      onOpenChange(false);
      resetForm();
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload test");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setNumQuestions(0);
    setPdfFile(null);
    setAnswers({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Test</DialogTitle>
          <DialogDescription>
            Fill in the test details and upload the question paper PDF
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Test Title</Label>
            <Input
              id="title"
              placeholder="e.g., Mathematics Mid-term Exam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pdf">Question Paper (PDF)</Label>
            <Input
              id="pdf"
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numQuestions">Number of Questions</Label>
            <Input
              id="numQuestions"
              type="number"
              min="1"
              placeholder="Enter number of questions"
              value={numQuestions || ""}
              onChange={(e) => handleNumQuestionsChange(parseInt(e.target.value) || 0)}
            />
          </div>
          {numQuestions > 0 && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold">Answer Key</Label>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: numQuestions }, (_, i) => i + 1).map((qNum) => (
                  <div key={qNum} className="flex items-center gap-2">
                    <Label className="w-16 text-sm">Q{qNum}:</Label>
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
              </div>
            </div>
          )}
          <Button onClick={handleUpload} disabled={uploading} className="w-full mt-4">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Test"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestUploadDialog;
