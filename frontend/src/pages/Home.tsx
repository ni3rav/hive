import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Home() {
  return (
    <div className="h-screen w-screen grid place-items-center">
      <Button onClick={() => toast.success("meow")}>Heyaa</Button>
    </div>
  );
}
