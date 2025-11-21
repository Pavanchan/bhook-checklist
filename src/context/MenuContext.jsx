import { createContext, useContext, useState } from "react";

const MenuContext = createContext(null);

export const MenuProvider = ({ children }) => {
  const [menu, setMenu] = useState(null);
  const [company, setCompany] = useState("Red-Brick"); // default

  return (
    <MenuContext.Provider value={{ menu, setMenu, company, setCompany }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
