import { useState, useEffect, useRef } from "react";
import { useChatContract, User, Message } from "@/contexts/ChatContractContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Loader2, SendIcon, Clock, Coins } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { SendTokenForm } from "./SendTokenForm";

interface ChatWindowProps {
  friend: User;
}

export const ChatWindow = ({ friend }: ChatWindowProps) => {
  const { getMessages, sendMessage, currentAccount } = useChatContract();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    if (!friend) return;

    setIsLoading(true);
    try {
      const messageList = await getMessages(friend.userAddress);
      setMessages(messageList);

      // Scroll to bottom after messages load
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();

    // Set up interval to refresh messages
    const interval = setInterval(loadMessages, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [friend]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    setIsSending(true);

    try {
      const result = await sendMessage(friend.userAddress, messageInput);

      if (result === true) {
        setMessageInput("");
        await loadMessages();
      } else if (typeof result === "object" && result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    return format(new Date(timestamp * 1000), "MMM d, yyyy h:mm a");
  };

  // Check if a message is a system message (like token transfers)
  const isSystemMessage = (message: Message): boolean => {
    return message.content.startsWith("SYSTEM:");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center dark:bg-gray-800">
        <div className="h-10 w-10 rounded-full bg-crypto-indigo text-white flex items-center justify-center mr-3">
          {friend.name.substring(0, 1).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold dark:text-white">
            {friend.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {friend.userAddress}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <SendTokenForm friend={friend} />
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMessages}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-xs">Refresh</span>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Loader2 className="h-8 w-8 animate-spin text-crypto-indigo" />
          <span className="ml-2 dark:text-gray-300">Loading messages...</span>
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4 dark:bg-gray-900" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <p>No messages yet. Send the first message!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const isCurrentUser =
                  msg.sender.toLowerCase() === currentAccount?.toLowerCase();
                const isSystem = isSystemMessage(msg);

                // For system messages, display them differently
                if (isSystem) {
                  return (
                    <div key={index} className="flex justify-center">
                      <div className="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-full flex items-center border border-amber-200 dark:border-amber-800 max-w-[90%]">
                        <Coins className="h-4 w-4 mr-2" />
                        <p className="text-sm font-medium">
                          {msg.content.replace("SYSTEM: ", "")}
                        </p>
                      </div>
                    </div>
                  );
                }

                // For regular user messages
                return (
                  <div
                    key={index}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        isCurrentUser
                          ? "bg-crypto-indigo text-white rounded-br-none"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <div
                        className={`flex items-center text-xs mt-1 ${
                          isCurrentUser
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      )}

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 dark:border-gray-700 flex dark:bg-gray-800"
      >
        <Input
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          disabled={isSending}
          className="flex-1 mr-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <Button
          type="submit"
          disabled={isSending || !messageInput.trim()}
          className="bg-crypto-indigo hover:bg-crypto-purple"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendIcon className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};
