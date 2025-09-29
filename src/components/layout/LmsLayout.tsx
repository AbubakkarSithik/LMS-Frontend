import React ,{useEffect , useState}  from 'react'
import { useNavigate } from "react-router-dom";
import { useDispatch , useSelector} from "react-redux";
import { setSession, clearSession  , setIsAdmin} from "@/lib/store/slices/authSlice";
import { setAppUser } from "@/lib/store/slices/authSlice";
import { RiDashboardLine, RiLoader2Line, RiLogoutBoxLine, RiSettings3Line, RiTeamLine, RiUser3Line } from '@remixicon/react';
import { motion } from "framer-motion";
import { setOrganizationField } from '@/lib/store/slices/organizationSlice';
import type { RootState } from '@/lib/store/store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}
const LmsLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.auth.session);
  const appUser = useSelector((state: RootState) => state.auth.appUser);
  const isAdmin = useSelector((state: RootState) => state.auth.isAdmin);
  const org_name = useSelector((state: RootState) => state.organization.org_name);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  useEffect(() => {
    const restoreSessionAndCheckOnboard = async () => {
      try {
        const res = await fetch("http://localhost:4005/auth/restore", {
          credentials: "include",
        });
  
        if (res.ok) {
          const { session } = await res.json();
          dispatch(setSession(session));
          const onboardRes = await fetch("http://localhost:4005/users/me", {
            credentials: "include",
          });
  
          if (onboardRes.ok) {
            const appUser = await onboardRes.json();
            dispatch(setAppUser(appUser));
            if (appUser.organization_id && appUser.role_id !== 1001) {
                dispatch(setIsAdmin(false));
            }else{
                dispatch(setIsAdmin(true));
              }
          }
          const organizationRes = await fetch(`http://localhost:4005/organization/org`,{
              credentials: "include",
              method: "GET",
            });
          if (organizationRes.ok) {
              const org = await organizationRes.json();
              dispatch(setOrganizationField({ field: "organization_id", value: org.organization_id }));
              dispatch(setOrganizationField({ field: "org_name", value: org.name }));
              dispatch(setOrganizationField({ field: "subdomain", value: org.subdomain }));
          }
        } else {
          dispatch(clearSession());
          navigate("/");
        }
      } catch (err) {
        console.error("Session restore error:", err);
        dispatch(clearSession());
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
  
    restoreSessionAndCheckOnboard();
  }, [dispatch, navigate]);

const handleLogout = async () => {
    setLoggingOut(true);
      try {
        const res = await fetch("http://localhost:4005/auth/logout", {
          credentials: "include",
          method: "POST",
        });
  
        if (res.ok) {
          dispatch(clearSession());
          navigate("/");
        } else {
          const err = await res.json();
          alert(err.error || "Logout failed");
        }
       setLoggingOut(false);
      } catch (err) {
        console.error("Logout error:", err);
        setLoggingOut(false);
      }
  };

if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500 text-lg flex gap-2 items-center">
          Loading{" "}
          <RiLoader2Line
            className="animate-spin text-ts12 text-lg"
            size={20}
          />
        </p>
      </div>
    );
  }

if(!session) return null;

return (
    <div className="flex h-screen bg-gray-50 font-manrope text-gray-800 w-screen">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-[200px] w-full text-white flex flex-col bg-gradient-to-br from-ts12 via-orange-400 to-orange-700 p-3 shadow-lg overflow-hidden"
      >
        <div className="mb-6 px-2">
          <div className="font-bold text-lg truncate text-orange-200">
            {org_name ? (org_name.split(" ").map((word, index) => (
              <>
              <span key={index} className="inline-block">
                {word}
              </span><br></br>
              </>
            ))): "Org"}
          </div>
        </div>

        <nav className="flex flex-col gap-3 text-sm">
          <NavItem
            icon={<RiDashboardLine size={20} />}
            label="Dashboard"
            onClick={() => navigate("/dashboard")}
          />
          <NavItem
            icon={<RiTeamLine size={20} />}
            label="Leave"
            onClick={() => navigate("/leave")}
          />
          {isAdmin && (
            <NavItem
              icon={<RiSettings3Line size={20} />}
              label="Settings"
              onClick={() => navigate("/settings")}
            />
          )}
        </nav>
      </motion.aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <header className="h-14  border-b border-gray-200 flex justify-between items-center px-4 bg-white shadow-xs">
          <h1 className="text-lg font-semibold text-black flex items-baseline gap-1 justify-center">Welcome{" "}<span className='text-ts12 text-2xl'>{(appUser?.first_name || "User") + "💚"}</span></h1>

          <div className="relative">
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100 text-ts12 hover:bg-orange-200 transition cursor-pointer"
              onClick={() => setProfileOpen((p) => !p)}
            >
              <RiUser3Line size={20} />
            </button>

            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50"
              >
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 cursor-pointer"
                >
                  {loggingOut ? (
                    <RiLoader2Line className="animate-spin text-black text-lg" size={20} />
                  ) : ((<>
                      <RiLogoutBoxLine size={20} /> <span>Logout</span>
                    </>))}
                </button>
              </motion.div>
            )}
          </div>
        </header>
        {/* Main body */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
    whileTap={{ scale: 0.95 }}
    className="flex items-center gap-3 px-2 py-2 rounded-lg text-white hover:text-orange-200 cursor-pointer"
    onClick={onClick}
  >
    {icon}
    <span className="truncate">{label}</span>
  </motion.button>
);


export default LmsLayout;