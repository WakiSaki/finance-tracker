import { Link, NavLink } from 'react-router-dom';

function Navbar() {
  const links = [
    { to: '/', label: 'Home' },
    { to: '/budgets', label: 'Budgets' },
  ];

  return (
    <nav className="mx-auto mb-6 flex w-full max-w-6xl items-center rounded-xl bg-slate-950/75 px-5 py-3 shadow-lg backdrop-blur-sm" aria-label="Main navigation">
      <Link className="mr-auto text-lg font-semibold text-white" to="/">
        Finance Tracker
      </Link>
      <div className="flex gap-1">
        {links.map(({ to, label }) => (
            <NavLink
              key={to}
              className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-emerald-500 text-slate-950' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
              to={to}
            >
              {label}
            </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
