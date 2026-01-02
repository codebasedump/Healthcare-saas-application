import { useState, useRef, useEffect } from 'react';

export default function CardMenu({ actions = [] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  return (
    <div className="position-relative" ref={menuRef}>
      <button
        className="btn btn-sm btn-light border-0"
        onClick={() => setOpen(!open)}
        style={{ fontSize: '1.2rem' }}
      >
        ⋮
      </button>
      {open && (
        <ul className="dropdown-menu show position-absolute end-0 mt-2 shadow-sm" style={{ zIndex: 1000 }}>
          {actions.map((action, idx) => (
            <li key={idx}>
              <button className="dropdown-item" onClick={action.onClick}>
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}