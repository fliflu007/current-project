import EditCard from "@/components/edit-card";

import Navbar from "@/components/navbar";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isLoggedIn={true} />

      <main className="flex flex-1 my-10 justify-center S">
        <div className="w-136 overflow-visible">
          <EditCard />
        </div>
      </main>
    </div>
  );
}
