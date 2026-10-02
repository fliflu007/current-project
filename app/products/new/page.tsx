import CreateCard from "@/components/create-card";
import Navbar from "@/components/navbar";

export default function page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isLoggedIn={true} />

      <main className="flex flex-1 items-center justify-center overflow-y-auto">
        <div className="w-136 mb-40">
          <CreateCard></CreateCard>
        </div>
      </main>
    </div>
  );
}
