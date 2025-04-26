import { useState } from "react";
import { useChatContract, User } from "@/contexts/ChatContractContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, SendHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SendTokenFormProps {
  friend: User;
}

export const SendTokenForm = ({ friend }: SendTokenFormProps) => {
  const { sendTokensToFriend, tokenBalance } = useChatContract();
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (Number(amount) > Number(tokenBalance)) {
      setError("Insufficient balance");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await sendTokensToFriend(friend.userAddress, amount);

      if (result === true) {
        setAmount("");
        setOpen(false);
      } else if (typeof result === "object" && !result.success) {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error sending tokens:", err);
      setError("Failed to send tokens. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-xs"
        >
          <SendHorizontal className="h-3 w-3" />
          Send Tokens
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send CHAT Tokens</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient</Label>
            <div className="flex items-center p-2 border rounded-md bg-gray-50">
              <div className="flex gap-2 items-center">
                <div className="h-6 w-6 rounded-full bg-crypto-indigo text-white flex items-center justify-center text-xs">
                  {friend.name.substring(0, 1).toUpperCase()}
                </div>
                <span className="font-medium">{friend.name}</span>
              </div>
              <div className="ml-2 text-xs text-gray-500 truncate">
                {friend.userAddress.substring(0, 6)}...
                {friend.userAddress.substring(38)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">Amount</Label>
              <span className="text-xs text-gray-500">
                Balance: {parseFloat(tokenBalance).toFixed(2)} CHAT
              </span>
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
              step="0.01"
              min="0.01"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Tokens"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
