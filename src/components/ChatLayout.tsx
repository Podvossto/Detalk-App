import { ReactNode } from "react";
import { Header } from "./Header";

interface ChatLayoutProps {
  children: ReactNode;
}

export const ChatLayout = ({ children }: ChatLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-white">
      <Header />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl h-auto pb-8">{children}</div>
      </div>
    </div>
  );
};
