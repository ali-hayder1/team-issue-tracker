import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import EditProfileModal from "./EditProfileModal";

export default function Sidebar({ open, onClose, onNewProject }) {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const [showEditProfile, setShowEditProfile] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-5 flex items-center gap-2 border-b border-slate-800">
          <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center font-bold text-white text-sm">
            IT
          </div>
          <span className="text-white font-bold text-lg">IssueTracker</span>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              onNewProject();
              onClose();
            }}
            className="w-full text-center bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-2.5 rounded-lg font-medium text-sm"
          >
            + New Project
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <Link
            to="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              isDashboard
                ? "bg-orange-500/10 text-orange-400"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Dashboard
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setShowEditProfile(true)}
            className="w-full flex items-center gap-3 mb-3 hover:bg-slate-800 rounded-lg p-1.5 -m-1.5 transition text-left"
          >
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name}
              </p>
              <p className="text-slate-400 text-xs truncate">{user?.role}</p>
            </div>
          </button>
          <button
            onClick={logoutUser}
            className="w-full text-left text-slate-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            Log Out
          </button>
        </div>
      </aside>

      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
    </>
  );
}
