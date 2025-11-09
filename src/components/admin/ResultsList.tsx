import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ResultsList = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from("test_results")
        .select(`
          *,
          tests (title),
          profiles (full_name, email)
        `)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      setResults(data || []);
    } catch (error: any) {
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (percentage >= 60) return <Badge className="bg-blue-500">Good</Badge>;
    if (percentage >= 40) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  if (results.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No test submissions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Test</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead className="text-center">Percentage</TableHead>
              <TableHead className="text-center">Grade</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{result.profiles?.full_name || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground">{result.profiles?.email}</div>
                  </div>
                </TableCell>
                <TableCell>{result.tests?.title}</TableCell>
                <TableCell className="text-center">
                  {result.score}/{result.total_questions}
                </TableCell>
                <TableCell className="text-center font-semibold">
                  {result.percentage.toFixed(1)}%
                </TableCell>
                <TableCell className="text-center">
                  {getScoreBadge(result.percentage)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(result.submitted_at), "MMM dd, yyyy HH:mm")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ResultsList;
