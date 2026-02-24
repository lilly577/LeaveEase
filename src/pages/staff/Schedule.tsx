import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Sun, Briefcase } from "lucide-react";
import { getMySchedule } from "@/services/schedule.service";

type OffDay = {
  id: string;
  date: string;
  type: "scheduled" | "approved_leave";
  note?: string;
};

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [offDays, setOffDays] = useState<OffDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffDays = async () => {
      try {
        const res = await getMySchedule();
        const data: OffDay[] = (res.data ?? []).map((item: any) => ({
          id: item?._id ?? "",
          date: item?.offDate,
          type: item?.type ?? "scheduled",
          note: item?.note,
        }));
        setOffDays(data);
      } catch (error) {
        console.error("Failed to fetch off-days", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffDays();
  }, []);

  const offDayDates = offDays.map((d) => parseISO(d.date));

  const selectedDayInfo = selectedDate
    ? offDays.find((d) => isSameDay(parseISO(d.date), selectedDate))
    : null;

  const upcomingOffDays = offDays
    .filter((d) => parseISO(d.date) >= new Date())
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  return (
    <AppLayout title="Off-Day Schedule">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Schedule Calendar
            </CardTitle>
            <CardDescription>
              View your scheduled off-days. Days highlighted in teal are your off-days.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading calendar...</p>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full pointer-events-auto"
                modifiers={{ offDay: offDayDates }}
                modifiersStyles={{
                  offDay: {
                    backgroundColor: "hsl(var(--primary) / 0.2)",
                    color: "hsl(var(--primary))",
                    fontWeight: "bold",
                  },
                }}
              />
            )}

            {selectedDate && (
              <div className="mt-6 p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h4>
                {selectedDayInfo ? (
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-primary" />
                    <span className="text-primary font-medium">Off Day</span>
                    {selectedDayInfo.note && <Badge variant="outline">{selectedDayInfo.note}</Badge>}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>Working day</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Off-Days</CardTitle>
            <CardDescription>Your scheduled days off</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading upcoming off-days...</p>
            ) : upcomingOffDays.length > 0 ? (
              <div className="space-y-3">
                {upcomingOffDays.map((offDay) => (
                  <div
                    key={offDay.id}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDate(parseISO(offDay.date))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{format(parseISO(offDay.date), "EEE, MMM d")}</p>
                        <p className="text-sm text-muted-foreground">{format(parseISO(offDay.date), "yyyy")}</p>
                      </div>

                      <Badge variant={offDay.type === "scheduled" ? "default" : "secondary"} className="capitalize">
                        {offDay.type === "scheduled" ? "Scheduled" : "Approved Leave"}
                      </Badge>
                    </div>

                    {offDay.note && <p className="text-sm text-muted-foreground mt-2">{offDay.note}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No upcoming off-days scheduled</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
