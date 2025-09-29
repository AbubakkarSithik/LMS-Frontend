import React ,{useEffect , useState}  from 'react'
import { useNavigate } from "react-router-dom";
import { useDispatch , useSelector} from "react-redux";
import { setSession, clearSession } from "@/lib/store/slices/authSlice";
import { setAppUser } from "@/lib/store/slices/authSlice";
import { RiLoader2Line } from '@remixicon/react';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { session } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const restoreSessionAndCheckOnboard = async () => {
      try {
        const res = await fetch("http://localhost:4005/auth/restore", {
          credentials: "include",
        });
  
        if (res.ok) {
          const data = await res.json();
          dispatch(setSession(data));
          const onboardRes = await fetch("http://localhost:4005/users/me", {
            credentials: "include",
          });
  
          if (onboardRes.ok) {
            const appUser = await onboardRes.json();
            dispatch(setAppUser(appUser));
            if (appUser.organization_id && appUser.role_id !== 1001) {
                setIsAdmin(false);
            }else{
                setIsAdmin(true);
              }
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

if (!session) return null;

return (
    <div className='flex flex-col justify-center items-center font-manrope'>
       Finally Onboarded to {isAdmin ? "Admin" : "User"} Dashboarddddd!!!!!!!
    </div>
  )
}

export default DashboardLayout