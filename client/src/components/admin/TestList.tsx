import { useEffect, useState } from "react";
import { testService, Test } from "@/services/tests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileText, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TestList = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const tests = await testService.getAllTests();
      setTests(tests);
    } catch (error: any) {
      toast.error("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId: string) => {
    try {
      await testService.deleteTest(testId);

      toast.success("Test deleted successfully");
      setTests(tests.filter((t) => t._id !== testId));
      setDeleteId(null);
    } catch (error: any) {
      toast.error("Failed to delete test");
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
          <p className="text-muted-foreground">No tests uploaded yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Click "Upload New Test" to create your first test
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => (
          <Card key={test._id} className="shadow-card hover:shadow-elevated transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{test.title}</span>
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(test.createdAt), "MMM dd, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Questions: <span className="font-medium text-foreground">{test.numQuestions}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(test.pdfUrl, "_blank")}
                >
                  View PDF
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(test._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the test and all associated student results. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TestList;
