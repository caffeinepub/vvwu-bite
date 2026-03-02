import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";

interface AdminContextType {
  isAdmin: boolean;
  isChecking: boolean;
  checkAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isChecking: false,
  checkAdmin: async () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { actor, isFetching } = useActor();

  const checkAdmin = useCallback(async () => {
    if (!actor) return;
    setIsChecking(true);
    try {
      const result = await actor.isCallerAdmin();
      setIsAdmin(result);
    } catch {
      setIsAdmin(false);
    } finally {
      setIsChecking(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor && !isFetching) {
      void checkAdmin();
    }
  }, [actor, isFetching, checkAdmin]);

  return (
    <AdminContext.Provider value={{ isAdmin, isChecking, checkAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
