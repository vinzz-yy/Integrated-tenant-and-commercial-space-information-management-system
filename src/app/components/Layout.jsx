import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function Layout({ children, role }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar role={role} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
