import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useChatContract } from "@/contexts/ChatContractContext";
import {
  Loader2,
  LogIn,
  Shield,
  Lock,
  Clock,
  Globe,
  BarChart,
  Users,
  MessageSquare,
  Code,
  Zap,
  Vote,
  Network,
  Download,
  ExternalLink,
  CheckCircle,
  GitBranch,
  User,
} from "lucide-react";
import { RegisterForm } from "@/components/RegisterForm";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const { loading, isRegistered, connectWallet, currentAccount } =
    useChatContract();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isRegistered) {
      navigate("/chat");
    }
  }, [isRegistered, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header Navigation */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="h-8">
              {theme === "dark" ? (
                <img
                  src="/Detalk-App/pictures/DeTalk-LightLogo.png"
                  alt="DeTalk Logo"
                  className="h-full px-5"
                  style={{ transform: "scale(2)" }}
                />
              ) : (
                <img
                  src="/Detalk-App/pictures/DeTalk-DarkLogo.png"
                  alt="DeTalk Logo"
                  className="h-full px-5"
                  style={{ transform: "scale(2)" }}
                />
              )}
            </div>
            <nav className="hidden md:flex gap-6">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#mission"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Mission
              </a>
              <a
                href="#developers"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Developers
              </a>
            </nav>
          </div>
          {/* <div className="flex items-center gap-4">
            {!currentAccount && (
              <Button onClick={connectWallet} variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </div> */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl space-y-6">
              <div className="inline-block px-3 py-1 text-sm rounded-full bg-primary/10 text-primary mb-2">
                Created By Group 5
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tighter">
                The decentralized blockchain messaging platform
              </h1>
              <p className="text-xl text-muted-foreground">
                A web3-powered secure messaging app that leverages blockchain
                technology for verified identity and encrypted communications on
                the Ethereum network.
              </p>

              <div className="pt-4">
                <Button
                  onClick={() => !loading && !currentAccount && connectWallet()}
                  disabled={!!loading || !!currentAccount}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : currentAccount ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Wallet Connected
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Start Chatting
                    </>
                  )}
                </Button>
              </div>
            </div>

            {currentAccount && !isRegistered ? (
              <Card className="shadow-md max-w-md mx-auto w-full">
                <CardHeader>
                  <CardTitle>Create Your Profile</CardTitle>
                  <CardDescription>
                    Set up your DeTalk identity to start messaging
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RegisterForm />
                </CardContent>
              </Card>
            ) : (
              <div className="bg-green-100 rounded-lg p-4 inline-block shadow-lg">
                <div className="flex items-center justify-center space-x-2">
                  <MessageSquare className="h-12 w-12 text-green-500" />
                  <p className="text-xl font-bold text-green-800">
                    You are already connected to the wallet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Mission</h2>
            <p className="text-xl text-muted-foreground">
              To build an open and decentralized platform where users can
              communicate securely with blockchain technology, preserving
              privacy and ownership of data.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Privacy by Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  End-to-end encryption secures all communications with
                  blockchain verification.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Decentralized Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built on blockchain technology to ensure message integrity and
                  security.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Community Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with trusted communities on a platform designed for
                  genuine interaction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Features</h2>
            <p className="text-xl text-muted-foreground">
              DeTalk combines blockchain security with intuitive messaging to
              create a trusted communication platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Blockchain Security</h3>
              <p className="text-muted-foreground">
                All messages are secured using blockchain technology, making
                them immutable and verifiable.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Token Faucet</h3>
              <p className="text-muted-foreground">
                Get test tokens to interact with our platform and experience
                blockchain-based messaging.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Transaction History</h3>
              <p className="text-muted-foreground">
                View your complete messaging transaction history on the
                blockchain with full transparency.
              </p>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Private Messaging</h3>
              <p className="text-muted-foreground">
                Exchange messages directly with other users with full end-to-end
                encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Developers Section */}
      <section id="developers" className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Meet the Developers</h2>
            <p className="text-xl text-muted-foreground">
              Our team of talented developers behind DeTalk
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary/20">
                      <User className="h-12 w-12 text-primary" />
                    </AvatarFallback>
                    {/* Image will be added later */}
                    <AvatarImage
                      src="/Detalk-App/pictures/PitchayaProfile.jpg"
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        objectPosition: "top center",
                        overflow: "hidden",
                        display: "block",
                      }}
                    />
                  </Avatar>
                </div>
                <CardTitle>พิชยะ หุตะจูฑะ</CardTitle>
                <CardDescription>Student ID: 65051645</CardDescription>
              </CardHeader>
              <CardContent>
                {/* <p className="text-muted-foreground">Full-stack Developer</p> */}
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary/20">
                      <User className="h-12 w-12 text-primary" />
                    </AvatarFallback>
                    {/* Image will be added later */}
                    <AvatarImage
                      src="/Detalk-App/pictures/PitchayapaProfile.jpg"
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        objectPosition: "top center",
                        overflow: "hidden",
                        display: "block",
                      }}
                    />
                  </Avatar>
                </div>
                <CardTitle>พิชญาภา บุญถนอม</CardTitle>
                <CardDescription>Student ID: 65073814</CardDescription>
              </CardHeader>
              <CardContent>
                {/* <p className="text-muted-foreground">UI/UX Designer</p> */}
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary/20">
                      <User className="h-12 w-12 text-primary" />
                    </AvatarFallback>
                    {/* Image will be added later */}
                    <AvatarImage
                      src="/Detalk-App/pictures/PiyakitProfile.jpg"
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        objectPosition: "top center",
                        overflow: "hidden",
                        display: "block",
                      }}
                    />
                  </Avatar>
                </div>
                <CardTitle>ปิยย์กฤษณ์ วงศ์เกษมศักดิ์</CardTitle>
                <CardDescription>Student ID: 65054924</CardDescription>
              </CardHeader>
              <CardContent>
                {/* <p className="text-muted-foreground">
                  Smart Contract Developer
                </p> */}
              </CardContent>
            </Card>
          </div>

          <div className="max-w-xl mx-auto mt-16 text-center">
            <h3 className="text-xl font-bold mb-6">Project Resources</h3>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline">
                <a
                  href="https://github.com/Podvossto/Detalk-App.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  GitHub Repository
                </a>
              </Button>
              <Button variant="outline">
                <a
                  href="https://drive.google.com/drive/folders/1fuVhPitpmUl70T6XjPKeeWY9Iar1_TqP?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Code className="mr-2 h-4 w-4" />
                  Google Drive
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Download/Start Using Section */}
      {/* <section className="py-20 bg-primary/5">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Start Using DeTalk Today</h2>
            <p className="text-xl text-muted-foreground">
              Connect your wallet and start secure blockchain-based messaging in
              seconds.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() =>
                  loading
                    ? null
                    : currentAccount
                    ? isRegistered
                      ? navigate("/chat")
                      : null
                    : connectWallet()
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Index;
