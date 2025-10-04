import React , {useEffect , useState} from 'react'
import type { RootState } from '@/lib/store/store'
import { useDispatch, useSelector } from 'react-redux'
import { setLeaveBalance } from '@/lib/store/slices/leaveSlice'
import { setLeaveTypes } from '@/lib/store/slices/organizationSlice'
import { toast } from 'sonner'
import type { LeaveBalance , LeaveTypes } from '@/lib/types/type'
import { RiLoader2Line } from '@remixicon/react'
import { getBackendURL } from '@/lib/utils'

const LeaveBalanceStats : React.FC = () => {
    const dispatch = useDispatch();
    const {leaveBalance} = useSelector((state: RootState) => state.leave);
    const { leave_types } = useSelector((state: RootState) => state.organization);
    const [loading, setLoading] = useState<boolean>(true);
    const baseURL = getBackendURL();

    const fetchLeaveTypes = async () => {
            setLoading(true);
            try {
              const res = await fetch(`${baseURL}/organization/leave-types`, { credentials: "include" });
              if (!res.ok) {
                const err = await res.json().catch(() => null);
                toast.error(err?.error || "Failed to load leave types");
                return;
              }
              const data: LeaveTypes[] = await res.json();
              dispatch(setLeaveTypes(data));
            } catch (err) {
              console.error("Load leave types error:", err);
              toast.error("Server error while loading leave types");
            } finally {
              setLoading(false);
            }
          };
        const fetchLeaveBalances = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${baseURL}/leave/leave-balances`, { credentials: "include" });
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            toast.error(err?.error || "Failed to load leave balances");
            return;
          }
          const data: LeaveBalance[] = await res.json();
          dispatch(setLeaveBalance(data));
        } catch (err) {
          console.error("Load leave balances error:", err);
          toast.error("Server error while loading leave balances");
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        fetchLeaveTypes();
        fetchLeaveBalances();
      }, []);

  return (
    <div>
            {
                loading && (
                <div className="flex items-center justify-center ">
                  <RiLoader2Line className="animate-spin text-ts12" size={26} />
                </div>
              )
            }
           {leaveBalance && leaveBalance.map((leaveBalance: LeaveBalance) => (
            <div key={leaveBalance.leave_balance_id}>
              <p>Leave Type Name: {leave_types.find(lt => lt.leave_type_id === leaveBalance.leave_type_id)?.name}</p>
              <p>Year: {leaveBalance.year}</p>
              <p>Total Allocated: {leaveBalance.total_allocated}</p>
              <p>Total Used: {leaveBalance.total_used}</p>
              <p>Remaining: {leaveBalance.remaining}</p>
              <br></br>
            </div>
           ))}
        </div>
  )
}

export default LeaveBalanceStats
