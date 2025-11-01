'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

const navigation = [
  { name: 'Countries', href: '/countries', icon: '🌍' },
  { name: 'Cities', href: '/cities', icon: '🏙️' },
  { name: 'Categories', href: '/categories', icon: '📂' },
  { name: 'POIs', href: '/pois', icon: '📍' },
  { name: 'AI Generate', href: '/ai-generate', icon: '🤖' },
  { name: 'Allowed Emails', href: '/admin/allowed-emails', icon: '✉️' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col w-64 bg-gray-800 h-screen">
      <div className="flex items-center justify-center h-16 bg-gray-900">
        <h1 className="text-white text-xl font-bold">Navigame Admin</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-3 px-2">
          <p className="text-sm text-gray-400">Signed in as</p>
          <p className="text-sm text-white truncate">{user?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
