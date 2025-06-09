"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import JSONPretty from "react-json-pretty";
import "./globals.css";
import { userAgentIsIOS, userAgentIsMobile } from "./utils/device";

// Dynamic import for JSONPretty with its CSS

const APP_ID = "0x486dD3B9C8DF7c9b263C75713c79EC1cf8F592F2";
const APP_SECRET =
  "0x1f86678fe5ec8c093e8647d5eb72a65b5b2affb7ee12b70f74e519a77b295887";

export default function Home() {
  console.log(`
  _    _                              _     _      _             _ 
 | |  | |                            | |   (_)    (_)           | |
 | |  | | ___      __ _ _ __ ___     | |__  _ _ __ _ _ __   __ _| |
 | |/\\| |/ _ \\    / _\` | '__/ _ \\    | '_ \\| | '__| | '_ \\ / _\` | |
 \\  /\\  /  __/   | (_| | | |  __/    | | | | | |  | | | | | (_| |_|
  \\/  \\/ \\___|    \\__,_|_|  \\___|    |_| |_|_|_|  |_|_| |_|\\__, (_)
                                                            __/ |  
                                                           |___/   
 
If you are here, we're hiring hackers like you - integration engineering. 
You will be looking at chrome devtools and building reclaim providers
 
Apply :
https://x.com/madhavanmalolan/status/1792949714813419792
`);

  const [url, setUrl] = useState("");
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const [showButton, setShowButton] = useState(true);

  const [myProviders, setMyProviders] = useState([]);

  const [selectedProviderId, setSelectedProviderId] = useState("");

  const [proofs, setProofs] = useState();

  const { width, height } = useWindowSize();


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  const getVerificationReq = async (providerId) => {
    try {
      setIsLoaded(true);
      setError(null);
      const reclaimClient = await ReclaimProofRequest.init(
        APP_ID,
        APP_SECRET,
        providerId,
        { log: false, acceptAiProviders: true,  }
      );
      const sessionId = reclaimClient.getSessionId();
      reclaimClient.setModalOptions({
        darkTheme: true,
      })
      await reclaimClient.triggerReclaimFlow();
      console.log("sessionId", sessionId);

      setShowButton(false);

      await reclaimClient.startSession({
        onSuccess: async (proof) => {
          console.log("Verification success", proof);
          // Your business logic here
          setProofs(proof);
          setShowQR(false);
          setIsLoaded(false);
          setError(null);
        },
        onError: (error) => {
          console.error("Verification failed", error);
          // Your business logic here to handle the error
          console.log("error", error);
          setIsLoaded(false);
          setError(`Verification failed: ${error.message || error}`);
        },
      });
    } catch (error) {
      console.error("Error in getVerificationReq", error);
      // Handle error gracefully, e.g., show a notification to the user
      // and possibly revert UI changes made before the error occurred
      setIsLoaded(false);
      setError(`Failed to initialize verification: ${error.message || error}`);
      setShowButton(true);
    }
  };

  const handleButtonClick = (providerId) => {
    setIsCopied(false);
    setProofs(null);
    setError(null);
    getVerificationReq(providerId);
  };

  useEffect(() => {
    let details = navigator.userAgent;
    let regexp = /android|iphone|kindle|ipad/i;

    let isMobileDevice = regexp.test(details);

    if (isMobileDevice) {
      setIsMobileDevice(true);
    } else {
      setIsMobileDevice(false);
    }
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(
          "https://api.reclaimprotocol.org/api/providers/verified"
        );
        const data = await response.json();
        if (data.providers) {
          const formattedProviders = data.providers.map((provider) => ({
            name: provider.name,
            providerId: provider.httpProviderId,
          }));
          console.log("formattedProviders", formattedProviders);
          setMyProviders(formattedProviders);
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
      }
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    if (proofs) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // 10 seconds
    }
  }, [proofs]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0f172a] text-white">
      <header className="bg-[#1e293b] py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <img
            src="https://avatars.githubusercontent.com/u/130321117?s=200&v=4"
            alt="Reclaim Protocol Logo"
            width={40}
            height={40}
            priority
            className="rounded-full"
          />
          <nav className="flex space-x-6">
            <a
              href="https://docs.reclaimprotocol.org/"
              className="text-white hover:text-blue-400 transition duration-300"
            >
              Docs
            </a>
            <a
              href="https://github.com/reclaimprotocol"
              className="text-white hover:text-blue-400 transition duration-300"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Reclaim Protocol Demo
          </h1>
          <p className="text-xl mb-12 text-center text-gray-300">
            Import user data from any Web Application
          </p>

          <div className="flex flex-col lg:flex-row gap-12 mb-16">
            <div className="bg-[#1e293b] p-8 rounded-lg shadow-xl order-2 lg:order-1 lg:w-1/2">
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                What is Reclaim Protocol?
              </h2>
              <p className="mb-4 text-gray-300">
                Reclaim Protocol is a privacy-preserving protocol that enables
                users to prove their data from centralized platforms without
                revealing the actual data.
              </p>
              <p className="mb-4 text-gray-300">With Reclaim, you can:</p>
              <ul className="list-disc list-inside mb-4 text-gray-300">
                <li>Prove ownership of online accounts</li>
                <li>
                  Verify credentials without revealing sensitive information
                </li>
                <li>Integrate with various web2 and web3 platforms</li>
              </ul>
              <a
                href="https://www.reclaimprotocol.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Learn More
              </a>
            </div>

            <div className="bg-[#1e293b] p-8 rounded-lg shadow-xl order-1 lg:order-2 lg:w-1/2">
              <h2 className="text-2xl font-semibold mb-4 text-blue-300">
                Try it out
              </h2>
              <select
                value={selectedProviderId}
                onChange={(e) => {
                  setSelectedProviderId(e.target.value);
                  setShowQR(false);
                  setShowButton(false);
                  setError(null);
                  setIsLoaded(true);
                  handleButtonClick(e.target.value);
                }}
                className="w-full px-4 py-2 text-lg text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
              >
                <option value="" disabled>
                  Select a provider
                </option>
                {myProviders.map((provider) => (
                  <option key={provider.providerId} value={provider.providerId}>
                    {provider.name}
                  </option>
                ))}
              </select>

              {isLoaded && (
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-gray-300 text-sm">Processing verification...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <h4 className="text-red-400 font-semibold">Error</h4>
                  </div>
                  <p className="text-red-300 mt-2">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setSelectedProviderId("");
                      setShowButton(true);
                    }}
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition duration-300"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>

          {proofs && (
            <div className="bg-[#1e293b] p-6 rounded-lg shadow-xl mt-6">
              <h3 className="text-2xl font-semibold mb-4 text-blue-300">
                Proofs Received
              </h3>
              <div className="bg-[#0f172a] p-4 rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto pr-4">
                  <JSONPretty
                    id="json-pretty"
                    data={proofs?.claimData}
                    theme={{
                      main: "line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;",
                      error:
                        "line-height:1.3;color:#66d9ef;background:#272822;overflow:auto;",
                      key: "color:#f92672;",
                      string: "color:#fd971f;",
                      value: "color:#a6e22e;",
                      boolean: "color:#ac81fe;",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {showConfetti && <Confetti width={width} height={height} />}
        </div>
      </main>

      <footer className="bg-[#1e293b] text-white py-6">
        <div className="container mx-auto px-4">
          <div className="mt-4 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} Reclaim Protocol. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export const runtime = "edge";
