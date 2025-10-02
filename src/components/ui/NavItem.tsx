import { useLocation, useNavigate } from "react-router-dom";
const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  to: string;
}> = ({ icon, label, to }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = location.pathname === to;

  return (
    <button
      onClick={() => navigate(to)}
      aria-label={label}
      disabled={isActive}
      className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition duration-300 ease-in-out
        ${isActive ? "bg-white text-ts12 font-semibold shadow-md" : "text-white hover:text-orange-200 hover:scale-105"}
      `}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
};

export default NavItem;