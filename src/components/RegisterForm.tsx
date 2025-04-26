import { useState } from "react";
import { useChatContract } from "@/contexts/ChatContractContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

export const RegisterForm = () => {
  const { registerUser, currentAccount } = useChatContract();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
      toast.error("Please enter a valid name (at least 2 characters)");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await registerUser(name);
      if (!success) {
        toast.error("Failed to register. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="dark:text-white">
          Display Name
        </Label>
        <Input
          id="name"
          placeholder="Enter your display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          disabled={isSubmitting}
          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="dark:text-white">
          Wallet Address
        </Label>
        <Input
          id="address"
          value={currentAccount || ""}
          disabled
          className="bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This is your connected MetaMask address
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-crypto hover:opacity-90"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
        This will create a transaction on the blockchain
      </div>
    </form>
  );
};
