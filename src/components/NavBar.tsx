import '../styles/NavBar.css';

import { Link } from 'react-router-dom';
// import { Location } from "react-router";
// import { withRouter } from "../hooks/withRouter";

const navItems = [
  { path: '/editor', name: 'Editor' },
  { path: '/versus', name: 'Player Selection' },
  { path: '/game', name: 'Play Offline' },
  { path: '/live', name: 'Play Online' },
  { path: '/docs', name: 'Rules & Documentation' },
];

type NavBarProps = {
  children?: React.ReactNode;
};

export const NavBar = ({ children }: NavBarProps) => {
  return <div className="navbar">{children}</div>;
};

type WithNavigationProps = {
  children?: React.ReactNode;
  // location?: Location;
};

function WithNavigation(props: WithNavigationProps) {
  return (
    <div className="with-nav">
      <NavBar>
        {navItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className="nav-item"
            // className={
            //   "nav-item" +
            //   (props?.location?.pathname === item.path ? " nav-item-focus" : "")
            // }
          >
            {item.name}
          </Link>
        ))}
      </NavBar>

      <div className="with-nav-content">{props.children}</div>
    </div>
  );
}

// const NavBarRouter = withRouter(WithNavigation);

export default WithNavigation;
