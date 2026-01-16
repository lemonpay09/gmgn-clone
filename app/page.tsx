
 import { Button } from "@/components/ui/button";

 export default function Home() {
   return (
     <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
       <h1 className="text-4xl font-bold mb-8">GMGN.AI Clone - Setup Complete</h1>
       <p className="mb-8 text-muted-foreground">UI Library Test:</p>
       <div className="flex gap-4">
         <Button>Default Button</Button>
         <Button variant="destructive">Destructive</Button>
         <Button variant="outline">Outline</Button>
       </div>
     </main>
   );
 }
