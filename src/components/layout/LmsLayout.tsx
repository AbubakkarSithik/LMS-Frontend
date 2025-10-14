import React ,{useEffect , useState}  from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch , useSelector} from "react-redux";
import { setSession, clearSession  , setIsAdmin  , setIsManager , setIsHR , setIsEmployee} from "@/lib/store/slices/authSlice";
import { setAppUser } from "@/lib/store/slices/authSlice";
import { RiBuildingLine, RiDashboardLine, RiLoader2Line, RiLogoutBoxLine, RiSuitcase3Line, RiTeamLine, RiUser3Line } from '@remixicon/react';
import { motion } from "framer-motion";
import { setOrganization , setRoles , setRelations } from '@/lib/store/slices/organizationSlice';
import type { RootState } from '@/lib/store/store';
import NavItem from '../ui/NavItem';
import { Toaster } from '../ui/sonner';
import { getBackendURL } from '@/lib/utils';

const LmsLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { session , appUser , isAdmin , isHR} = useSelector((state: RootState) => state.auth);
  const { organization  } = useSelector((state: RootState) => state.organization);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  const baseURL = getBackendURL();

  useEffect(() => {
    const restoreSessionAndCheckOnboard = async () => {
      try {
        const res = await fetch(`${baseURL}/auth/restore`, {
          credentials: "include",
        });
  
        if (res.ok) {
          const { session } = await res.json();
          dispatch(setSession(session));
          const onboardRes = await fetch(`${baseURL}/users/me`, {
            credentials: "include",
          });
  
          if (onboardRes.ok) {
            const appUser = await onboardRes.json();
            dispatch(setAppUser(appUser));
           if (appUser.organization_id) {
                switch (appUser.role_id) {
                  case 1001:
                    dispatch(setIsAdmin(true));
                    break;
                  case 1002:
                    dispatch(setIsHR(true));
                    break;
                  case 1003:
                    dispatch(setIsManager(true));
                    break;
                  case 1004:
                    dispatch(setIsEmployee(true));
                    break;
                  default:
                    break;
                }
              }
          }
          const organizationRes = await fetch(`${baseURL}/organization/org`, {
              credentials: "include",
              method: "GET",
            });
          if (organizationRes.ok) {
              const org = await organizationRes.json();
              dispatch(setOrganization(org));
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

    const fetchRoles = async () => {
        try {
          const res = await fetch(`${baseURL}/invite/roles`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            dispatch(setRoles(data));
          }
        } catch (err) {
          console.error("Failed to load roles", err);
        }
      };

  const fetchRelations = async () => {
  try {
    const res = await fetch(`${baseURL}/employee/relations/all`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Failed to fetch organization relations");
      return;
    }
    const data = await res.json();
    if (data?.relations) {
      dispatch(setRelations(data.relations));
    } else {
      dispatch(
        setRelations({
          "employee-manager": [],
          "manager-hr": [],
        })
      );
    }
  } catch (err: any) {
    console.error("Error fetching relations:", err);
  }
};
  
    restoreSessionAndCheckOnboard();
    fetchRoles();
    fetchRelations();
  }, [dispatch]);

const handleLogout = async () => {
    setLoggingOut(true);
      try {
        const res = await fetch(`${baseURL}/auth/logout`, {
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
            {organization?.name ? (organization.name.split(" ").map((word, index) => (
              <>
              <span key={index + word} className="inline-block">
                {word}
              </span><br key={index}></br>
              </>
            ))): "Org"}
          </div>
        </div>

        <nav className="flex flex-col gap-3 text-sm">
          <NavItem icon={<RiDashboardLine size={20} />} label="Dashboard" to="/dashboard" />
          <NavItem icon={<RiTeamLine size={20} />} label="Leave" to="/leave" />
          <NavItem icon={<RiSuitcase3Line size={20} />} label="Holiday" to="/holiday" />
          { (isAdmin || isHR) &&  (
              <NavItem icon={<RiBuildingLine size={20} />} label="Organization" to="/organization" />
          )}
        </nav>
      </motion.aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1">
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
        <main className="flex-1 overflow-y-auto hide-scroll bg-gray-100">
          <Toaster />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LmsLayout;