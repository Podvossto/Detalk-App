import { useState, useEffect } from "react";
import { useChatContract } from "@/contexts/ChatContractContext";
import { Button } from "./ui/button";
import { Loader2, Coins } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const RequestTokenDialog = () => {
  const {
    tokenBalance,
    tokenCooldown,
    requestTokens,
    fetchCooldownTime,
    fetchTokenBalance,
  } = useChatContract();
  const [open, setOpen] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [localTokenBalance, setLocalTokenBalance] = useState(tokenBalance);

  // Update local token balance when global balance changes
  useEffect(() => {
    setLocalTokenBalance(tokenBalance);
  }, [tokenBalance]);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return "00:00:00";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [hours, minutes, remainingSeconds]
      .map((v) => (v < 10 ? "0" + v : v))
      .join(":");
  };

  // Update local countdown
  useEffect(() => {
    setCountdown(tokenCooldown);
  }, [tokenCooldown]);

  // Create countdown effect
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Refresh cooldown periodically when dialog is open
  useEffect(() => {
    if (!open) return;

    fetchCooldownTime();
    fetchTokenBalance();
    const interval = setInterval(() => {
      fetchCooldownTime();
      fetchTokenBalance();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [open, fetchCooldownTime, fetchTokenBalance]);

  const handleRequestTokens = async () => {
    setIsRequesting(true);
    try {
      const success = await requestTokens();

      if (success) {
        // Immediately fetch the updated token balance and use the returned value
        const newBalance = await fetchTokenBalance();

        // If we got a direct balance value from the fetch, use it
        if (newBalance) {
          setLocalTokenBalance(newBalance);
        } else {
          // Fallback to calculating the balance locally
          setLocalTokenBalance((prevBalance) => {
            const newBalance = (parseFloat(prevBalance) + 10).toString();
            return newBalance;
          });
        }

        // Only set countdown if the request was successful
        setCountdown(24 * 3600); // 24 hours in seconds
      }
    } catch (error) {
      console.error("Error requesting tokens:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Coins className="h-4 w-4" />
          <span>Get Tokens</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request CHAT Tokens</DialogTitle>
          <DialogDescription>
            Get free tokens to use in the chat application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Current Balance:</span>
              <span className="font-semibold text-crypto-indigo">
                {parseFloat(localTokenBalance).toFixed(2)} CHAT
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cooldown Period:</span>
              <span
                className={`font-mono ${
                  countdown > 0 ? "text-amber-600" : "text-green-600"
                }`}
              >
                {countdown > 0 ? formatTime(countdown) : "Ready"}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>You can request 10 CHAT tokens every 24 hours.</p>
            <p>
              Tokens are used to send messages and make transactions in the
              chat.
            </p>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleRequestTokens}
          disabled={isRequesting || countdown > 0}
        >
          {isRequesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Requesting Tokens...
            </>
          ) : countdown > 0 ? (
            "Cooldown Active"
          ) : (
            "Request 10 CHAT Tokens"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
